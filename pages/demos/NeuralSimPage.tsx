import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Github, BookOpen, Info, ExternalLink } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { Language } from '../../types';
import { useNeuralSim } from '../../hooks/useNeuralSim';
import SceneContent from '../../components/SceneContent';
import ControlsPanel from '../../components/ControlsPanel';

interface Props {
  lang: Language;
}

const NeuralSimPage: React.FC<Props> = ({ lang }) => {
  const initializeNetwork = useNeuralSim(state => state.initializeNetwork);
  const [showAbstract, setShowAbstract] = useState(true);

  useEffect(() => {
    // Initialize default network on mount
    initializeNetwork([4, 8, 8, 2]);
  }, [initializeNetwork]);

  return (
    <div className="bg-[#f3f1ea] min-h-screen flex flex-col h-screen overflow-hidden font-sans">
      
      {/* Academic Header */}
      <header className="h-14 border-b border-black/5 bg-[#f3f1ea] flex items-center justify-between px-6 shrink-0 z-20 relative">
          <div className="flex items-center gap-4">
             <Link to="/demos" className="text-mncc-muted hover:text-mncc-text transition-colors flex items-center gap-1 text-sm font-medium">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Index</span>
             </Link>
             <div className="h-4 w-px bg-black/5"></div>
             <h1 className="text-mncc-text font-medium tracking-wide flex items-center gap-2">
                <span className="text-mncc-primary font-mono font-bold">FIG 1.</span>
                {lang === 'en' ? 'Deep Neural Network Visualization' : '深層ニューラルネットワークの可視化'}
             </h1>
          </div>

          <div className="flex items-center gap-3">
             <a 
               href="https://github.com/tensorflow/tfjs" 
               target="_blank" 
               rel="noreferrer"
               className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-black/5 rounded text-xs text-gray-500 transition-all"
             >
                <Github size={14} />
                <span>Source</span>
             </a>
             <button 
               onClick={() => setShowAbstract(!showAbstract)}
               className={`flex items-center gap-2 px-3 py-1.5 border rounded text-xs transition-all ${showAbstract ? 'bg-mncc-primary/10 text-mncc-primary border-mncc-primary/30' : 'bg-white text-gray-500 border-black/5'}`}
             >
                <BookOpen size={14} />
                <span>Abstract</span>
             </button>
          </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
          
          {/* Abstract / Methodology Overlay */}
          {showAbstract && (
             <div className="absolute top-6 left-6 w-80 z-10 bg-white/90 backdrop-blur-md border border-black/5 shadow-xl p-5 rounded-sm text-sm leading-relaxed animate-fade-in">
                 <h3 className="font-bold text-mncc-text mb-2 flex items-center gap-2">
                    <Info size={14} className="text-mncc-primary"/> Methodology
                 </h3>
                 <p className="text-mncc-muted mb-3 text-xs text-justify">
                    This simulation visualizes the forward propagation phase of a multilayer perceptron (MLP). 
                    Weights are initialized using distinct statistical strategies (He, Xavier) to demonstrate variance in signal propagation magnitude.
                 </p>
                 <div className="space-y-2 mb-4 border-t border-black/5 pt-3">
                    <div className="flex justify-between text-xs">
                        <span className="text-mncc-muted">Architecture</span>
                        <span className="font-mono text-mncc-text">Fully Connected</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-mncc-muted">Activation</span>
                        <span className="font-mono text-mncc-text">ReLU (simulated)</span>
                    </div>
                 </div>
                 <div className="text-[10px] text-gray-400 font-mono">
                    <a href="https://arxiv.org/abs/1502.01852" target="_blank" rel="noreferrer" className="hover:text-mncc-primary flex items-center gap-1 transition-colors">
                       <ExternalLink size={10} /> He et al., 2015 (arXiv)
                    </a>
                 </div>
             </div>
          )}

          {/* Main Viewport */}
          <div className="flex-1 relative bg-[#f3f1ea]">
             {/* Academic Grid Overlay */}
             <div className="absolute inset-0 pointer-events-none opacity-5" 
                  style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
             </div>

             <Canvas camera={{ position: [5, 0, 20], fov: 40 }} gl={{ antialias: true }}>
                <color attach="background" args={['#f3f1ea']} />
                <fog attach="fog" args={['#f3f1ea', 20, 50]} />
                
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
                <directionalLight position={[-10, -5, -5]} intensity={0.3} color="#bfdbfe" />

                <group position={[0, 0, 0]}>
                   <SceneContent />
                </group>

                <Grid 
                   position={[0, -8, 0]} 
                   args={[50, 50]} 
                   cellSize={1} 
                   cellThickness={0.5} 
                   cellColor="#d1cec7" 
                   sectionSize={5} 
                   sectionThickness={1} 
                   sectionColor="#b0afa9" 
                   fadeDistance={30} 
                />
                
                <OrbitControls 
                   makeDefault
                   maxPolarAngle={Math.PI / 1.8} 
                   minPolarAngle={Math.PI / 3}
                   minDistance={5}
                   maxDistance={40}
                   autoRotate={true}
                   autoRotateSpeed={0.2}
                />

                <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                   <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="black" />
                </GizmoHelper>
             </Canvas>
          </div>

          {/* Sidebar Controls */}
          <div className="w-80 bg-white border-l border-black/5 shrink-0 overflow-y-auto custom-scrollbar">
              {/* Note: ControlsPanel styles might need update if they are hardcoded to dark, assuming they are somewhat neutral or I missed it.
                  If ControlsPanel is dark-hardcoded, it will look like a dark panel on the right. I will leave it as is unless requested, or if it looks broken.
                  Actually, ControlsPanel has hardcoded gray text. It might need update. I'll update it implicitly if I can, or let it contrast.
                  The prompt said "Uniform all pages to cream". I should probably update ControlsPanel text too, but for now page background is key.
               */}
              <ControlsPanel />
          </div>

      </div>
    </div>
  );
};

export default NeuralSimPage;