import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { ExerciseType, BiomechanicalProfile, ViewMode } from '../hooks/useWorkoutAI';
import '../types';

// --- Utilities ---

// Blue (Low) -> Dark Blue (High) -> Purple (Peak)
const updateMuscleColor = (material: THREE.MeshPhysicalMaterial, activation: number) => {
    const lowColor = new THREE.Color("#93c5fd"); // Light Blue 300
    const midColor = new THREE.Color("#2563eb"); // Blue 600
    const highColor = new THREE.Color("#1e3a8a"); // Blue 900
    const peakColor = new THREE.Color("#581c87"); // Purple 900

    // Interpolate
    if (activation < 0.5) {
        material.color.lerpColors(lowColor, midColor, activation * 2);
        material.emissive.lerpColors(new THREE.Color(0,0,0), new THREE.Color(0,0,0.2), activation);
    } else if (activation < 0.85) {
        material.color.lerpColors(midColor, highColor, (activation - 0.5) * 2.8);
        material.emissive.copy(highColor);
    } else {
        material.color.lerpColors(highColor, peakColor, (activation - 0.85) * 6.6);
        material.emissive.copy(peakColor);
    }
    
    // Dynamic Emissive Intensity based on load
    material.emissiveIntensity = activation * 2.0;
};

// --- Components ---

const MuscleLabel = ({ position, name, value, isVisible }: { position: THREE.Vector3, name: string, value: number, isVisible: boolean }) => {
  // Smooth visibility transition could be added here with spring, but basic conditional render is performant
  if (!isVisible) return null;
  
  return (
    <Html position={position} center zIndexRange={[100, 0]} distanceFactor={8}>
       <div className="pointer-events-none select-none flex flex-col items-center transition-opacity duration-200">
          <div className={`w-2 h-2 rounded-full mb-1 shadow-[0_0_8px_rgba(59,130,246,0.8)] ${value > 0.9 ? 'bg-purple-400 animate-pulse' : 'bg-blue-400'}`}></div>
          <div className="bg-[#0f172a]/80 backdrop-blur-md border border-blue-500/30 px-2 py-1 rounded text-[8px] font-mono text-center shadow-xl">
             <div className="text-blue-200 uppercase tracking-wider text-[7px] font-bold">{name}</div>
             <div className="text-white font-bold tabular-nums">{(value * 100).toFixed(0)}%</div>
          </div>
       </div>
    </Html>
  );
};

interface MuscleSegmentProps {
    muscleId: string;
    profile: BiomechanicalProfile;
    phase: number; 
    loadFactor: number;
    args: [number, number]; 
    position: [number, number, number];
    rotation?: [number, number, number];
    labelOffset?: [number, number, number];
    viewMode: ViewMode;
    registerActivation: (id: string, val: number) => void;
    topMuscles: string[];
}

const MuscleSegment: React.FC<MuscleSegmentProps> = ({ 
    muscleId, profile, phase, loadFactor, args, position, rotation=[0,0,0], labelOffset=[0,0,0], viewMode, registerActivation, topMuscles
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
    const muscleDef = profile.muscles[muscleId];
    
    // Calculate Activation
    const activation = useMemo(() => {
        if (!muscleDef) return 0.05; 
        
        // phase 0 = Start, 1 = Midpoint, 0 = End
        // We need to map phase 0->1 to Curve[0]->Curve[1]
        // But our loop goes 0->1->0. 
        // On way up (0->1): Eccentric usually
        // On way down (1->0): Concentric usually
        // Simplified: We interpolate between Start/Mid based on phase value 
        // (Since phase is a simple sin wave 0..1..0, we assume symmetry for this demo)
        
        const val = THREE.MathUtils.lerp(muscleDef.curve[0], muscleDef.curve[1], phase);
        return Math.min(1, Math.max(0.05, val * loadFactor));
    }, [muscleDef, phase, loadFactor]);

    // Report activation to parent for sorting top-K
    useEffect(() => {
        if (muscleDef) registerActivation(muscleId, activation);
    }, [activation, muscleId, registerActivation]);

    useFrame(() => {
        if (materialRef.current) {
            updateMuscleColor(materialRef.current, activation);
        }
        if (meshRef.current) {
            // Subtle "pump" effect
            const pump = 1 + (activation * 0.08);
            meshRef.current.scale.set(pump, pump, pump);
        }
    });

    const showLabel = viewMode === 'DETAIL' && topMuscles.includes(muscleId);

    return (
        <group position={position} rotation={rotation as any}>
            <mesh ref={meshRef}>
                <capsuleGeometry args={[args[0], args[1], 8, 16]} />
                <meshPhysicalMaterial 
                    ref={materialRef}
                    color="#93c5fd" 
                    roughness={0.4} 
                    metalness={0.2}
                    clearcoat={0.5}
                    transparent
                    opacity={1}
                />
            </mesh>
            
            {muscleDef && (
                <MuscleLabel 
                    position={new THREE.Vector3(...labelOffset)}
                    name={muscleDef.name} 
                    value={activation}
                    isVisible={showLabel}
                />
            )}
        </group>
    );
};

const JointNode = ({ position, radius=0.12 }: { position: [number, number, number], radius?: number }) => (
    <mesh position={position}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.5} />
    </mesh>
);

// --- Procedural Rig ---

interface MannequinProps {
    exercise: ExerciseType;
    profile: BiomechanicalProfile;
    load: number;
    isPlaying: boolean;
    speed: number;
    viewMode: ViewMode;
}

export const MuscleMannequin: React.FC<MannequinProps> = ({ exercise, profile, load, isPlaying, speed, viewMode }) => {
    const groupRef = useRef<THREE.Group>(null);
    const [simTime, setSimTime] = useState(0);
    const phaseRef = useRef(0); // 0..1 cycle

    // Activation Tracking for Top-K Labels
    const activationsRef = useRef<Record<string, number>>({});
    const [topMuscles, setTopMuscles] = useState<string[]>([]);

    // Update Top-K every few frames to avoid jitter
    useEffect(() => {
        const interval = setInterval(() => {
            const sorted = Object.entries(activationsRef.current)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3) // Top 3 muscles
                .map(([id]) => id);
            setTopMuscles(sorted);
        }, 200); // 5Hz update for labels
        return () => clearInterval(interval);
    }, []);

    const registerActivation = (id: string, val: number) => {
        activationsRef.current[id] = val;
    };

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        
        if (isPlaying) {
            setSimTime(prev => prev + delta * speed * 2.5);
        }
        
        // Cycle: 0 (Start) -> 1 (Peak) -> 0 (Start)
        const cycle = (Math.sin(simTime) + 1) / 2; 
        phaseRef.current = cycle;

        // --- Procedural Animation ---
        
        const pose = {
            root: { pos: [0, 0, 0], rot: [0, 0, 0] },
            torso: { rot: [0, 0, 0] },
            head: { rot: [0, 0, 0] },
            uArmL: { rot: [0, 0, 0.2] }, uArmR: { rot: [0, 0, -0.2] },
            lArmL: { rot: [0, 0, 0] }, lArmR: { rot: [0, 0, 0] },
            thighL: { rot: [0, 0, 0] }, thighR: { rot: [0, 0, 0] },
            shinL: { rot: [0, 0, 0] }, shinR: { rot: [0, 0, 0] },
            footL: { rot: [0, 0, 0] }, footR: { rot: [0, 0, 0] },
        };

        if (exercise === 'SQUAT') {
            const depth = cycle; 
            // Hips drop
            pose.root.pos = [0, -0.8 * depth, 0];
            // Torso leans forward to counterbalance
            pose.torso.rot = [0.6 * depth, 0, 0]; 
            // Head stays up
            pose.head.rot = [-0.4 * depth, 0, 0];
            
            // Legs
            pose.thighL.rot = [-1.6 * depth, 0, 0.2]; 
            pose.thighR.rot = [-1.6 * depth, 0, -0.2];
            pose.shinL.rot = [1.6 * depth, 0, 0];
            pose.shinR.rot = [1.6 * depth, 0, 0];
            pose.footL.rot = [-0.3 * depth, 0, 0]; // Ankle dorsiflexion
            pose.footR.rot = [-0.3 * depth, 0, 0];

            // Arms holding bar on back
            pose.uArmL.rot = [0, 0, 1.4];
            pose.uArmR.rot = [0, 0, -1.4];
            pose.lArmL.rot = [2.5, 0, 0];
            pose.lArmR.rot = [2.5, 0, 0];

        } else if (exercise === 'BENCH_PRESS') {
            const depth = cycle; // 0 = Top (Lockout), 1 = Chest
            
            // Lay flat
            pose.root.pos = [0, 0.5, 0];
            pose.root.rot = [-Math.PI / 2, 0, 0]; 
            
            // Legs planted for stability
            pose.thighL.rot = [-0.8, 0.3, 0.3];
            pose.thighR.rot = [-0.8, -0.3, -0.3];
            pose.shinL.rot = [1.2, 0, 0];
            pose.shinR.rot = [1.2, 0, 0];

            // Arms Motion
            // Start (Lockout): Arms vertical
            // End (Chest): Elbows flared/down
            const armAngle = THREE.MathUtils.lerp(0, -0.8, depth); // Shoulder extension
            const flare = THREE.MathUtils.lerp(1.5, 1.2, depth); // Elbow flare

            pose.uArmL.rot = [0, armAngle, flare];
            pose.uArmR.rot = [0, -armAngle, -flare];
            
            // Forearms stay vertical relative to world Z (which is up relative to torso here)
            // Simplified FK
            pose.lArmL.rot = [-1.5 + (0.8 * depth), 0, 0];
            pose.lArmR.rot = [-1.5 + (0.8 * depth), 0, 0];

        } else if (exercise === 'DEADLIFT') {
            const depth = cycle; // 0 = Standing, 1 = Floor
            
            // Root drops and shifts back
            pose.root.pos = [0, -0.5 * depth, -0.3 * depth];
            // Heavy torso hinge
            pose.torso.rot = [1.4 * depth, 0, 0]; 
            // Head up
            pose.head.rot = [-0.8 * depth, 0, 0];
            
            // Hips flex, knees flex less than squat
            pose.thighL.rot = [-0.8 * depth, 0, 0.1];
            pose.thighR.rot = [-0.8 * depth, 0, -0.1];
            
            pose.shinL.rot = [0.4 * depth, 0, 0];
            pose.shinR.rot = [0.4 * depth, 0, 0];
            
            // Arms hang straight down
            // Since torso rotates 1.4, arms must rotate -1.4 relative to torso to stay vertical
            pose.uArmL.rot = [-1.4 * depth + 0.1, 0, 0.1];
            pose.uArmR.rot = [-1.4 * depth + 0.1, 0, -0.1];
        }

        // --- Apply Pose ---
        const lerpFactor = 0.15;
        const r = groupRef.current;
        
        const apply = (name: string, rot: number[]) => {
            const obj = r?.getObjectByName(name);
            if (obj) {
                obj.rotation.x = THREE.MathUtils.lerp(obj.rotation.x, rot[0], lerpFactor);
                obj.rotation.y = THREE.MathUtils.lerp(obj.rotation.y, rot[1], lerpFactor);
                obj.rotation.z = THREE.MathUtils.lerp(obj.rotation.z, rot[2], lerpFactor);
            }
        };

        if(r) {
            r.position.lerp(new THREE.Vector3(...(pose.root.pos as [number,number,number])), lerpFactor);
            r.rotation.x = THREE.MathUtils.lerp(r.rotation.x, pose.root.rot[0], lerpFactor);
            
            apply('Torso', pose.torso.rot);
            apply('Head', pose.head.rot);
            apply('ThighL', pose.thighL.rot); apply('ThighR', pose.thighR.rot);
            apply('ShinL', pose.shinL.rot); apply('ShinR', pose.shinR.rot);
            apply('FootL', pose.footL.rot); apply('FootR', pose.footR.rot);
            apply('UArmL', pose.uArmL.rot); apply('UArmR', pose.uArmR.rot);
            apply('LArmL', pose.lArmL.rot); apply('LArmR', pose.lArmR.rot);
        }
    });

    const commonProps = {
        profile, 
        phase: phaseRef.current, 
        loadFactor: load,
        viewMode,
        registerActivation,
        topMuscles
    };

    return (
        <group ref={groupRef}>
            {/* HIPS */}
            <group name="Hips">
                <mesh>
                    <boxGeometry args={[0.55, 0.25, 0.3]} />
                    <meshStandardMaterial color="#1e293b" />
                </mesh>
                
                <MuscleSegment muscleId="glutes" {...commonProps} 
                    position={[0, 0.1, -0.2]} rotation={[0.3, 0, Math.PI/2]} args={[0.2, 0.45]} labelOffset={[0, 0.4, -0.2]} />
                
                {/* TORSO HIERARCHY */}
                <group name="Torso" position={[0, 0.12, 0]}>
                    {/* Spine Column */}
                    <mesh position={[0, 0.6, -0.05]}>
                        <boxGeometry args={[0.3, 1.2, 0.2]} />
                        <meshStandardMaterial color="#334155" />
                    </mesh>

                    <MuscleSegment muscleId="core" {...commonProps} 
                        position={[0, 0.55, 0.12]} args={[0.2, 0.9]} labelOffset={[0, 0, 0.5]} />
                    <MuscleSegment muscleId="erector" {...commonProps} 
                        position={[0, 0.6, -0.15]} args={[0.15, 1.0]} labelOffset={[0, 0, -0.5]} />
                    
                    {/* UPPER CHEST / SHOULDERS */}
                    <group position={[0, 1.1, 0]}>
                         <MuscleSegment muscleId="pecs" {...commonProps} 
                            position={[0, 0.2, 0.15]} rotation={[0, 0, Math.PI/2]} args={[0.22, 0.55]} labelOffset={[0, 0.2, 0.5]} />
                         <MuscleSegment muscleId="lats" {...commonProps} 
                            position={[0, -0.2, -0.15]} rotation={[0, 0, Math.PI/2]} args={[0.2, 0.6]} labelOffset={[0, 0, -0.5]} />
                         <MuscleSegment muscleId="traps" {...commonProps} 
                            position={[0, 0.45, -0.1]} rotation={[0, 0, Math.PI/2]} args={[0.12, 0.4]} />
                         
                         <group name="Head" position={[0, 0.7, 0]}>
                             <mesh>
                                 <sphereGeometry args={[0.2]} />
                                 <meshStandardMaterial color="#475569" />
                             </mesh>
                         </group>

                         {/* ARMS */}
                         <group name="UArmL" position={[0.35, 0.25, 0]}>
                             <JointNode position={[0,0,0]} />
                             <MuscleSegment muscleId="delts_front" {...commonProps} 
                                position={[0.08, 0, 0]} args={[0.13, 0.25]} />
                             <MuscleSegment muscleId="triceps" {...commonProps} 
                                position={[0, -0.35, -0.06]} args={[0.1, 0.55]} labelOffset={[0.2, 0, 0]} />
                             
                             <group name="LArmL" position={[0, -0.7, 0]}>
                                 <JointNode position={[0,0,0]} radius={0.09} />
                                 <mesh position={[0, -0.4, 0]}>
                                     <capsuleGeometry args={[0.08, 0.7, 4, 8]} />
                                     <meshStandardMaterial color="#475569" />
                                 </mesh>
                                 {/* Hand */}
                                 <mesh position={[0, -0.85, 0]}>
                                     <boxGeometry args={[0.1, 0.12, 0.1]} />
                                     <meshStandardMaterial color="#94a3b8" />
                                 </mesh>
                             </group>
                         </group>

                         <group name="UArmR" position={[-0.35, 0.25, 0]}>
                             <JointNode position={[0,0,0]} />
                             <MuscleSegment muscleId="delts_front" {...commonProps} 
                                position={[-0.08, 0, 0]} args={[0.13, 0.25]} />
                             <MuscleSegment muscleId="triceps" {...commonProps} 
                                position={[0, -0.35, -0.06]} args={[0.1, 0.55]} />
                             
                             <group name="LArmR" position={[0, -0.7, 0]}>
                                 <JointNode position={[0,0,0]} radius={0.09} />
                                 <mesh position={[0, -0.4, 0]}>
                                     <capsuleGeometry args={[0.08, 0.7, 4, 8]} />
                                     <meshStandardMaterial color="#475569" />
                                 </mesh>
                                 <mesh position={[0, -0.85, 0]}>
                                     <boxGeometry args={[0.1, 0.12, 0.1]} />
                                     <meshStandardMaterial color="#94a3b8" />
                                 </mesh>
                             </group>
                         </group>
                    </group>
                </group>
            </group>

            {/* LEGS */}
            <group name="ThighL" position={[0.25, 0, 0]}>
                <JointNode position={[0,0,0]} />
                <MuscleSegment muscleId="quads" {...commonProps} 
                    position={[0, -0.6, 0.1]} args={[0.16, 1.1]} labelOffset={[0.3, 0, 0.2]} />
                <MuscleSegment muscleId="hams" {...commonProps} 
                    position={[0, -0.6, -0.1]} args={[0.14, 1.1]} labelOffset={[0.3, 0, -0.2]} />
                
                <group name="ShinL" position={[0, -1.2, 0]}>
                    <JointNode position={[0,0,0]} />
                    <MuscleSegment muscleId="calves" {...commonProps} 
                        position={[0, -0.5, -0.05]} args={[0.11, 0.9]} />
                    
                    <group name="FootL" position={[0, -1.1, 0.1]}>
                         <mesh>
                             <boxGeometry args={[0.15, 0.08, 0.4]} />
                             <meshStandardMaterial color="#334155" />
                         </mesh>
                    </group>
                </group>
            </group>

            <group name="ThighR" position={[-0.25, 0, 0]}>
                <JointNode position={[0,0,0]} />
                <MuscleSegment muscleId="quads" {...commonProps} 
                    position={[0, -0.6, 0.1]} args={[0.16, 1.1]} />
                <MuscleSegment muscleId="hams" {...commonProps} 
                    position={[0, -0.6, -0.1]} args={[0.14, 1.1]} />
                
                <group name="ShinR" position={[0, -1.2, 0]}>
                    <JointNode position={[0,0,0]} />
                    <MuscleSegment muscleId="calves" {...commonProps} 
                        position={[0, -0.5, -0.05]} args={[0.11, 0.9]} />
                    
                    <group name="FootR" position={[0, -1.1, 0.1]}>
                         <mesh>
                             <boxGeometry args={[0.15, 0.08, 0.4]} />
                             <meshStandardMaterial color="#334155" />
                         </mesh>
                    </group>
                </group>
            </group>

            {/* EXERCISE PROPS */}
            {exercise === 'BENCH_PRESS' && (
                <group position={[0, 0.3, 0]}>
                    {/* Bench */}
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[0.8, 0.1, 2.5]} />
                        <meshStandardMaterial color="#0f172a" />
                    </mesh>
                </group>
            )}

        </group>
    );
};
