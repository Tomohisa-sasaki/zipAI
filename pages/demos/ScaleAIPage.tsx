
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, X, AlertCircle, Tag, Crosshair, Database } from 'lucide-react';
import { Language } from '../../types';

interface Props {
  lang: Language;
}

const ScaleAIPage: React.FC<Props> = ({ lang }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isAutoLabeling, setIsAutoLabeling] = useState(false);
  const [annotations, setAnnotations] = useState<number[]>([]);

  // Mock image stream
  const TOTAL_IMAGES = 50;
  
  const startAuto = () => {
      setIsAutoLabeling(true);
  };

  useEffect(() => {
      if (isAutoLabeling && currentImage < TOTAL_IMAGES) {
          const timer = setTimeout(() => {
              setAnnotations(prev => [...prev, Math.random() > 0.1 ? 1 : 0]); // 90% accuracy mock
              setCurrentImage(prev => prev + 1);
          }, 200); // Fast labeling speed
          return () => clearTimeout(timer);
      } else if (currentImage >= TOTAL_IMAGES) {
          setIsAutoLabeling(false);
      }
  }, [isAutoLabeling, currentImage]);

  return (
    <div className="bg-[#f3f1ea] min-h-screen flex flex-col font-sans h-screen overflow-hidden">
       {/* Header */}
       <div className="h-14 border-b border-black/5 bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
             <Link to="/demos" className="text-mncc-muted hover:text-mncc-text p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={18} />
             </Link>
             <div>
                <h1 className="text-mncc-text font-bold flex items-center gap-2 text-sm">
                   <Tag size={16} className="text-mncc-primary"/>
                   SCALE_AI_DEMO
                   <span className="text-[10px] bg-mncc-primary/10 text-mncc-primary px-2 py-0.5 rounded">RLHF_ENABLED</span>
                </h1>
             </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono">
             <div className="flex items-center gap-2 text-gray-500">
                 <Database size={14} />
                 {currentImage} / {TOTAL_IMAGES}
             </div>
          </div>
       </div>

       <div className="flex-1 flex overflow-hidden">
           {/* Main Labeling Area */}
           <div className="flex-1 bg-[#f0f0f0] p-8 flex items-center justify-center relative">
               {currentImage < TOTAL_IMAGES ? (
                   <div className="bg-white p-2 rounded-lg shadow-lg border border-black/5 relative max-w-2xl w-full aspect-video flex items-center justify-center overflow-hidden">
                       {/* Mock Image Content */}
                       <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                           <div className="text-4xl font-bold text-gray-200 select-none">SAMPLE_DATA_{currentImage}</div>
                           {/* Mock Bounding Box */}
                           {isAutoLabeling && (
                               <div className="absolute border-2 border-mncc-primary bg-mncc-primary/10" 
                                    style={{ 
                                        top: `${20 + Math.random()*40}%`, 
                                        left: `${20 + Math.random()*40}%`, 
                                        width: '150px', 
                                        height: '100px' 
                                    }}>
                                    <div className="absolute -top-6 left-0 bg-mncc-primary text-white text-[10px] px-2 py-1 rounded-t font-bold flex items-center gap-1">
                                        CAR {(0.95 + Math.random()*0.04).toFixed(2)}
                                    </div>
                               </div>
                           )}
                       </div>
                   </div>
               ) : (
                   <div className="text-center">
                       <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Check size={32} />
                       </div>
                       <h2 className="text-2xl font-bold text-mncc-text mb-2">Batch Complete</h2>
                       <button onClick={() => { setCurrentImage(0); setAnnotations([]); }} className="text-mncc-primary hover:underline text-sm font-bold">
                           Reset Demo
                       </button>
                   </div>
               )}
           </div>

           {/* Sidebar */}
           <div className="w-80 bg-white border-l border-black/5 p-6 flex flex-col">
               <div className="mb-8">
                   <h3 className="text-xs font-bold text-mncc-muted uppercase mb-4 tracking-wider">Pipeline Controls</h3>
                   
                   <button 
                      onClick={startAuto}
                      disabled={isAutoLabeling || currentImage >= TOTAL_IMAGES}
                      className="w-full py-3 bg-mncc-primary hover:bg-mncc-primary/90 text-white rounded-lg font-bold text-sm shadow-lg shadow-mncc-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                   >
                       {isAutoLabeling ? 'Processing...' : 'Start Auto-Labeling'}
                   </button>
               </div>

               <div className="flex-1 overflow-y-auto">
                   <h3 className="text-xs font-bold text-mncc-muted uppercase mb-4 tracking-wider">Annotation Log</h3>
                   <div className="space-y-2">
                       {annotations.slice().reverse().map((res, i) => (
                           <div key={i} className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-100 text-xs">
                               <span className="font-mono text-gray-500">ID_{annotations.length - 1 - i}</span>
                               {res === 1 ? (
                                   <span className="text-green-600 flex items-center gap-1 font-bold"><Check size={10}/> VERIFIED</span>
                               ) : (
                                   <span className="text-amber-600 flex items-center gap-1 font-bold"><AlertCircle size={10}/> REVIEW</span>
                               )}
                           </div>
                       ))}
                   </div>
               </div>
               
               <div className="pt-6 border-t border-black/5">
                   <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                       <Crosshair size={16} className="text-blue-500 mt-0.5 shrink-0" />
                       <div>
                           <div className="text-xs font-bold text-blue-700 mb-1">RLHF Integration</div>
                           <p className="text-[10px] text-blue-600 leading-relaxed">
                               This demo simulates the high-throughput labeling queue used to fine-tune multimodal models with human feedback.
                           </p>
                       </div>
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
};

export default ScaleAIPage;
