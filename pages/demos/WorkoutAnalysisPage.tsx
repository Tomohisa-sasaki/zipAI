import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows, Environment, PerspectiveCamera, BakeShadows, SoftShadows } from '@react-three/drei';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, Dumbbell, BarChart3, Play, Pause, Layers, Eye, EyeOff, Info, Zap } from 'lucide-react';
import { Language } from '../../types';
import { useWorkoutAI, ExerciseType } from '../../hooks/useWorkoutAI';
import { BiomechanicalBody } from '../../components/BiomechanicalBody';

interface Props {
  lang: Language;
}

const WorkoutAnalysisPage: React.FC<Props> = ({ lang }) => {
  const { 
      exercise, setExercise, 
      load, setLoad, 
      isPlaying, setIsPlaying,
      speed, setSpeed,
      viewMode, setViewMode,
      currentProfile 
  } = useWorkoutAI();

  return (
    <div className="bg-[#f3f1ea] min-h-screen flex flex-col font-sans overflow-hidden h-screen selection:bg-mncc-primary/30">
       
       {/* Header */}
       <div className="h-14 border-b border-black/5 flex items-center justify-between px-6 bg-[#f3f1ea] z-20 shadow-sm">
          <div className="flex items-center gap-4">
             <Link to="/demos" className="text-mncc-text hover:text-mncc-primary transition-colors p-2 hover:bg-black/5 rounded-full">
                <ArrowLeft size={18} />
             </Link>
             <div>
                <h1 className="text-mncc-text font-bold flex items-center gap-2 text-sm md:text-base tracking-wide">
                   <Activity className="text-mncc-primary" size={16} />
                   BIOMECHANICS_LAB <span className="text-[10px] text-mncc-muted font-mono">v2.4.0</span>
                </h1>
             </div>
          </div>
          
          {/* Visualization Legend */}
          <div className="hidden md:flex items-center gap-6">
             <div className="flex items-center gap-3 text-[10px] font-mono text-mncc-muted bg-white px-4 py-2 rounded-full border border-black/5 shadow-sm">
                <span>EMG ACTIVATION:</span>
                <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span> LOW
                   <div className="w-12 h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-emerald-500 rounded-full"></div>
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> PEAK
                </div>
             </div>
          </div>
       </div>

       <div className="flex-1 flex overflow-hidden relative">
          
          {/* Left Sidebar: Controls */}
          <div className="w-80 bg-white/95 backdrop-blur-xl border-r border-black/5 flex flex-col z-20 shadow-xl">
              <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar h-full">
                 
                 {/* Exercise Selector */}
                 <div>
                    <h3 className="text-[10px] font-bold text-mncc-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Dumbbell size={12} /> Movement Pattern
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {(['SQUAT', 'BENCH_PRESS', 'DEADLIFT'] as ExerciseType[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => setExercise(t)}
                                className={`group flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-xs font-bold tracking-wide ${
                                    exercise === t 
                                    ? 'bg-mncc-primary/10 border-mncc-primary/50 text-mncc-primary shadow-sm' 
                                    : 'bg-[#fcfbf9] border-transparent text-mncc-muted hover:bg-black/5 hover:text-mncc-text'
                                }`}
                            >
                                {t.replace('_', ' ')}
                                {exercise === t && <div className="w-1.5 h-1.5 rounded-full bg-mncc-primary"></div>}
                            </button>
                        ))}
                    </div>
                    
                    <div className="mt-4 bg-[#fcfbf9] border border-black/5 p-4 rounded-lg">
                        <div className="flex gap-2 text-mncc-primary mb-2">
                            <Info size={14} />
                            <span className="text-[10px] font-bold uppercase">Kinematics</span>
                        </div>
                        <p className="text-[11px] text-mncc-muted leading-relaxed font-mono">
                            {currentProfile.description}
                        </p>
                    </div>
                 </div>

                 {/* Playback & Simulation */}
                 <div>
                    <h3 className="text-[10px] font-bold text-mncc-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Layers size={12} /> Load Parameters
                    </h3>
                    <div className="bg-[#fcfbf9] p-5 rounded-xl border border-black/5 space-y-5 relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
                             <BarChart3 size={64} />
                        </div>

                        <div>
                           <div className="flex justify-between text-[10px] mb-2">
                                <span className="text-mncc-muted font-bold">EXTERNAL LOAD (1RM%)</span>
                                <span className="text-mncc-primary font-mono font-bold">{(load * 100).toFixed(0)}%</span>
                           </div>
                           <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                               <div className="absolute top-0 left-0 h-full bg-mncc-primary transition-all duration-300" style={{ width: `${load*100}%` }}></div>
                               <input 
                                    type="range" 
                                    min="0.1" 
                                    max="1.2" 
                                    step="0.05"
                                    value={load}
                                    onChange={(e) => setLoad(parseFloat(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                               />
                           </div>
                           {load > 1.0 && <div className="text-[9px] text-red-500 mt-1 flex items-center gap-1 font-bold"><Zap size={8}/> OVERLOAD WARNING</div>}
                        </div>

                        {/* Playback */}
                        <div className="flex items-center justify-between pt-2">
                            <button 
                               onClick={() => setIsPlaying(!isPlaying)} 
                               className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all ${isPlaying ? 'bg-mncc-primary text-white shadow-md' : 'bg-black/5 text-gray-400 hover:bg-black/10'}`}
                            >
                                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                            </button>
                            
                            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-black/5 shadow-sm">
                                {[0.5, 1.0, 2.0].map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => setSpeed(s)}
                                        className={`px-2 py-1 rounded-md text-[9px] font-mono transition-all ${speed === s ? 'bg-mncc-primary/20 text-mncc-primary font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {s}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Visualization Modes */}
                 <div>
                    <h3 className="text-[10px] font-bold text-mncc-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Eye size={12} /> Render Mode
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                           onClick={() => setViewMode('CLEAN')}
                           className={`px-2 py-2 rounded-lg text-[9px] font-bold border transition-all flex flex-col items-center justify-center gap-1 ${viewMode === 'CLEAN' ? 'bg-mncc-bg border-black/10 text-mncc-text' : 'bg-[#fcfbf9] border-transparent text-gray-400'}`}
                        >
                           <EyeOff size={14} /> SILHOUETTE
                        </button>
                        <button 
                           onClick={() => setViewMode('DETAIL')}
                           className={`px-2 py-2 rounded-lg text-[9px] font-bold border transition-all flex flex-col items-center justify-center gap-1 ${viewMode === 'DETAIL' ? 'bg-mncc-primary/10 border-mncc-primary/50 text-mncc-primary' : 'bg-[#fcfbf9] border-transparent text-gray-400'}`}
                        >
                           <BarChart3 size={14} /> ANATOMY
                        </button>
                        <button 
                           onClick={() => setViewMode('XRAY')}
                           className={`px-2 py-2 rounded-lg text-[9px] font-bold border transition-all flex flex-col items-center justify-center gap-1 ${viewMode === 'XRAY' ? 'bg-mncc-accent/10 border-mncc-accent/50 text-mncc-accent' : 'bg-[#fcfbf9] border-transparent text-gray-400'}`}
                        >
                           <Zap size={14} /> FIBERS
                        </button>
                    </div>
                 </div>

              </div>
          </div>

          {/* Main 3D Viewport */}
          <div className="flex-1 relative bg-[#f3f1ea]">
              {/* Technical Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-5" 
                   style={{ 
                       backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', 
                       backgroundSize: '20px 20px' 
                   }}>
              </div>

              <Canvas shadows dpr={[1, 2]} gl={{ toneMappingExposure: 1.2, antialias: true }}>
                  <PerspectiveCamera makeDefault position={currentProfile.cameraPosition as any} fov={35} />
                  <color attach="background" args={['#f3f1ea']} />
                  <fog attach="fog" args={['#f3f1ea', 5, 20]} />
                  
                  <ambientLight intensity={0.6} />
                  <spotLight 
                    position={[5, 8, 5]} 
                    angle={0.4} 
                    penumbra={1} 
                    intensity={1.5} 
                    castShadow 
                    shadow-bias={-0.0001}
                  />
                  <pointLight position={[-5, 2, -5]} intensity={0.8} color="#387C6D" distance={10} />
                  <pointLight position={[5, 0, 5]} intensity={0.5} color="#5D9CEC" distance={10} />
                  
                  <group position={[0, -1, 0]}>
                      <BiomechanicalBody 
                          exercise={exercise} 
                          profile={currentProfile}
                          load={load}
                          isPlaying={isPlaying}
                          speed={speed}
                          viewMode={viewMode}
                      />
                      
                      <ContactShadows opacity={0.4} scale={20} blur={2.5} far={4} color="#2d2d2d" />
                      
                      <Grid 
                        args={[30, 30]} 
                        cellSize={1} 
                        cellThickness={0.5} 
                        cellColor="#d1cec7" 
                        sectionSize={5} 
                        sectionThickness={1} 
                        sectionColor="#b0afa9" 
                        fadeDistance={20} 
                        position={[0, -0.01, 0]}
                    />
                  </group>

                  <OrbitControls 
                      minPolarAngle={Math.PI / 6} 
                      maxPolarAngle={Math.PI / 1.8}
                      minDistance={3}
                      maxDistance={12}
                      enablePan={false}
                      autoRotate={false}
                  />
                  
                  <BakeShadows />
                  <SoftShadows size={10} focus={0} samples={10} />
              </Canvas>
              
              {/* Viewport Overlay */}
              <div className="absolute bottom-6 right-6 pointer-events-none text-right">
                 <div className="text-[10px] text-mncc-muted font-mono">REAL-TIME PHYSICS ENGINE</div>
                 <div className="text-xs text-mncc-text font-bold flex items-center justify-end gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    SIMULATION ACTIVE
                 </div>
              </div>
          </div>

       </div>
    </div>
  );
};

export default WorkoutAnalysisPage;