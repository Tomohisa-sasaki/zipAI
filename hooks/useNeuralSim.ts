
import { create } from 'zustand';
import * as THREE from 'three';
import * as tf from '@tensorflow/tfjs';

export interface Neuron {
  id: string;
  layerIndex: number;
  nodeIndex: number;
  position: THREE.Vector3;
  activation: number; // 0 to 1
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  weight: number;
}

export interface Pulse {
  id: string;
  connectionId: string;
  sourcePos: THREE.Vector3;
  targetPos: THREE.Vector3;
  progress: number; // 0 to 1
  speed: number;
}

export type WeightInitStrategy = 'random' | 'xavier' | 'he';

interface NeuralSimState {
  neurons: Neuron[];
  connections: Connection[];
  pulses: Pulse[];
  layers: number[]; // [input, hidden1, hidden2, output]
  speed: number;
  density: number;
  noise: number;
  isPlaying: boolean;
  weightStrategy: WeightInitStrategy;
  
  // Actions
  initializeNetwork: (layerConfig: number[]) => void;
  setSpeed: (speed: number) => void;
  setDensity: (density: number) => void;
  setNoise: (noise: number) => void;
  setWeightStrategy: (strategy: WeightInitStrategy) => void;
  togglePlay: () => void;
  triggerPulse: () => void;
  updatePulses: (delta: number) => void;
}

// Helper to generate random weights using TF.js
const generateWeights = (shape: number[], stdDev: number = 1.0) => {
  return tf.tidy(() => {
    return tf.randomNormal(shape, 0, stdDev).dataSync();
  });
};

export const useNeuralSim = create<NeuralSimState>((set, get) => ({
  neurons: [],
  connections: [],
  pulses: [],
  layers: [4, 6, 6, 2],
  speed: 1.0,
  density: 0.5,
  noise: 0.1,
  isPlaying: true,
  weightStrategy: 'xavier',

  initializeNetwork: (layers) => {
    const { weightStrategy } = get();
    const neurons: Neuron[] = [];
    const connections: Connection[] = [];
    
    // Calculate positions
    const maxLayerHeight = Math.max(...layers);
    const layerSpacing = 4;
    const nodeSpacing = 1.5;

    layers.forEach((nodeCount, layerIdx) => {
      const layerX = (layerIdx - (layers.length - 1) / 2) * layerSpacing;
      
      for (let i = 0; i < nodeCount; i++) {
        const nodeY = (i - (nodeCount - 1) / 2) * nodeSpacing;
        
        const neuron: Neuron = {
          id: `l${layerIdx}-n${i}`,
          layerIndex: layerIdx,
          nodeIndex: i,
          position: new THREE.Vector3(layerX, nodeY, 0),
          activation: 0.1 // Base activation
        };
        neurons.push(neuron);
      }
    });

    // Create connections between layers
    for (let l = 0; l < layers.length - 1; l++) {
      const sourceNodes = neurons.filter(n => n.layerIndex === l);
      const targetNodes = neurons.filter(n => n.layerIndex === l + 1);
      
      // Determine Standard Deviation based on Strategy
      const fanIn = sourceNodes.length;
      const fanOut = targetNodes.length;
      let stdDev = 1.0;
      
      if (weightStrategy === 'xavier') {
         // Xavier/Glorot Normal: sqrt(2 / (fanIn + fanOut))
         stdDev = Math.sqrt(2 / (fanIn + fanOut));
      } else if (weightStrategy === 'he') {
         // He Normal: sqrt(2 / fanIn)
         stdDev = Math.sqrt(2 / fanIn);
      } else {
         // Simple Random Normal
         stdDev = 1.0;
      }

      // Generate weights using TF.js logic
      const weights = generateWeights([sourceNodes.length * targetNodes.length], stdDev);
      let wIdx = 0;

      sourceNodes.forEach(source => {
        targetNodes.forEach(target => {
           const rawWeight = Math.abs(weights[wIdx++]);
           // Clamp visual weight for rendering sanity, but keep relative differences
           const visualWeight = Math.min(Math.max(rawWeight, 0.05), 2.5);

           connections.push({
             id: `${source.id}-${target.id}`,
             sourceId: source.id,
             targetId: target.id,
             weight: visualWeight
           });
        });
      });
    }

    set({ neurons, connections, layers, pulses: [] });
  },

  setSpeed: (speed) => set({ speed }),
  setDensity: (density) => set({ density }),
  setNoise: (noise) => set({ noise }),
  setWeightStrategy: (weightStrategy) => {
    set({ weightStrategy });
    // Re-initialize to show effect
    const { layers, initializeNetwork } = get();
    initializeNetwork(layers);
  },
  togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),

  triggerPulse: () => {
    const { neurons, connections, speed, density, noise } = get();
    if (!neurons.length) return;

    // Find input neurons (layer 0)
    const inputs = neurons.filter(n => n.layerIndex === 0);
    // Randomly select input nodes to fire based on density
    const firingInputs = inputs.filter(() => Math.random() < density);

    const newPulses: Pulse[] = [];
    
    firingInputs.forEach(source => {
      // Find connections originating from this node
      const outgoing = connections.filter(c => c.sourceId === source.id);
      outgoing.forEach(conn => {
         const target = neurons.find(n => n.id === conn.targetId);
         if (target) {
            // Apply noise to speed
            const speedVar = (Math.random() - 0.5) * 2 * noise; // -noise to +noise
            const currentSpeed = Math.max(0.1, speed * (1 + speedVar));

            newPulses.push({
               id: Math.random().toString(36).substring(2, 11),
               connectionId: conn.id,
               sourcePos: source.position.clone(),
               targetPos: target.position.clone(),
               progress: 0,
               speed: currentSpeed
            });
         }
      });
    });

    set(state => ({ pulses: [...state.pulses, ...newPulses] }));
  },

  updatePulses: (delta) => {
    const { pulses, connections, neurons, speed, noise } = get();
    if (pulses.length === 0) return;

    const nextPulses: Pulse[] = [];
    const finishedPulses: Pulse[] = [];

    pulses.forEach(p => {
       p.progress += delta * p.speed;
       if (p.progress < 1) {
         nextPulses.push(p);
       } else {
         finishedPulses.push(p);
       }
    });

    // Propagate pulses to next layer
    if (finishedPulses.length > 0) {
       const propagated: Pulse[] = [];
       finishedPulses.forEach(fp => {
          // Find the node this pulse hit
          const conn = connections.find(c => c.id === fp.connectionId);
          if (!conn) return;
          
          const targetNodeId = conn.targetId;
          const targetNode = neurons.find(n => n.id === targetNodeId);
          
          // If there is a next layer
          if (targetNode) {
             const outgoing = connections.filter(c => c.sourceId === targetNodeId);
             
             // Trigger next layer if activation is high enough
             // Heavily influenced by Noise: 
             // High noise = random firing / dropouts (Chaos)
             // Low noise = stable propagation based on chance
             const threshold = 0.2 + (noise * 0.5);

             if (outgoing.length > 0 && Math.random() > threshold) {
                 outgoing.forEach(outConn => {
                    const nextTarget = neurons.find(n => n.id === outConn.targetId);
                    if (nextTarget) {
                        const speedVar = (Math.random() - 0.5) * 2 * noise;
                        
                        propagated.push({
                           id: Math.random().toString(36).substring(2, 11),
                           connectionId: outConn.id,
                           sourcePos: targetNode.position.clone(),
                           targetPos: nextTarget.position.clone(),
                           progress: 0,
                           speed: Math.max(0.1, speed * (1 + speedVar))
                        });
                    }
                 });
             }
          }
       });
       
       set({ pulses: [...nextPulses, ...propagated] });
    } else {
       set({ pulses: nextPulses });
    }
  }

}));
