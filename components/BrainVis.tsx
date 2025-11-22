import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import '../types';

// --- Shaders ---

const neuronVertexShader = `
attribute float size;
attribute float activation;
varying float vActivation;

void main() {
  vActivation = activation;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

// UPDATED: Charcoal Base -> Teal Green Active
const neuronFragmentShader = `
varying float vActivation;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;
  
  // Soft glow
  float strength = 1.0 - (dist * 2.0);
  strength = pow(strength, 2.0);
  
  // Colors: Charcoal base -> Teal Green active
  vec3 baseColor = vec3(0.2, 0.2, 0.2); // #333333
  vec3 activeColor = vec3(0.22, 0.49, 0.43); // #387C6D (Teal Green)
  
  vec3 color = mix(baseColor, activeColor, vActivation);
  
  // Alpha management
  float alpha = strength * (0.4 + 0.6 * vActivation);
  
  gl_FragColor = vec4(color, alpha);
}
`;

const signalVertexShader = `
attribute float size;
attribute float opacity;
varying float vOpacity;

void main() {
  vOpacity = opacity;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * (200.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

// UPDATED: Bright Blue signals
const signalFragmentShader = `
varying float vOpacity;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;
  
  float strength = 1.0 - (dist * 2.0);
  vec3 color = vec3(0.36, 0.61, 0.92); // Blue #5D9CEC
  
  gl_FragColor = vec4(color, strength * vOpacity);
}
`;

// --- Types & Utils ---

interface BrainData {
  neuronPositions: Float32Array;
  neuronSizes: Float32Array;
  connections: Float32Array; // Flattened lines
  connectionPairs: { a: number, b: number, length: number }[];
}

const generateBrainData = (count: number): BrainData => {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const rawPoints: THREE.Vector3[] = [];

  for (let i = 0; i < count; i++) {
    // Brain shape generation using ellipsoids + noise
    const isRight = Math.random() > 0.5;
    const xOffset = isRight ? 0.3 : -0.3;
    
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    
    // Base ellipsoid
    let x = Math.sin(phi) * Math.cos(theta);
    let y = Math.sin(phi) * Math.sin(theta);
    let z = Math.cos(phi);
    
    // Morph
    x *= 1.0;
    y *= 0.8; // Flatten top/bottom
    z *= 1.2; // Elongate front/back
    
    // Separate hemispheres
    x += (x > 0 ? 1 : -1) * 0.1;
    
    // Add Cerebellum cluster at back bottom
    if (Math.random() < 0.15) {
        x *= 0.6;
        y = -0.5 - Math.random() * 0.4;
        z = -0.5 - Math.random() * 0.5;
    }

    // Noise
    x += (Math.random() - 0.5) * 0.1;
    y += (Math.random() - 0.5) * 0.1;
    z += (Math.random() - 0.5) * 0.1;

    // Scale up
    const scale = 2.5;
    x *= scale; y *= scale; z *= scale;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    
    sizes[i] = Math.random() * 0.5 + 0.5;
    rawPoints.push(new THREE.Vector3(x, y, z));
  }

  // Generate connections (K-Nearest Neighbors optimization)
  const connectionsArr: number[] = [];
  const connectionPairs: { a: number, b: number, length: number }[] = [];
  
  // Simple spatial grid or brute force (optimized for demo size)
  for (let i = 0; i < count; i+=1) {
      // Only connect a subset to keep performance high
      if (Math.random() > 0.6) continue;

      const p1 = rawPoints[i];
      let connectionsFound = 0;
      const maxConnections = 3;
      const maxDist = 0.8;

      for (let j = i + 1; j < count; j++) {
          if (connectionsFound >= maxConnections) break;
          
          const dist = p1.distanceTo(rawPoints[j]);
          if (dist < maxDist) {
              connectionsArr.push(p1.x, p1.y, p1.z, rawPoints[j].x, rawPoints[j].y, rawPoints[j].z);
              connectionPairs.push({ a: i, b: j, length: dist });
              connectionsFound++;
          }
      }
  }

  return {
      neuronPositions: positions,
      neuronSizes: sizes,
      connections: new Float32Array(connectionsArr),
      connectionPairs
  };
};

// --- Main Component ---

export const BrainSimulation = () => {
  const { camera, mouse } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const neuronsRef = useRef<THREE.Points>(null);
  const signalsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Static Data
  const { neuronPositions, neuronSizes, connections, connectionPairs } = useMemo(() => generateBrainData(3000), []);
  
  // Dynamic State
  const activations = useRef(new Float32Array(3000).fill(0)); // Neuron activation levels
  const signals = useRef<{ pathIdx: number; progress: number; speed: number }[]>([]); // Moving packets
  
  // Connection Visuals State
  const connectionActivity = useRef(new Float32Array(connectionPairs.length).fill(0));
  const connectionColors = useMemo(() => {
      const arr = new Float32Array(connectionPairs.length * 6);
      // Base color: Light Grey for edges #d1cec7
      const baseR = 0.82, baseG = 0.81, baseB = 0.78; 
      for(let i=0; i<connectionPairs.length * 6; i+=3) {
          arr[i] = baseR;
          arr[i+1] = baseG;
          arr[i+2] = baseB;
      }
      return arr;
  }, [connectionPairs]);

  // Buffers for signals (dynamic)
  const maxSignals = 1000;
  const signalPositions = useMemo(() => new Float32Array(maxSignals * 3).fill(0), []);
  const signalSizes = useMemo(() => new Float32Array(maxSignals).fill(0), []);
  const signalOpacities = useMemo(() => new Float32Array(maxSignals).fill(0), []);

  useFrame((state, delta) => {
     const t = state.clock.elapsedTime;
     
     // 1. Interactive Rotation (Parallax)
     if (groupRef.current) {
         const targetRotX = -mouse.y * 0.2;
         const targetRotY = mouse.x * 0.2 + t * 0.05; 
         
         groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
         groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
     }

     // 2. Spawn Signals randomly
     if (signals.current.length < maxSignals && Math.random() > 0.9) {
         const randomConnIdx = Math.floor(Math.random() * connectionPairs.length);
         signals.current.push({
             pathIdx: randomConnIdx,
             progress: 0,
             speed: 0.5 + Math.random() * 1.0 // Variation in speed
         });
     }

     // 3. Update Signals & Activations & Connections
     
     // Decay connection activity
     const connActivity = connectionActivity.current;
     for(let i=0; i<connActivity.length; i++) {
         connActivity[i] *= 0.9;
     }

     let activeSignalCount = 0;
     const currentSignals = signals.current;
     
     // Global pulse wave (scanline effect)
     const waveX = Math.sin(t * 0.5) * 3.0;
     
     for (let i = currentSignals.length - 1; i >= 0; i--) {
         const sig = currentSignals[i];
         sig.progress += sig.speed * delta;
         
         // Boost connection heat while active
         if (sig.progress < 1.0) {
             connActivity[sig.pathIdx] = 1.0;
         }

         if (sig.progress >= 1.0) {
             // Reached destination
             const pair = connectionPairs[sig.pathIdx];
             activations.current[pair.b] = 1.0; // Trigger flash on target neuron
             currentSignals.splice(i, 1);
         } else {
             // Update position buffer
             const pair = connectionPairs[sig.pathIdx];
             const idxA = pair.a * 3;
             const idxB = pair.b * 3;
             
             // Lerp position
             const x = THREE.MathUtils.lerp(neuronPositions[idxA], neuronPositions[idxB], sig.progress);
             const y = THREE.MathUtils.lerp(neuronPositions[idxA+1], neuronPositions[idxB+1], sig.progress);
             const z = THREE.MathUtils.lerp(neuronPositions[idxA+2], neuronPositions[idxB+2], sig.progress);
             
             const bufferIdx = activeSignalCount * 3;
             signalPositions[bufferIdx] = x;
             signalPositions[bufferIdx+1] = y;
             signalPositions[bufferIdx+2] = z;
             
             signalSizes[activeSignalCount] = 0.5 + Math.sin(sig.progress * Math.PI) * 0.5; // Scale up in middle
             signalOpacities[activeSignalCount] = 1.0;
             
             activeSignalCount++;
         }
     }

     // 4. Update Connection Colors
     const colors = connectionColors;
     const baseR = 0.82, baseG = 0.81, baseB = 0.78; // #d1cec7
     // Active color: Teal Green #387C6D
     const activeR = 0.22, activeG = 0.49, activeB = 0.43; 
     
     let colorDirty = false;

     for(let i=0; i<connActivity.length; i++) {
         const heat = connActivity[i];
         if (heat > 0.01) {
             const r = baseR + (activeR - baseR) * heat;
             const g = baseG + (activeG - baseG) * heat;
             const bVal = baseB + (activeB - baseB) * heat;

             const idx = i * 6;
             colors[idx] = r; colors[idx+1] = g; colors[idx+2] = bVal;
             colors[idx+3] = r; colors[idx+4] = g; colors[idx+5] = bVal;
             colorDirty = true;
         } else if (colors[i*6] < baseR - 0.01) { // Check if drifted
             // Reset to base if needed
             const idx = i * 6;
             colors[idx] = baseR; colors[idx+1] = baseG; colors[idx+2] = baseB;
             colors[idx+3] = baseR; colors[idx+4] = baseG; colors[idx+5] = baseB;
             colorDirty = true;
         }
     }
     
     if (colorDirty && linesRef.current) {
         linesRef.current.geometry.attributes.color.needsUpdate = true;
     }
     
     // Update Signal Geometry
     if (signalsRef.current) {
         signalsRef.current.geometry.setDrawRange(0, activeSignalCount);
         signalsRef.current.geometry.attributes.position.needsUpdate = true;
         signalsRef.current.geometry.attributes.size.needsUpdate = true;
         signalsRef.current.geometry.attributes.opacity.needsUpdate = true;
     }

     // 5. Update Neurons (Decay + Wave)
     if (neuronsRef.current) {
         const count = activations.current.length;
         const activationAttr = neuronsRef.current.geometry.attributes.activation;
         
         for (let i = 0; i < count; i++) {
             activations.current[i] *= 0.94;
             const nx = neuronPositions[i*3];
             if (Math.abs(nx - waveX) < 0.5) {
                 activations.current[i] += 0.05;
             }
             if (Math.random() > 0.999) activations.current[i] = 1.0;
             activations.current[i] = Math.min(activations.current[i], 1.0);
             activationAttr.setX(i, activations.current[i]);
         }
         activationAttr.needsUpdate = true;
     }
  });

  return (
    <group ref={groupRef}>
        <points ref={neuronsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={neuronPositions.length / 3}
                    array={neuronPositions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={neuronSizes.length}
                    array={neuronSizes}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-activation"
                    count={neuronPositions.length / 3}
                    array={new Float32Array(neuronPositions.length / 3).fill(0)}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={neuronVertexShader}
                fragmentShader={neuronFragmentShader}
                transparent
                depthWrite={false}
                blending={THREE.NormalBlending} 
            />
        </points>

        <lineSegments ref={linesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={connections.length / 3}
                    array={connections}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={connectionColors.length / 3}
                    array={connectionColors}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial
                vertexColors
                transparent
                opacity={0.4}
                depthWrite={false}
            />
        </lineSegments>

        <points ref={signalsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={signalPositions.length / 3}
                    array={signalPositions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={signalSizes.length}
                    array={signalSizes}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-opacity"
                    count={signalOpacities.length}
                    array={signalOpacities}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={signalVertexShader}
                fragmentShader={signalFragmentShader}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    </group>
  );
};

// Default wrapper for the Dashboard Widget
const BrainVis = () => {
  return (
    <div className="w-full h-[450px] bg-[#fcfbf9] rounded-xl overflow-hidden relative border border-black/10 group">
       <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
         <color attach="background" args={['#fcfbf9']} />
         <fog attach="fog" args={['#fcfbf9', 4, 12]} />
         
         <ambientLight intensity={0.6} />
         <pointLight position={[10, 10, 10]} intensity={1.0} color="#387C6D" />
         
         <BrainSimulation />
       </Canvas>
       
       {/* Reuse HUD Overlay for the widget version */}
       <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <div className="space-y-1">
                 <div className="text-[10px] font-mono text-mncc-primary bg-mncc-primary/10 px-2 py-1 rounded border border-mncc-primary/20 inline-block">
                    MNCC_NEURO_SIM_v4.5
                 </div>
             </div>
             <div className="text-right">
                 <div className="flex items-center gap-2 justify-end text-mncc-accent text-xs font-mono font-bold">
                    <span className="w-2 h-2 bg-mncc-accent rounded-full animate-pulse"></span>
                    LIVE
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default BrainVis;
