import React, { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, PerspectiveCamera, Grid, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import AsciiDome from './AsciiDome';
import { Monitor, Box } from 'lucide-react';
import '../types';

const Portico = ({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  // UPDATED COLORS: Teal/Green Theme
  const neuralColor = "#387C6D"; // Teal Green
  const structureColor = "#2d2d2d"; // Charcoal

  return (
    <group position={position} rotation={rotation}>
       {Array.from({ length: 6 }).map((_, i) => {
           const x = (i - 2.5) * 0.5; 
           return (
               <mesh key={i} position={[x, 0, 0]}>
                   <cylinderGeometry args={[0.08, 0.1, 1.8, 16]} />
                   <meshBasicMaterial color={neuralColor} wireframe transparent opacity={0.4} />
               </mesh>
           )
       })}
       <group position={[0, 1.3, 0]}>
           <mesh rotation={[0, Math.PI/4, 0]} scale={[1, 0.6, 1]}>
               <cylinderGeometry args={[0, 2.8, 1.5, 4, 1]} />
               <meshBasicMaterial color={neuralColor} wireframe transparent opacity={0.3} />
           </mesh>
           <mesh rotation={[0, Math.PI/4, 0]} scale={[0.98, 0.58, 0.98]}>
               <cylinderGeometry args={[0, 2.8, 1.5, 4, 1]} />
               <meshBasicMaterial color={structureColor} transparent opacity={0.1} />
           </mesh>
       </group>
       <mesh position={[0, 0.95, 0]}>
           <boxGeometry args={[3.2, 0.2, 0.4]} />
           <meshBasicMaterial color={structureColor} transparent opacity={0.2} />
       </mesh>
       <group position={[0, -1.2, 0.6]}>
           {Array.from({length: 6}).map((_, i) => (
               <mesh key={i} position={[0, i * 0.1, i * -0.15]}>
                   <boxGeometry args={[3.4 - i*0.1, 0.1, 0.8]} />
                   <meshBasicMaterial color={structureColor} transparent opacity={0.1} />
               </mesh>
           ))}
       </group>
    </group>
  );
};

const NeuralDome = () => {
  const groupRef = useRef<THREE.Group>(null);
  const domeMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      const breathe = 1 + Math.sin(t * 1.5) * 0.015;
      groupRef.current.scale.set(breathe, breathe, breathe);
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.05; 
    }
    if (domeMatRef.current) {
      domeMatRef.current.opacity = 0.3 + Math.abs(Math.sin(t * 2)) * 0.15;
    }
  });

  const neuralColor = "#387C6D"; // Teal Green
  const structureColor = "#2d2d2d"; // Dark
  
  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      <group position={[0, 2.8, 0]}>
        <mesh scale={[1, 0.8, 1]}>
          <sphereGeometry args={[1.4, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial ref={domeMatRef} color={neuralColor} wireframe transparent opacity={0.3} />
        </mesh>
        <mesh scale={[0.95, 0.75, 0.95]}>
           <sphereGeometry args={[1.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
           <meshBasicMaterial color={neuralColor} transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group position={[0, 2.8, 0]}>
         {[1.5, 1.6, 1.7].map((radius, i) => (
             <mesh key={i} position={[0, -0.1 * i, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <ringGeometry args={[radius - 0.1, radius, 32]} />
                <meshBasicMaterial color={structureColor} transparent opacity={0.4} side={THREE.DoubleSide} />
             </mesh>
         ))}
      </group>
      <group position={[0, 2.1, 0]}>
        <mesh>
          <cylinderGeometry args={[1.6, 1.6, 0.8, 32]} />
          <meshBasicMaterial color={structureColor} transparent opacity={0.1} />
        </mesh>
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 1.62; 
          return (
            <mesh key={i} position={[Math.cos(angle)*radius, 0, Math.sin(angle)*radius]} rotation={[0, -angle, 0]}>
              <boxGeometry args={[0.1, 0.8, 0.05]} />
              <meshBasicMaterial color={neuralColor} transparent opacity={0.4} />
            </mesh>
          );
        })}
      </group>
      <group position={[0, 1.4, 0]}>
           <mesh>
              <boxGeometry args={[3.4, 0.6, 3.4]} />
              <meshBasicMaterial color={structureColor} transparent opacity={0.1} />
           </mesh>
      </group>
      <group position={[0, 0.2, 0]}>
           <mesh>
              <boxGeometry args={[3.8, 1.8, 3.8]} />
              <meshBasicMaterial color={structureColor} transparent opacity={0.1} />
           </mesh>
           <mesh>
              <boxGeometry args={[3.82, 1.82, 3.82]} />
              <meshBasicMaterial color={neuralColor} wireframe transparent opacity={0.1} />
           </mesh>
      </group>
      <Portico position={[0, 0.2, 1.95]} />
      <Portico position={[0, 0.2, -1.95]} rotation={[0, Math.PI, 0]} />
    </group>
  );
};

const ConnectomeParticles = () => {
  const count = 200;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => Array.from({ length: count }, () => ({
    t: Math.random() * 100,
    factor: 5 + Math.random() * 8,
    speed: 0.002 + Math.random() * 0.01,
    x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 2 - 1
  })), []);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime();
    particles.forEach((p, i) => {
      const t = p.t + time * p.speed * 5; 
      dummy.position.set(
        Math.sin(t + p.x) * p.factor,
        Math.cos(t * 0.8 + p.y) * p.factor * 0.5,
        Math.cos(t + p.z) * p.factor
      );
      const s = (Math.sin(time * 4 + i) * 0.05 + 0.08) * (10 / dummy.position.length());
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.1, 0]} />
      <meshBasicMaterial color="#5D9CEC" transparent opacity={0.8} />
    </instancedMesh>
  );
};

const Scene3D: React.FC<{ height?: string }> = ({ height = "100%" }) => {
  const [asciiMode, setAsciiMode] = useState(false);

  return (
    <div className="w-full relative group" style={{ height }}>
      {/* Mode Toggle */}
      <div className="absolute top-4 right-4 z-20 pointer-events-auto">
         <button 
           onClick={() => setAsciiMode(!asciiMode)}
           className="bg-white/50 backdrop-blur-sm border border-black/10 text-mncc-text p-2 rounded-full hover:bg-white/80 transition-all flex items-center gap-2 text-xs shadow-sm"
         >
            {asciiMode ? <Box size={14}/> : <Monitor size={14}/>}
            {asciiMode ? '3D Mode' : 'ASCII Mode'}
         </button>
      </div>

      {asciiMode ? (
         <AsciiDome />
      ) : (
        <Canvas gl={{ antialias: true }} dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 1.5, 7.5]} fov={45} />
            
            {/* Cream Background */}
            <color attach="background" args={['#f3f1ea']} />
            
            {/* Enhanced Atmospheric Effects - Fog matching background */}
            <fog attach="fog" args={['#f3f1ea', 8, 35]} />
            
            {/* Particles - Teal/Blue */}
            <Sparkles count={50} scale={12} size={4} speed={0.4} opacity={0.6} noise={0.2} color="#387C6D" />
            
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1.2} color="#387C6D" />
            <pointLight position={[-10, 5, -10]} intensity={0.8} color="#5D9CEC" />
            
            <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
            <NeuralDome />
            </Float>

            <ConnectomeParticles />

            <Grid 
                position={[0, -3.5, 0]} 
                args={[30, 30]} 
                cellSize={0.5} 
                cellThickness={1} 
                cellColor="#d1cec7" 
                sectionSize={2.5} 
                sectionThickness={1.2} 
                sectionColor="#387C6D" 
                fadeDistance={20} 
                fadeStrength={1} 
            />

            <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 2.5}
            />
        </Canvas>
      )}
    </div>
  );
};

export default Scene3D;
