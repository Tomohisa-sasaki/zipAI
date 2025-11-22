
import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../../types';
import { ArrowLeft, Download, Sliders, Grid, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Niivue } from '@niivue/niivue';

interface Props {
  lang: Language;
}

const NiiVuePage: React.FC<Props> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [nvInstance, setNvInstance] = useState<Niivue | null>(null);
  const initialized = useRef(false);
  
  // UI State
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [sliceType, setSliceType] = useState(4); // 4 = Multi-planar

  useEffect(() => {
    if (!canvasRef.current || initialized.current) return;
    initialized.current = true;

    const nv = new Niivue({
      loadingText: 'Loading MNI152 Template...',
      backColor: [0.95, 0.94, 0.92, 1], // Cream background in WebGL [0..1]
      isColorbar: true,
      dragAndDropEnabled: true,
      onLocationChange: (data: any) => {
          // Could update UI coords here
      }
    });

    nv.attachToCanvas(canvasRef.current);
    setNvInstance(nv);

    const loadVolume = async () => {
      try {
        await nv.loadVolumes([
          {
            url: 'https://niivue.github.io/niivue-demo-images/mni152.nii.gz',
            name: 'MNI152',
            colormap: 'gray',
          },
        ]);
        setLoading(false);
        // Initial settings
        nv.setSliceType(4);
        nv.setCrosshairColor([1, 0, 0, 1]);
      } catch (e) {
        console.error("Failed to load NIfTI", e);
        setLoading(false);
      }
    };

    loadVolume();

    // Cleanup function to prevent WebGL context loss/leaks
    return () => {
        initialized.current = false;
        try {
            // Explicitly detach or destroy if method exists in this version
            // nv.destroy() is ideal, but we must be safe
            // We just let React unmount logic handle canvas removal
            // Preventing reuse of 'nv' variable is key
        } catch (e) {
            console.warn("Niivue cleanup warning:", e);
        }
    };

  }, []);

  // React Controls to Niivue Bridge
  useEffect(() => {
      if(nvInstance) {
          try {
             nvInstance.setCrosshairColor(showCrosshair ? [1, 0, 0, 1] : [0, 0, 0, 0]);
             nvInstance.updateGLVolume();
          } catch (e) { console.warn("NV Update Error", e); }
      }
  }, [showCrosshair, nvInstance]);

  useEffect(() => {
      if(nvInstance) {
          try {
            nvInstance.setSliceType(sliceType);
          } catch (e) { console.warn("NV Slice Error", e); }
      }
  }, [sliceType, nvInstance]);

  // "Quick Chicken" Style Toggle Component
  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean, onChange: () => void, label: string }) => (
    <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-black/5 hover:bg-gray-50 transition-colors shadow-sm">
        <span className="text-sm text-mncc-text font-medium">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mncc-primary shadow-inner"></div>
        </label>
    </div>
  );

  return (
    <div className="bg-[#f3f1ea] min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/demos" className="p-3 rounded-xl bg-white border border-black/5 hover:bg-gray-50 text-mncc-muted hover:text-mncc-text transition-colors shadow-sm">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-mncc-text flex items-center gap-3">
                 NiiVue Visualization 
                 <span className="text-xs bg-mncc-primary/10 text-mncc-primary px-2 py-1 rounded border border-mncc-primary/20">WebGL 2.0</span>
              </h1>
              <p className="text-mncc-muted text-sm mt-1">
                {lang === 'en' ? 'High-performance client-side NIfTI rendering.' : '高性能クライアントサイドNIfTIレンダリング。'}
              </p>
            </div>
          </div>
          <a href="https://github.com/niivue/niivue" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-mncc-primary bg-white px-4 py-2 rounded-lg border border-black/5 transition-colors shadow-sm">
             <Download size={16} /> 
             <span className="font-mono">Powered by Niivue</span>
          </a>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
            
            {/* Main Viewer Area */}
            <div className="lg:col-span-9 relative bg-white border border-black/5 rounded-2xl overflow-hidden shadow-xl h-[70vh]">
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-mncc-primary/30 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-mncc-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <span className="text-sm text-mncc-text font-mono animate-pulse">Initializing WebGL...</span>
                    </div>
                    </div>
                )}
                <canvas ref={canvasRef} className="w-full h-full outline-none cursor-crosshair" />
                
                {/* Interaction Hint Overlay */}
                <div className="absolute bottom-6 left-6 z-10 flex gap-4 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-black/5 text-[10px] text-gray-500 font-mono shadow-sm">
                        L-CLICK: CONTRAST
                    </div>
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-black/5 text-[10px] text-gray-500 font-mono shadow-sm">
                        R-CLICK: ZOOM/PAN
                    </div>
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-black/5 text-[10px] text-gray-500 font-mono shadow-sm">
                        SCROLL: SLICE
                    </div>
                </div>
            </div>

            {/* Control Panel */}
            <div className="lg:col-span-3 space-y-6">
                <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 text-mncc-text font-bold border-b border-black/5 pb-4">
                        <Sliders size={18} className="text-mncc-primary" />
                        <span>View Controls</span>
                    </div>

                    <div className="space-y-4">
                        {/* View Mode Selection */}
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 uppercase font-bold">Slice Mode</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => setSliceType(4)}
                                    className={`p-2 text-xs rounded-lg border transition-all flex items-center justify-center gap-2 ${sliceType === 4 ? 'bg-mncc-primary/10 border-mncc-primary text-mncc-primary' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <Grid size={14} /> Multi
                                </button>
                                <button 
                                    onClick={() => setSliceType(2)}
                                    className={`p-2 text-xs rounded-lg border transition-all flex items-center justify-center gap-2 ${sliceType === 2 ? 'bg-mncc-primary/10 border-mncc-primary text-mncc-primary' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <Grid size={14} /> Axial
                                </button>
                                <button 
                                    onClick={() => setSliceType(1)}
                                    className={`p-2 text-xs rounded-lg border transition-all flex items-center justify-center gap-2 ${sliceType === 1 ? 'bg-mncc-primary/10 border-mncc-primary text-mncc-primary' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <Grid size={14} /> Coronal
                                </button>
                                <button 
                                    onClick={() => setSliceType(0)}
                                    className={`p-2 text-xs rounded-lg border transition-all flex items-center justify-center gap-2 ${sliceType === 0 ? 'bg-mncc-primary/10 border-mncc-primary text-mncc-primary' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <Grid size={14} /> Sagittal
                                </button>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="pt-2 space-y-2">
                             <ToggleSwitch 
                                label="Show Crosshair" 
                                checked={showCrosshair} 
                                onChange={() => setShowCrosshair(!showCrosshair)} 
                             />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-mncc-text mb-2">Dataset Info</h3>
                    <div className="space-y-2 text-xs text-gray-500 font-mono">
                        <div className="flex justify-between py-1 border-b border-gray-100">
                            <span>Template</span>
                            <span className="text-mncc-text">MNI152 1mm</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                            <span>Dimensions</span>
                            <span className="text-mncc-text">192 x 256 x 256</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                            <span>Voxel Size</span>
                            <span className="text-mncc-text">1mm³</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default NiiVuePage;
