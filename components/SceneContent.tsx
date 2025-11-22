import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useNeuralSim, Neuron, Connection } from '../hooks/useNeuralSim';
import { Sphere, Line, Text, Html } from '@react-three/drei';
import '../types';

const NeuronNode: React.FC<{ neuron: Neuron }> = ({ neuron }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !outerRef.current) return;
    // Very subtle movement
    // meshRef.current.position.y = neuron.position.y + Math.sin(state.clock.elapsedTime + neuron.nodeIndex) * 0.02;
  });

  // Clinical color coding
  const baseColor = neuron.layerIndex === 0 ? "#93c5fd" : "#e2e8f0"; // Blue inputs, Gray hiddens

  return (
    <group position={neuron.position}>
      {/* Inner Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshPhysicalMaterial 
          color={baseColor}
          roughness={0.5}
          metalness={0.1}
          clearcoat={0.8}
        />
      </mesh>
      
      {/* Technical Wireframe Shell */}
      <mesh ref={outerRef} scale={[1.2, 1.2, 1.2]}>
         <sphereGeometry args={[0.6, 8, 8]} />
         <meshBasicMaterial color="#475569" wireframe transparent opacity={0.3} />
      </mesh>

      {/* Layer Label (only top node of each layer) */}
      {neuron.nodeIndex === 0 && (
        <Html position={[0, 2.5, 0]} center distanceFactor={10}>
            <div className="text-[10px] font-mono text-gray-500 whitespace-nowrap bg-black/80 px-1 rounded border border-gray-700">
                L_{neuron.layerIndex}
            </div>
        </Html>
      )}
    </group>
  );
};

const Connections = () => {
  const { neurons, connections } = useNeuralSim();
  
  const lines = useMemo(() => {
    return connections.map(conn => {
       const source = neurons.find(n => n.id === conn.sourceId);
       const target = neurons.find(n => n.id === conn.targetId);
       if (!source || !target) return null;
       
       return {
         id: conn.id,
         points: [source.position, target.position],
         width: Math.max(0.5, conn.weight) // Clamp width for clean visuals
       };
    }).filter(Boolean) as { id: string, points: [THREE.Vector3, THREE.Vector3], width: number }[];
  }, [neurons, connections]);

  return (
    <group>
      {lines.map((line) => (
        <Line
          key={line.id}
          points={line.points}
          color="#334155" // Slate 700 - dark grey/blue connection lines
          transparent
          opacity={0.4}
          lineWidth={1} // Keep lines thin and precise
        />
      ))}
    </group>
  );
};

const Pulses = () => {
  const { pulses } = useNeuralSim();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    
    pulses.forEach((pulse, i) => {
      const currentPos = new THREE.Vector3().lerpVectors(pulse.sourcePos, pulse.targetPos, pulse.progress);
      dummy.position.copy(currentPos);
      // Constant small size for data-packet look
      dummy.scale.setScalar(0.3); 
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.count = pulses.length;
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 1000]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="#3b82f6" toneMapped={false} /> 
    </instancedMesh>
  );
};

const SceneContent = () => {
  const { neurons, updatePulses, triggerPulse, isPlaying, speed } = useNeuralSim();
  
  useFrame((state, delta) => {
     if (isPlaying) {
        updatePulses(delta);
        if (Math.random() < 0.05 * speed) {
           triggerPulse();
        }
     }
  });

  return (
    <group>
       {neurons.map(n => <NeuronNode key={n.id} neuron={n} />)}
       <Connections />
       <Pulses />
    </group>
  );
};

export default SceneContent;
