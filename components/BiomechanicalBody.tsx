import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Tube, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { ExerciseType, BiomechanicalProfile, ViewMode, MuscleDefinition } from '../hooks/useWorkoutAI';
import '../types';

// --- Color Dynamics ---
// Palette: Light Blue (Rest) -> Deep Blue (Active) -> Green (Peak)
const getActivationColor = (baseColor: string, activation: number) => {
    const c1 = new THREE.Color("#93c5fd"); // Light Blue
    const c2 = new THREE.Color("#1d4ed8"); // Deep Blue
    const c3 = new THREE.Color("#10b981"); // Emerald Green

    if (activation < 0.5) return c1.lerp(c2, activation * 2);
    return c2.lerp(c3, (activation - 0.5) * 2);
};

// --- Components ---

const MuscleLabel = ({ position, name, value, isVisible }: { position: THREE.Vector3, name: string, value: number, isVisible: boolean }) => {
  if (!isVisible) return null;
  return (
    <Html position={position} center zIndexRange={[100, 0]} distanceFactor={10}>
       <div className="pointer-events-none select-none flex flex-col items-center transition-opacity duration-200">
          <div className={`w-1.5 h-1.5 rounded-full mb-1 shadow-sm ${value > 0.8 ? 'bg-emerald-500 animate-ping' : 'bg-blue-500'}`}></div>
          <div className="bg-white/90 backdrop-blur-md border border-black/10 px-2 py-1 rounded-sm text-[8px] font-mono text-center shadow-xl flex gap-2 items-center">
             <span className="text-gray-800 uppercase tracking-wider font-bold whitespace-nowrap">{name}</span>
             <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-mncc-primary" style={{ width: `${value*100}%` }}></div>
             </div>
          </div>
       </div>
    </Html>
  );
};

// --- Dynamic Fiber Bundle System ---
interface MuscleBundleProps {
    def: MuscleDefinition;
    originPos: THREE.Vector3;
    insertionPos: THREE.Vector3;
    activation: number;
    viewMode: ViewMode;
}

const MuscleBundle: React.FC<MuscleBundleProps> = ({ def, originPos, insertionPos, activation, viewMode }) => {
    const fibersCount = viewMode === 'XRAY' ? Math.max(1, Math.floor(def.fibers / 2)) : def.fibers;
    const bundleRef = useRef<THREE.Group>(null);
    
    const fiberOffsets = useMemo(() => {
        return Array.from({ length: def.fibers }).map(() => {
            const r = def.radius * Math.sqrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            return new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), 0);
        });
    }, [def.fibers, def.radius]);

    const fibers = useMemo(() => {
        return fiberOffsets.slice(0, fibersCount).map((offset, i) => {
            return { id: i, offset };
        });
    }, [fiberOffsets, fibersCount]);

    useFrame(() => {
        if (!bundleRef.current) return;
        const currentLength = originPos.distanceTo(insertionPos);
        const restLength = 1.0; 
        const strain = Math.max(0, restLength - currentLength);
        const bulgeFactor = (activation * 0.5) + (strain * 0.5); 
        const midPoint = new THREE.Vector3().lerpVectors(originPos, insertionPos, 0.5);
        
        bundleRef.current.children.forEach((child, i) => {
            if (child.type !== 'Mesh') return;
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as THREE.MeshPhysicalMaterial;
            const targetColor = getActivationColor(def.color, activation);
            mat.color.lerp(targetColor, 0.1);
            
            const fiberBulge = 1 + (bulgeFactor * 0.8);
            mesh.scale.set(fiberBulge, 1, fiberBulge); 
            mesh.position.copy(midPoint);
            mesh.lookAt(insertionPos);
            mesh.scale.y = currentLength;
        });
    });

    return (
        <group ref={bundleRef}>
            {fibers.map((f) => (
                 <mesh key={f.id} position={[f.offset.x, 0, f.offset.z]}>
                     <cylinderGeometry args={[def.radius / 5, def.radius / 5, 1, 4, 1]} />
                     <meshPhysicalMaterial 
                        color="#3b82f6"
                        roughness={0.5}
                        metalness={0.1}
                        transparent
                        opacity={viewMode === 'XRAY' ? 0.4 : 0.9}
                     />
                 </mesh>
            ))}
            {viewMode === 'DETAIL' && activation > 0.5 && (
                 <MuscleLabel 
                    position={midPoint(originPos, insertionPos)} 
                    name={def.name} 
                    value={activation} 
                    isVisible={true} 
                 />
            )}
        </group>
    );
};

const midPoint = (v1: THREE.Vector3, v2: THREE.Vector3) => new THREE.Vector3().lerpVectors(v1, v2, 0.5);

// --- Procedural Skeleton Rig ---
interface BodyProps {
    exercise: ExerciseType;
    profile: BiomechanicalProfile;
    load: number;
    isPlaying: boolean;
    speed: number;
    viewMode: ViewMode;
}

export const BiomechanicalBody: React.FC<BodyProps> = ({ exercise, profile, load, isPlaying, speed, viewMode }) => {
    const [simTime, setSimTime] = useState(0);
    
    const bones = useRef({
        Hip: new THREE.Vector3(0, 0, 0),
        FemurTop: new THREE.Vector3(0, 0, 0), 
        FemurMid: new THREE.Vector3(0, -0.4, 0),
        Knee: new THREE.Vector3(0, -0.8, 0),
        KneeBack: new THREE.Vector3(0, -0.8, -0.1),
        Ankle: new THREE.Vector3(0, -1.5, 0),
        Neck: new THREE.Vector3(0, 1.5, 0),
        Ribcage: new THREE.Vector3(0, 0.8, 0),
        SpineMid: new THREE.Vector3(0, 0.4, 0),
        Sternum: new THREE.Vector3(0, 1.1, 0.2),
        Clavicle: new THREE.Vector3(0.3, 1.4, 0.1),
        Shoulder: new THREE.Vector3(0.5, 1.3, 0),
        Humerus: new THREE.Vector3(0.5, 0.8, 0),
        Elbow: new THREE.Vector3(0.5, 0.4, 0),
        Forearm: new THREE.Vector3(0.5, 0, 0.2),
    }).current;

    const [activations, setActivations] = useState<Record<string, number>>({});

    useFrame((state, delta) => {
        if (isPlaying) {
            setSimTime(prev => prev + delta * speed * 3.0);
        }
        const t = simTime;
        const cycle = (Math.sin(t) + 1) / 2; 
        
        // ... (Existing IK Logic) ...
         if (exercise === 'SQUAT') {
            const depth = cycle; 
            bones.Hip.set(0, -0.6 * depth, -0.3 * depth);
            bones.Knee.set(0, -0.8 - (0.4 * depth), 0.3 * depth);
            bones.Neck.set(0, 1.5 - (0.6 * depth), -0.3 * depth + (0.4 * depth));
        } else if (exercise === 'BENCH_PRESS') {
             const press = cycle;
             bones.Hip.set(0, 0, 0);
             bones.Elbow.set(0.6 + (0.2 * press), 0.2 - (0.3 * press), 0.3 * press);
        } else if (exercise === 'DEADLIFT') {
            const lift = 1 - cycle;
            bones.Hip.set(0, -0.2 - (0.5 * (1-lift)), -0.5 * (1-lift));
            bones.Neck.set(0, 1.5 - (0.5*(1-lift)), (1-lift) * 0.8); 
        }

        const newActivations: Record<string, number> = {};
        Object.values(profile.muscles).forEach(m => {
             const val = THREE.MathUtils.lerp(m.curve[0], m.curve[1], cycle);
             newActivations[m.id] = Math.min(1, Math.max(0, val * load));
        });
        setActivations(newActivations);
    });

    return (
        <group>
            {/* Render Skeleton (Ghosted - Teal Color) */}
            <group>
                {Object.values(bones).map((pos, i) => (
                    <mesh key={i} position={pos}>
                        <sphereGeometry args={[0.04, 8, 8]} />
                        <meshBasicMaterial color="#387C6D" transparent opacity={0.5} />
                    </mesh>
                ))}
                <TubeFromTo v1={bones.Hip} v2={bones.Knee} radius={0.03} />
                <TubeFromTo v1={bones.Knee} v2={bones.Ankle} radius={0.025} />
                <TubeFromTo v1={bones.Hip} v2={bones.Neck} radius={0.04} />
            </group>

            {/* Render Muscles */}
            {Object.values(profile.muscles).map(def => {
                const origin = bones[def.origin as keyof typeof bones];
                const insertion = bones[def.insertion as keyof typeof bones];
                if (!origin || !insertion) return null;
                return (
                    <MuscleBundle 
                        key={def.id}
                        def={def}
                        originPos={origin}
                        insertionPos={insertion}
                        activation={activations[def.id] || 0}
                        viewMode={viewMode}
                    />
                );
            })}
        </group>
    );
};

const TubeFromTo = ({ v1, v2, radius }: { v1: THREE.Vector3, v2: THREE.Vector3, radius: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(() => {
        if(meshRef.current) {
            const dist = v1.distanceTo(v2);
            meshRef.current.scale.set(1, dist, 1);
            meshRef.current.position.lerpVectors(v1, v2, 0.5);
            meshRef.current.lookAt(v2);
            meshRef.current.rotateX(Math.PI / 2);
        }
    });
    return (
        <mesh ref={meshRef}>
            <cylinderGeometry args={[radius, radius, 1, 6]} />
            <meshBasicMaterial color="#2d2d2d" transparent opacity={0.2} />
        </mesh>
    )
}

export default BiomechanicalBody;
