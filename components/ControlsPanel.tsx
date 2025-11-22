import React from 'react';
import { Play, Pause, RotateCcw, GitBranch, Layers, Activity, Sliders, Zap } from 'lucide-react';
import { useNeuralSim, WeightInitStrategy } from '../hooks/useNeuralSim';

const ControlsPanel: React.FC = () => {
  const { 
    layers, 
    speed, 
    density, 
    noise,
    isPlaying, 
    weightStrategy,
    initializeNetwork, 
    setSpeed, 
    setDensity, 
    setNoise,
    setWeightStrategy,
    togglePlay 
  } = useNeuralSim();

  return (
    <div className="p-5 space-y-8 text-sm font-sans text-gray-300">
       
       {/* Status Section */}
       <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
             <Activity size={12} /> Simulation Status
          </div>
          <div className="grid grid-cols-2 gap-2">
             <button 
               onClick={togglePlay}
               className={`flex items-center justify-center gap-2 py-2 rounded text-xs font-medium border transition-all ${isPlaying ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'}`}
             >
                {isPlaying ? <><Pause size={14}/> Halt</> : <><Play size={14}/> Run</>}
             </button>
             <button 
               onClick={() => initializeNetwork(layers)}
               className="flex items-center justify-center gap-2 py-2 bg-[#1c1f26] hover:bg-[#252932] border border-white/10 rounded text-xs font-medium text-gray-300 transition-all"
             >
                <RotateCcw size={14} /> Reset
             </button>
          </div>
       </div>

       {/* Parameters Section */}
       <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
             <Sliders size={12} /> Hyperparameters
          </div>
          
          <div className="space-y-5">
             <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                   <span>Propagation Velocity ($v$)</span>
                   <span className="font-mono text-white">{speed.toFixed(2)}</span>
                </div>
                <input 
                   type="range" 
                   min="0.1" 
                   max="3.0" 
                   step="0.1" 
                   value={speed}
                   onChange={(e) => setSpeed(parseFloat(e.target.value))}
                   className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
                />
             </div>

             <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                   <span>Input Density ($\rho$)</span>
                   <span className="font-mono text-white">{density.toFixed(2)}</span>
                </div>
                <input 
                   type="range" 
                   min="0.1" 
                   max="1.0" 
                   step="0.1" 
                   value={density}
                   onChange={(e) => setDensity(parseFloat(e.target.value))}
                   className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
                />
             </div>

             <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                   <span>Stochastic Noise ($\epsilon$)</span>
                   <span className="font-mono text-white">{noise.toFixed(2)}</span>
                </div>
                <input 
                   type="range" 
                   min="0.0" 
                   max="0.8" 
                   step="0.05" 
                   value={noise}
                   onChange={(e) => setNoise(parseFloat(e.target.value))}
                   className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
                />
             </div>
          </div>
       </div>

       {/* Configuration Section */}
       <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
             <Layers size={12} /> Topology
          </div>
          
          <div className="space-y-2">
              <label className="text-xs text-gray-400">Hidden Layer Config</label>
              <select 
                 className="w-full bg-[#1c1f26] border border-white/10 text-white text-xs rounded p-2 outline-none focus:border-blue-500"
                 onChange={(e) => initializeNetwork(JSON.parse(e.target.value))}
                 value={JSON.stringify(layers)}
              >
                 <option value={JSON.stringify([4, 8, 4, 2])}>Shallow (4-8-4-2)</option>
                 <option value={JSON.stringify([4, 12, 12, 4])}>Deep (4-12-12-4)</option>
                 <option value={JSON.stringify([4, 6, 8, 6, 2])}>Bottleneck (Autoencoder)</option>
              </select>
          </div>
       </div>

       {/* Weights Section */}
       <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
             <GitBranch size={12} /> Initialization
          </div>
          
          <div className="grid grid-cols-3 gap-1">
             {(['random', 'xavier', 'he'] as WeightInitStrategy[]).map((s) => (
                <button
                   key={s}
                   onClick={() => setWeightStrategy(s)}
                   className={`py-1.5 text-[10px] uppercase font-mono border rounded transition-all ${
                      weightStrategy === s
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                      : 'border-transparent bg-[#1c1f26] text-gray-500 hover:text-gray-300'
                   }`}
                >
                   {s}
                </button>
             ))}
          </div>
          <p className="text-[10px] text-gray-500 mt-2 leading-snug">
             *Weights ($w$) generated via {weightStrategy === 'xavier' ? 'Glorot uniform' : weightStrategy === 'he' ? 'He normal' : 'Gaussian'} distribution.
          </p>
       </div>

       <div className="pt-4 border-t border-white/5">
          <div className="bg-blue-900/10 border border-blue-500/10 rounded p-3 flex gap-3">
             <Zap size={16} className="text-blue-500 shrink-0 mt-0.5" />
             <div>
                <div className="text-xs font-bold text-blue-400 mb-1">TensorFlow.js Integration</div>
                <p className="text-[10px] text-gray-400">
                   Linear algebra operations for weight matrix initialization are performed client-side via TF.js tensors.
                </p>
             </div>
          </div>
       </div>

    </div>
  );
};

export default ControlsPanel;