
import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ArrowLeft, RefreshCw, Play, Radio, BoxSelect, Ruler, Activity, Zap, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRocketSim, TelemetryData } from '../../hooks/useRocketSim';
import { RocketScene } from '../../components/RocketScene';
import { Language } from '../../types';

const BlueprintPanel: React.FC<{ data: TelemetryData }> = ({ data }) => {
    const formatNum = (n: number, d: number = 1) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    const maxFuel = 18000; // Defined in simulation config
    const fuelPercent = (data.fuel / maxFuel) * 100;
    const gForce = (data.acceleration / 9.81); // Approx G excluding gravity compensation in physics
    const totalG = gForce + 1; // Approx felt G (standing still = 1G)

    return (
        <div className="bg-white/90 backdrop-blur-md border border-mncc-primary/20 p-2 md:p-6 font-mono text-xs md:text-sm shadow-2xl w-full md:w-80 relative overflow-hidden group text-mncc-text transition-all">
            {/* Technical Decals */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-mncc-primary/50"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-mncc-primary/50"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-mncc-primary/50"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-mncc-primary/50"></div>

            <div className="flex items-center justify-between mb-2 md:mb-6 border-b border-dashed border-mncc-primary/20 pb-1 md:pb-2">
                <h3 className="text-mncc-primary font-bold text-[10px] md:text-xs tracking-widest flex items-center gap-2">
                    <Radio size={12} className={data.status !== 'LANDED' ? "animate-pulse" : "text-gray-400"} />
                    <span className="hidden md:inline">FLIGHT TELEMETRY</span>
                    <span className="md:hidden">TELEMETRY</span>
                </h3>
                <span className={`px-1.5 py-0.5 border text-[9px] md:text-[10px] font-bold ${data.status === 'ASCENT' ? 'border-mncc-primary/50 text-white bg-mncc-primary' : 'border-black/10 text-gray-500'}`}>
                    {data.status}
                </span>
            </div>

            <div className="space-y-1 md:space-y-6">
                
                {/* Primary Stats Grid - Compact 4-col on mobile, 2-col on desktop */}
                <div className="grid grid-cols-4 md:grid-cols-2 gap-px bg-mncc-primary/20 border border-mncc-primary/20">
                    <div className="bg-[#f3f1ea] p-1.5 md:p-3 col-span-1">
                        <div className="text-[8px] md:text-[10px] text-gray-500 mb-0.5">ALT</div>
                        <div className="text-xs md:text-xl text-mncc-text tracking-tighter font-bold">{formatNum(data.altitude, 0)} <span className="hidden md:inline text-[10px] text-gray-600 font-normal">m</span></div>
                    </div>
                    <div className="bg-[#f3f1ea] p-1.5 md:p-3 col-span-1">
                        <div className="text-[8px] md:text-[10px] text-gray-500 mb-0.5">VEL</div>
                        <div className="text-xs md:text-xl text-mncc-text tracking-tighter font-bold">{formatNum(data.velocity, 0)} <span className="hidden md:inline text-[10px] text-gray-600 font-normal">m/s</span></div>
                    </div>
                    
                    {/* Compact Fuel/G for mobile */}
                    <div className="bg-[#f3f1ea] p-1.5 md:p-3 col-span-1 md:hidden">
                        <div className="text-[8px] text-gray-500 mb-0.5">FUEL</div>
                        <div className={`text-xs tracking-tighter font-bold ${fuelPercent < 20 ? 'text-red-500' : 'text-mncc-text'}`}>{fuelPercent.toFixed(0)}%</div>
                    </div>
                    <div className="bg-[#f3f1ea] p-1.5 md:p-3 col-span-1 md:hidden">
                        <div className="text-[8px] text-gray-500 mb-0.5">G-LD</div>
                        <div className="text-xs tracking-tighter font-bold text-mncc-text">{totalG.toFixed(1)}</div>
                    </div>
                </div>

                {/* Desktop-only Visual Gauges */}
                <div className="hidden md:grid grid-cols-1 gap-4">
                    
                    {/* G-Force Meter */}
                    <div className="col-span-1">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span className="flex items-center gap-1"><Gauge size={10}/> G-LOAD</span>
                            <span className="text-mncc-text font-bold">{totalG.toFixed(1)} G</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-sm overflow-hidden border border-black/5 relative">
                            <div className="absolute left-1/4 h-full w-px bg-white"></div>
                            <div className="absolute left-1/2 h-full w-px bg-white"></div>
                            <div className="absolute left-3/4 h-full w-px bg-white"></div>
                            <div 
                                className={`h-full transition-all duration-100 ease-out ${totalG > 3 ? 'bg-red-500' : 'bg-mncc-primary'}`} 
                                style={{ width: `${Math.min(100, (totalG / 6) * 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Fuel Gauge */}
                    <div className="col-span-1">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span className="flex items-center gap-1"><Zap size={10}/> FUEL</span>
                            <span className={`${fuelPercent < 20 ? 'text-red-500 animate-pulse' : 'text-mncc-text'}`}>{fuelPercent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-sm overflow-hidden border border-black/5">
                            <div 
                                className="h-full bg-mncc-text transition-all duration-200" 
                                style={{ width: `${fuelPercent}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    {/* Thrust Indicator */}
                    <div className="col-span-1">
                         <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>THRUST OUTPUT</span>
                            <span className="text-mncc-primary">{(data.thrust / 1000).toFixed(0)} kN</span>
                         </div>
                         <div className="flex gap-0.5 h-1">
                             {Array.from({length: 20}).map((_, i) => {
                                 const active = (data.thrust / 380000) * 20 > i;
                                 return (
                                     <div key={i} className={`flex-1 rounded-[1px] ${active ? 'bg-mncc-primary' : 'bg-gray-300'}`}></div>
                                 )
                             })}
                         </div>
                    </div>
                </div>

                {/* Metadata Footer */}
                <div className="hidden md:flex justify-between items-center text-[10px] text-gray-500 font-mono border-t border-dashed border-mncc-primary/20 pt-3">
                    <span>T+ {data.time.toFixed(1)}s</span>
                    <span>M: {(data.mass/1000).toFixed(1)}t</span>
                </div>
            </div>
        </div>
    );
};

const RocketPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const { telemetry, launch, reset } = useRocketSim();

  useEffect(() => {
     // Auto-launch for demo effect
     const timer = setTimeout(() => launch(), 800);
     return () => clearTimeout(timer);
  }, []);

  return (
    // Added pt-16 for global navbar compensation
    <div className="relative w-full h-screen bg-[#f3f1ea] overflow-hidden font-sans selection:bg-mncc-primary/30 pt-16">
      
      {/* Technical Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.05)]"></div>

      {/* Header - Fixed to top relative to content area */}
      <div className="absolute top-16 left-0 w-full z-20 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start pointer-events-none gap-4">
          <div className="pointer-events-auto flex items-center gap-4">
             <Link to="/demos" className="group flex items-center justify-center w-10 h-10 border border-black/10 bg-white hover:bg-gray-50 text-gray-500 hover:text-mncc-primary transition-colors shadow-sm">
                 <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform"/>
             </Link>
             <div>
                 <h1 className="text-lg font-bold text-mncc-text tracking-widest uppercase flex items-center gap-2">
                    <BoxSelect size={16} className="text-mncc-primary"/> Flight Dynamics
                 </h1>
                 <p className="text-[10px] text-mncc-muted font-mono tracking-[0.3em]">ENG_VIEWPORT_01</p>
             </div>
          </div>

          <div className="pointer-events-auto flex gap-3">
              <button 
                 onClick={launch}
                 className="flex items-center gap-2 px-6 py-2 bg-mncc-primary hover:bg-mncc-primary/90 text-white text-xs font-bold shadow-lg shadow-mncc-primary/20 transition-all"
              >
                  <Play size={12} fill="currentColor" /> INITIATE
              </button>
              <button 
                 onClick={reset}
                 className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-500 text-xs font-bold border border-black/10 transition-all shadow-sm"
              >
                  <RefreshCw size={12} /> RESET
              </button>
          </div>
      </div>

      {/* HUD - Mobile: Bottom docked, Desktop: Floating left */}
      <div className="absolute z-20 pointer-events-none w-full md:w-auto left-0 md:left-6 bottom-0 top-auto md:bottom-auto md:top-32 p-0 md:p-0 md:m-0">
         <div className="pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl">
             <BlueprintPanel data={telemetry} />
         </div>
      </div>

      {/* Main 3D Viewport */}
      <div className="w-full h-full relative z-0">
          {/* High Exposure for Blueprint feel */}
          <Canvas shadows camera={{ position: [20, 20, 20], fov: 45 }} gl={{ antialias: true, toneMappingExposure: 1.2 }}>
             <RocketScene telemetry={telemetry} />
          </Canvas>
      </div>

      {/* Footer Bar */}
      <div className="absolute bottom-0 w-full border-t border-black/5 bg-white/90 backdrop-blur text-[10px] font-mono text-gray-500 py-3 px-6 flex justify-between items-center pointer-events-none z-20 hidden md:flex">
           <div className="flex gap-4 md:gap-8">
               <span className="flex items-center gap-2 text-mncc-muted"><Ruler size={12}/> SCALE 1:100</span>
               <span className="hidden md:flex items-center gap-2 text-mncc-muted"><Activity size={12}/> PHYS_TICK 20HZ</span>
           </div>
           <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
               SYSTEM_NOMINAL
           </div>
      </div>
    </div>
  );
};

export default RocketPage;
