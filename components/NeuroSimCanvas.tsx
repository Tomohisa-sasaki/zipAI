import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Activity } from 'lucide-react';
import '../types';

// -----------------------------------------------------------------------------
// Types & Constants
// -----------------------------------------------------------------------------
const DYNAMICS = {
  decay: 0.94,
  sigma: 0.02,
  alpha: 0.08,
};

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

/**
 * HSL to RGB conversion helper for coloring nodes based on activity.
 */
function getHeatColor(value: number, target: THREE.Color) {
  const v = Math.max(0, Math.min(1, value));
  // Hue 0.66 (Blue) -> 0.0 (Red)
  const hue = (1.0 - v) * 0.66;
  const saturation = 0.9;
  const lightness = 0.55;
  target.setHSL(hue, saturation, lightness);
}

/**
 * Generate a random graph within a sphere.
 */
function generateGraph(N: number, k: number, maxEdges: number) {
  const positions = new Float32Array(N * 3);

  // 1. Generate points
  for (let i = 0; i < N; i++) {
    let x, y, z, d;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      z = Math.random() * 2 - 1;
      d = x * x + y * y + z * z;
    } while (d > 1 || d === 0);
    
    const r = Math.cbrt(Math.random()) * 4.5; 
    const norm = 1 / Math.sqrt(d);
    
    positions[i * 3] = x * norm * r;
    positions[i * 3 + 1] = y * norm * r;
    positions[i * 3 + 2] = z * norm * r;
  }

  // 2. Generate edges (k-NN)
  const edges: number[] = [];
  const connectivity = new Float32Array(N * N); 
  
  for (let i = 0; i < N; i++) {
    const dists: { idx: number; d: number }[] = [];
    const p1 = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);

    for (let j = 0; j < N; j++) {
      if (i === j) continue;
      const p2 = new THREE.Vector3(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
      dists.push({ idx: j, d: p1.distanceToSquared(p2) });
    }

    dists.sort((a, b) => a.d - b.d);

    for (let m = 0; m < Math.min(k, dists.length); m++) {
      const neighbor = dists[m];
      const j = neighbor.idx;
      
      const w = Math.exp(-neighbor.d * 0.5);
      connectivity[i * N + j] = w;
      
      if (i < j && edges.length < maxEdges * 6) { // Fixed buffer check logic
        edges.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        edges.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
      }
    }
  }

  for (let i = 0; i < N; i++) {
    let sum = 0;
    for (let j = 0; j < N; j++) sum += connectivity[i * N + j];
    if (sum > 0.0001) {
      for (let j = 0; j < N; j++) connectivity[i * N + j] /= sum;
    }
  }

  return { positions, edges: new Float32Array(edges), connectivity };
}

// -----------------------------------------------------------------------------
// Shader for Slices (fMRI activity)
// -----------------------------------------------------------------------------
const sliceVertexShader = `
varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vPos = position;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const sliceFragmentShader = `
uniform float u_time;
varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

// 3D Noise 
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857; 
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.5;
    for (int i = 0; i < 4; i++) {
        value += amplitude * snoise(p * frequency);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value + 0.5;
}

// Pseudo-Turbo Colormap
vec3 turbo(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 c0 = vec3(0.19, 0.07, 0.23);
    vec3 c1 = vec3(0.07, 0.16, 0.53);
    vec3 c2 = vec3(0.23, 0.74, 0.40);
    vec3 c3 = vec3(0.95, 0.84, 0.20);
    vec3 c4 = vec3(0.95, 0.25, 0.13);
    if (t < 0.25) return mix(c0, c1, t * 4.0);
    if (t < 0.50) return mix(c1, c2, (t - 0.25) * 4.0);
    if (t < 0.75) return mix(c2, c3, (t - 0.50) * 4.0);
    return mix(c3, c4, (t - 0.75) * 4.0);
}

void main() {
    float t = u_time;
    // Undulating Time & Position for complexity
    vec3 pos = vPos * 0.8 + vec3(t * 0.1, sin(t * 0.3) * 0.2, t * 0.05);
    pos.x += sin(vPos.y * 2.0 + t * 0.5) * 0.1;

    float noiseVal = fbm(pos);
    
    float d = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
    float alpha = 1.0 - smoothstep(0.4, 0.5, d);
    
    vec3 color = turbo(noiseVal);
    
    // Dynamic Lighting / Ripple Effect
    vec3 lightDir = normalize(vec3(sin(t * 0.4), cos(t * 0.3), 0.5));
    float incidence = dot(vNormal, lightDir);

    // Ripple based on distance from center + time + incidence angle
    float dist = length(vPos.xy);
    float ripple = sin(dist * 12.0 - t * 3.0 + incidence * 3.0);
    float rippleEffect = smoothstep(0.8, 1.0, ripple) * 0.15; // Subtle ripple

    // Banding effect
    float band = sin(vPos.x * 20.0 + t + incidence * 5.0);
    float bandEffect = smoothstep(0.9, 0.95, band) * 0.05;

    float scan = sin(vUv.y * 100.0 + t * 2.0) * 0.04;

    vec3 finalColor = color + vec3(rippleEffect + bandEffect + scan);
    gl_FragColor = vec4(finalColor, alpha * 0.55);
}
`;

// -----------------------------------------------------------------------------
// Component: Network
// -----------------------------------------------------------------------------
const Network: React.FC<{
  nodeCount: number;
  reduceMotion: boolean;
}> = ({ nodeCount, reduceMotion }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Initialize Graph
  const { positions, edges, connectivity } = useMemo(() => {
    return generateGraph(nodeCount, 6, 2000);
  }, [nodeCount]);

  // State for dynamics
  const state = useRef({
    x: new Float32Array(nodeCount).fill(0).map(() => Math.random()),
    y: new Float32Array(nodeCount).fill(0).map(() => Math.random()),
  });

  const tempColor = useMemo(() => new THREE.Color(), []);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!meshRef.current || !linesRef.current) return;
    const dt = Math.min(delta, 0.1);
    const { x, y } = state.current;
    const N = nodeCount;

    if (reduceMotion) {
       for (let i = 0; i < N; i++) {
         x[i] = THREE.MathUtils.lerp(x[i], 0, dt * 2.0);
         y[i] = THREE.MathUtils.lerp(y[i], 0, dt * 0.5);
       }
    } else {
       const nextX = new Float32Array(x);
       for (let i = 0; i < N; i++) {
         let input = 0;
         for (let j = 0; j < N; j++) {
           const w = connectivity[i * N + j];
           if (w > 0) input += w * x[j];
         }
         const noise = (Math.random() - 0.5) * DYNAMICS.sigma * 4.0; 
         let val = x[i] * DYNAMICS.decay + input * 0.2 + noise;
         nextX[i] = Math.max(0, Math.min(1, val));
         y[i] = y[i] + DYNAMICS.alpha * (nextX[i] - y[i]);
       }
       for(let i=0; i<N; i++) x[i] = nextX[i];
    }

    for (let i = 0; i < N; i++) {
      tempPos.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      const s = 1.0 + 0.6 * y[i];
      tempMatrix.makeScale(s, s, s);
      tempMatrix.setPosition(tempPos);
      meshRef.current.setMatrixAt(i, tempMatrix);
      getHeatColor(y[i], tempColor);
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, nodeCount]}>
        <icosahedronGeometry args={[0.06, 1]} />
        <meshBasicMaterial />
      </instancedMesh>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={edges.length / 3}
            array={edges}
            itemSize={3}
          />
           <bufferAttribute 
              attach="attributes-color" 
              count={edges.length / 3} 
              array={new Float32Array(edges.length).fill(0.5)} 
              itemSize={3}
           />
        </bufferGeometry>
        <lineBasicMaterial 
            vertexColors 
            transparent 
            opacity={0.15} 
            blending={THREE.AdditiveBlending} 
            color={new THREE.Color(0.4, 0.6, 1.0)}
            depthWrite={false}
        />
      </lineSegments>
    </group>
  );
};

// -----------------------------------------------------------------------------
// Component: Slices
// -----------------------------------------------------------------------------
const Slices: React.FC = () => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (shaderRef.current) {
      const t = state.clock.elapsedTime;
      // Animate time uniform with a slower, undulating pattern
      shaderRef.current.uniforms.u_time.value = t * 0.08 + Math.sin(t * 0.4) * 0.8;
    }
  });

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
  }), []);

  const commonProps = {
    vertexShader: sliceVertexShader,
    fragmentShader: sliceFragmentShader,
    uniforms: uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  };

  return (
    <group>
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[10, 10]} />
        <shaderMaterial ref={shaderRef} {...commonProps} />
      </mesh>
      <mesh position={[-2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 10]} />
        <shaderMaterial {...commonProps} />
      </mesh>
       <mesh position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <shaderMaterial {...commonProps} />
      </mesh>
    </group>
  );
};

// -----------------------------------------------------------------------------
// Component: PerfMonitor (Overlay)
// -----------------------------------------------------------------------------
const PerfMonitor: React.FC<{ nodeCount: number }> = ({ nodeCount }) => {
  const [fps, setFps] = useState(0);
  
  useEffect(() => {
    let frames = 0;
    let prevTime = performance.now();
    let reqId: number;

    const loop = () => {
      frames++;
      const time = performance.now();
      if (time >= prevTime + 1000) {
        setFps(Math.round((frames * 1000) / (time - prevTime)));
        frames = 0;
        prevTime = time;
      }
      reqId = requestAnimationFrame(loop);
    };
    reqId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqId);
  }, []);

  const approxEdges = Math.min(nodeCount * 3, 2000); 

  return (
    <div className="absolute top-4 left-4 z-50 bg-black/80 backdrop-blur border border-mncc-primary/30 p-3 rounded-lg shadow-xl text-xs font-mono pointer-events-none">
       <div className="text-mncc-primary font-bold mb-1 flex items-center gap-2">
          <Activity size={12} /> MONITOR
       </div>
       <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-300">
          <span>FPS:</span>
          <span className={fps < 30 ? "text-red-400" : "text-green-400"}>{fps}</span>
          <span>NODES:</span>
          <span>{nodeCount}</span>
          <span>EDGES:</span>
          <span>~{approxEdges}</span>
       </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Component: Performance Monitor & Canvas Wrapper
// -----------------------------------------------------------------------------
const NeuroSimCanvas: React.FC = () => {
  const [nodeCount, setNodeCount] = useState(280);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [dpr, setDpr] = useState([1, 2]);
  const [showPerf, setShowPerf] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setNodeCount(180);
      setDpr([1, 1.5]);
    }

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div className="w-full h-full relative group">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 45 }}
        dpr={dpr as [number, number]}
        role="img"
        aria-label="Neural network with fMRI-like activity"
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={['#0b1020']} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        
        <group>
             <Network nodeCount={nodeCount} reduceMotion={reduceMotion} />
             <Slices />
        </group>

        <OrbitControls 
          enablePan={false}
          autoRotate={!reduceMotion}
          autoRotateSpeed={1.0}
        />
      </Canvas>

      {/* Overlay Controls */}
      <div className="absolute bottom-4 left-4 z-50 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
         <button 
            onClick={() => setShowPerf(!showPerf)}
            className={`p-2 rounded-full transition-all border border-white/10 ${showPerf ? 'bg-mncc-primary text-white' : 'bg-black/50 backdrop-blur text-gray-400 hover:bg-white/20 hover:text-white'}`}
            title="Toggle Performance Monitor"
         >
            <Activity size={18} />
         </button>
      </div>

      {/* Monitor Overlay */}
      {showPerf && <PerfMonitor nodeCount={nodeCount} />}
    </div>
  );
};

export default NeuroSimCanvas;
