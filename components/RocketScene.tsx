import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Grid, Line, Html } from '@react-three/drei';
import { TelemetryData } from '../hooks/useRocketSim';
import '../types';

// --- Constants: Blueprint / Paper Theme ---
const THEME = {
  primary: '#387C6D',   // Teal
  grid: '#d1cec7',      // Light Grey
  lines: '#2d2d2d',     // Charcoal
  background: '#f3f1ea' // Cream
};

// --- Materials ---
const BlueprintMaterial = ({ opacity = 0.5, color = THEME.lines }: { opacity?: number, color?: string }) => (
  <meshBasicMaterial 
    color={color} 
    wireframe 
    transparent 
    opacity={opacity} 
    side={THREE.DoubleSide}
    depthWrite={false}
  />
);

const SolidMaskMaterial = () => (
  <meshBasicMaterial color={THEME.background} colorWrite={true} polygonOffset polygonOffsetFactor={1} />
);

// --- Particle System for Exhaust ---
const ExhaustPlume: React.FC<{ thrust: number }> = ({ thrust }) => {
  const count = 400;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Particle state: [x, y, z, velocityY, scale, age, maxAge]
  const particles = useMemo(() => {
    return new Float32Array(count * 7).fill(0);
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    let activeCount = 0;
    const isThrusting = thrust > 0;

    for (let i = 0; i < count; i++) {
      const idx = i * 7;
      
      // Update age
      particles[idx + 5] += delta;
      
      // Spawn/Respawn logic
      if (particles[idx + 5] >= particles[idx + 6]) {
         if (isThrusting) {
             // Reset particle to nozzle
             particles[idx] = (Math.random() - 0.5) * 0.4; // X
             particles[idx + 1] = -1.0; // Y (Nozzle exit)
             particles[idx + 2] = (Math.random() - 0.5) * 0.4; // Z
             particles[idx + 3] = -5.0 - Math.random() * 10.0; // Velocity Y (Down)
             particles[idx + 4] = 0.2 + Math.random() * 0.3; // Initial Scale
             particles[idx + 5] = 0; // Age
             particles[idx + 6] = 0.5 + Math.random() * 0.5; // Max Age
         } else {
             // Hide if engine off
             dummy.position.set(0, -1000, 0);
             dummy.updateMatrix();
             meshRef.current.setMatrixAt(i, dummy.matrix);
             continue;
         }
      }

      // Physics Update
      particles[idx + 1] += particles[idx + 3] * delta; // Y pos
      particles[idx] += (Math.random() - 0.5) * 0.5 * delta; // X spread
      particles[idx + 2] += (Math.random() - 0.5) * 0.5 * delta; // Z spread
      particles[idx + 4] += 2.0 * delta; // Grow scale

      // Render
      dummy.position.set(particles[idx], particles[idx + 1], particles[idx + 2]);
      const scale = particles[idx + 4];
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshBasicMaterial color={THEME.primary} transparent opacity={0.4} wireframe={true} />
    </instancedMesh>
  );
};

// --- Rocket Model ---
const RocketBlueprint: React.FC<{ altitude: number; thrust: number; velocity: number }> = ({ altitude, thrust, velocity }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
     if (groupRef.current) {
         // Smooth altitude update
         groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, altitude, 0.15);
         
         // Engine Vibration Jitter
         if (thrust > 0) {
             const jitterAmount = 0.02;
             groupRef.current.position.x = (Math.random() - 0.5) * jitterAmount;
             groupRef.current.position.z = (Math.random() - 0.5) * jitterAmount;
             
             // Engine Light Flicker
             if (lightRef.current) {
                lightRef.current.intensity = 2 + Math.random() * 2;
             }
         } else {
             groupRef.current.position.x = 0;
             groupRef.current.position.z = 0;
             if (lightRef.current) lightRef.current.intensity = 0;
         }
     }
  });

  return (
    <group ref={groupRef}>
       
       {/* Engine Glow Light */}
       <pointLight ref={lightRef} position={[0, -2, 0]} distance={10} color={THEME.primary} intensity={0} decay={2} />

       {/* Dynamic In-Scene Labels */}
       <Html position={[2, 8, 0]} className="pointer-events-none" zIndexRange={[100, 0]}>
          <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2 bg-white/80 border-l-2 border-teal-600 px-2 py-1 backdrop-blur-sm shadow-sm">
                 <span className="text-[10px] text-teal-600 font-mono font-bold">VEL</span>
                 <span className="text-xs text-gray-800 font-mono tabular-nums">{velocity.toFixed(0)} m/s</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 border-l-2 border-gray-400 px-2 py-1 backdrop-blur-sm shadow-sm">
                 <span className="text-[10px] text-gray-500 font-mono font-bold">ALT</span>
                 <span className="text-xs text-gray-800 font-mono tabular-nums">{altitude.toFixed(0)} m</span>
              </div>
          </div>
       </Html>

       {/* --- Vehicle Geometry --- */}
       
       {/* Main Body */}
       <group position={[0, 5, 0]}>
          <mesh>
             <cylinderGeometry args={[1, 1, 10, 24]} />
             <SolidMaskMaterial />
          </mesh>
          <mesh>
             <cylinderGeometry args={[1, 1, 10, 24]} />
             <BlueprintMaterial opacity={0.3} />
          </mesh>
          {/* Stage Lines */}
          <Line points={[[-1, 2, 0], [1, 2, 0]]} color={THEME.lines} transparent opacity={0.2} />
          <Line points={[[-1, -2, 0], [1, -2, 0]]} color={THEME.lines} transparent opacity={0.2} />
          {/* Vertical Detail */}
          <Line points={[[0, -5, 1.01], [0, 5, 1.01]]} color={THEME.primary} transparent opacity={0.3} dashed dashScale={5} />
       </group>
       
       {/* Nose Cone */}
       <group position={[0, 11, 0]}>
          <mesh>
             <coneGeometry args={[1, 2, 24]} />
             <SolidMaskMaterial />
          </mesh>
          <mesh>
             <coneGeometry args={[1, 2, 24]} />
             <BlueprintMaterial opacity={0.3} />
          </mesh>
       </group>
       
       {/* Fins */}
       {[0, Math.PI/2, Math.PI, Math.PI*1.5].map((rot, i) => (
           <group key={i} position={[0, 1, 0]} rotation={[0, rot, 0]}>
               <mesh>
                   <boxGeometry args={[0.1, 3, 3]} />
                   <BlueprintMaterial opacity={0.4} />
               </mesh>
               <Line points={[[0, -1.5, 1.5], [0, 1.5, 1.5]]} color={THEME.primary} />
           </group>
       ))}

       {/* Engine Bell */}
       <group position={[0, -0.5, 0]}>
           <mesh>
               <cylinderGeometry args={[0.6, 1.0, 1, 16, 1, true]} />
               <BlueprintMaterial opacity={0.8} color={THEME.primary} />
           </mesh>
       </group>

       {/* Velocity Vector Visualizer */}
       {velocity > 10 && (
          <group position={[0, -2, 0]}>
             <Line 
                points={[[0, 0, 0], [0, -Math.min(velocity * 0.1, 10), 0]]} 
                color={THEME.primary} 
                lineWidth={2} 
                dashed 
                dashScale={2} 
             />
             <Text 
                position={[0, -Math.min(velocity * 0.1, 10) - 1, 0]} 
                fontSize={0.4} 
                color={THEME.primary}
             >
                v
             </Text>
          </group>
       )}

       {/* Particle Exhaust */}
       <group position={[0, -1, 0]}>
           <ExhaustPlume thrust={thrust} />
       </group>
       
    </group>
  );
};

// --- Environment ---
const LaunchStructure = () => {
    return (
        <group>
            {/* Pad Base with Flame Trench */}
            <group position={[0, -0.1, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[2, 12, 32]} />
                    <BlueprintMaterial opacity={0.15} />
                </mesh>
                {/* Trench walls */}
                <group position={[0, -2, 0]}>
                     <mesh position={[3, 0, 0]}>
                         <boxGeometry args={[2, 4, 4]} />
                         <SolidMaskMaterial />
                         <BlueprintMaterial opacity={0.1} />
                     </mesh>
                     <mesh position={[-3, 0, 0]}>
                         <boxGeometry args={[2, 4, 4]} />
                         <SolidMaskMaterial />
                         <BlueprintMaterial opacity={0.1} />
                     </mesh>
                </group>
            </group>
            
            {/* Service Tower */}
            <group position={[-8, 0, -5]}>
                <mesh position={[0, 15, 0]}>
                    <boxGeometry args={[4, 30, 4]} />
                    <SolidMaskMaterial />
                    <BlueprintMaterial opacity={0.1} />
                </mesh>
                {/* Cross bracing details */}
                {Array.from({length: 8}).map((_, i) => (
                    <group key={i} position={[0, i * 4, 0]}>
                        <Line points={[[-2, 0, 2], [2, 4, 2]]} color={THEME.lines} opacity={0.1} transparent />
                        <Line points={[[2, 0, 2], [-2, 4, 2]]} color={THEME.lines} opacity={0.1} transparent />
                        <Line points={[[-2, 0, -2], [2, 4, -2]]} color={THEME.lines} opacity={0.1} transparent />
                    </group>
                ))}
                {/* Gantry Arm */}
                <group position={[2, 20, 0]}>
                     <Line points={[[0,0,0], [5,0,0]]} color={THEME.primary} opacity={0.4} transparent />
                </group>
            </group>
        </group>
    );
};

const AltitudeMarkers = () => {
    return (
        <group>
            <Line points={[[20, 0, 0], [20, 2000, 0]]} color={THEME.grid} lineWidth={1} />
            {Array.from({ length: 40 }).map((_, i) => {
                const y = i * 50; // Every 50m
                return (
                    <group key={i} position={[20, y, 0]}>
                        <Line points={[[-1, 0, 0], [1, 0, 0]]} color={THEME.grid} />
                        <Text 
                            position={[2, 0, 0]} 
                            fontSize={3} 
                            color="#75706b"
                            anchorX="left"
                            fillOpacity={0.5}
                        >
                            {y}
                        </Text>
                    </group>
                )
            })}
        </group>
    );
};

// --- Cinematic Camera Controller ---
const CinematicCamera: React.FC<{ telemetry: TelemetryData }> = ({ telemetry }) => {
    const { camera } = useThree();
    const shakeOffset = useRef(new THREE.Vector3());
    
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const { status, altitude, velocity } = telemetry;

        // 1. Calculate Base Position based on Phase
        const targetPos = new THREE.Vector3();
        const targetLook = new THREE.Vector3(0, altitude, 0);

        if (status === 'PRE_LAUNCH') {
            // Low angle, looking up
            targetPos.set(12, 2, 12);
            targetLook.set(0, 10, 0);
        } else if (status === 'IGNITION') {
            // Same pos, but shake comes later
            targetPos.set(12, 2, 12);
            targetLook.set(0, 10, 0);
        } else if (status === 'ASCENT') {
            // Chase Cam
            const leadY = altitude + velocity * 0.5; 
            targetPos.set(25, altitude + 10, 25);
            targetLook.set(0, altitude, 0);
        } else if (status === 'MECO' || status === 'APOGEE') {
            // Wide profile
            targetPos.set(60, altitude, 60);
            targetLook.set(0, altitude, 0);
        } else {
            // Descent / Landed
            targetPos.set(30, Math.max(10, altitude + 20), 30);
            targetLook.set(0, altitude, 0);
        }

        // 2. Apply Camera Shake logic (High thrust = shake)
        if (telemetry.thrust > 0) {
             const intensity = status === 'IGNITION' ? 0.15 : 0.05;
             shakeOffset.current.set(
                 (Math.random() - 0.5) * intensity,
                 (Math.random() - 0.5) * intensity,
                 (Math.random() - 0.5) * intensity
             );
        } else {
             shakeOffset.current.set(0, 0, 0);
        }

        // 3. Smooth Interpolation
        const lerpFactor = status === 'ASCENT' ? 0.05 : 0.02;
        camera.position.lerp(targetPos.add(shakeOffset.current), lerpFactor);
        
        camera.lookAt(targetLook);
    });
    
    return null;
};

export const RocketScene: React.FC<{ telemetry: TelemetryData }> = ({ telemetry }) => {
  return (
    <>
       {/* Environment */}
       <color attach="background" args={[THEME.background]} />
       <fog attach="fog" args={[THEME.background, 50, 300]} />
       
       <Grid 
         position={[0, -0.2, 0]} 
         args={[200, 200]} 
         cellSize={5} 
         cellThickness={0.5} 
         cellColor={THEME.grid} 
         sectionSize={50} 
         sectionThickness={1} 
         sectionColor="#b0afa9" 
         fadeDistance={150} 
         infiniteGrid 
       />

       <Grid 
         position={[0, 500, -50]} 
         rotation={[Math.PI/2, 0, 0]}
         args={[200, 2000]} 
         cellSize={25} 
         cellThickness={0.5} 
         cellColor="#e6e4dd" 
         sectionSize={100} 
         sectionThickness={1} 
         sectionColor={THEME.grid} 
         fadeDistance={300} 
       />

       <ambientLight intensity={0.8} />
       <directionalLight position={[50, 50, 25]} intensity={0.8} color="#ffffff" />

       {/* Scene Elements */}
       <RocketBlueprint 
          altitude={telemetry.altitude} 
          thrust={telemetry.thrust} 
          velocity={telemetry.velocity}
       />
       <LaunchStructure />
       <AltitudeMarkers />
       
       {/* Controller */}
       <CinematicCamera telemetry={telemetry} />
    </>
  );
};
