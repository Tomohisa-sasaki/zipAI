
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { Html, useTexture, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import * as ort from 'onnxruntime-web';
import { 
  ArrowLeft, Crosshair, Zap, Layers, Search, Download, 
  ZoomIn, ZoomOut, Undo, Redo, MousePointer2, BoxSelect, 
  Eye, Trash2, Save, Keyboard, RefreshCw, AlertCircle
} from 'lucide-react';
import { Language } from '../../types';
import { useLabelStore, Annotation } from '../../store/labelStore';
import { preprocess, postprocess, simulatedInference } from '../../utils/yolo';

interface Props {
  lang: Language;
}

// --- Constants & Config ---
const CLASSES = [
    { id: 'car', label: 'Car', color: '#3b82f6' },
    { id: 'person', label: 'Person', color: '#ef4444' },
    { id: 'truck', label: 'Truck', color: '#f59e0b' },
    { id: 'bicycle', label: 'Bicycle', color: '#10b981' }
];

const MODEL_PATH = 'https://raw.githubusercontent.com/Hyuto/yolo-web/master/public/model.onnx'; // Reliable demo model

// --- 3D Components ---

const BackgroundImage = ({ url, onLoad }: { url: string, onLoad: (w: number, h: number) => void }) => {
  const texture = useTexture(url) as THREE.Texture;
  const { viewport } = useThree();
  
  useEffect(() => {
      if (texture && texture.image) {
          const img = texture.image as HTMLImageElement;
          onLoad(img.width, img.height);
      }
  }, [texture, onLoad]);

  if (!texture || !texture.image) return null;

  const img = texture.image as HTMLImageElement;
  
  // Fit image to viewport width initially
  const aspect = img.width / img.height;
  
  return (
    <mesh position={[0, 0, -1]}>
       <planeGeometry args={[img.width, img.height]} />
       <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};

const BoundingBox = ({ ann, isSelected, onSelect }: { ann: Annotation, isSelected: boolean, onSelect: () => void }) => {
    const cls = CLASSES[parseInt(ann.classId)] || CLASSES[0];
    const color = cls.color;
    
    return (
        <group position={[ann.x - (1280/2), (720/2) - ann.y, 0]}> {/* Center offset logic assuming 1280x720 space for simple mapping */}
            {/* The Box Line */}
            <mesh position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
                <ringGeometry args={[0, 100, 4]} /> 
                {/* We use a helper for visual box */}
                <lineSegments>
                    <edgesGeometry args={[new THREE.BoxGeometry(ann.w, ann.h, 1)]} />
                    <lineBasicMaterial color={isSelected ? '#ffffff' : color} linewidth={2} />
                </lineSegments>
            </mesh>
            
            {/* Fill for selection hit area */}
            <mesh onClick={(e) => { e.stopPropagation(); onSelect(); }}>
                 <planeGeometry args={[ann.w, ann.h]} />
                 <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.2 : 0.05} />
            </mesh>

            {/* Resize Handles (Visual Only for Demo) */}
            {isSelected && (
                <>
                    <mesh position={[ann.w/2, ann.h/2, 1]}>
                        <boxGeometry args={[6, 6, 1]} />
                        <meshBasicMaterial color="white" />
                    </mesh>
                    <mesh position={[-ann.w/2, -ann.h/2, 1]}>
                        <boxGeometry args={[6, 6, 1]} />
                        <meshBasicMaterial color="white" />
                    </mesh>
                </>
            )}

            {/* HTML Label */}
            <Html position={[-ann.w/2, ann.h/2, 0]} style={{ pointerEvents: 'none' }}>
                <div 
                    className="px-1 py-0.5 text-[10px] font-bold text-white rounded-t-sm whitespace-nowrap flex items-center gap-1 transform -translate-y-full"
                    style={{ backgroundColor: color }}
                >
                    {cls.label} <span className="opacity-75">{(ann.confidence * 100).toFixed(0)}%</span>
                </div>
            </Html>
        </group>
    );
};

const InteractionPlane = ({ width, height, onDraw }: { width: number, height: number, onDraw: (x: number, y: number) => void }) => {
    return (
        <mesh 
            position={[0, 0, 1]} 
            visible={false} 
            onPointerDown={(e) => onDraw(e.point.x, e.point.y)}
        >
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial color="red" wireframe />
        </mesh>
    )
}

// --- Main Page Component ---

const DataLabelingPage: React.FC<Props> = ({ lang }) => {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelSession, setModelSession] = useState<ort.InferenceSession | null>(null);
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1566008885218-90abf9200ddb?q=80&w=1280&auto=format&fit=crop");
  const [imgDims, setImgDims] = useState({ w: 1280, h: 720 });
  
  // Store
  const { 
      zoom, pan, activeTool, annotations, selectedId, currentClass,
      setZoom, setPan, setTool, selectAnnotation, setClass,
      addAnnotation, updateAnnotation, removeAnnotation, setAnnotations,
      undo, redo 
  } = useLabelStore();

  // Initialize ONNX Model
  useEffect(() => {
      const initModel = async () => {
          setIsModelLoading(true);
          try {
             // Attempt to load model (might fail in some environments due to CORS or memory)
             const session = await ort.InferenceSession.create(MODEL_PATH, { executionProviders: ['wasm'] });
             setModelSession(session);
          } catch (e) {
             console.warn("Model load failed, falling back to simulation mode.", e);
          } finally {
             setIsModelLoading(false);
          }
      };
      initModel();
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
          if (e.key === 'v') setTool('select');
          if (e.key === 'r') setTool('rect');
          if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              undo();
          }
          if (e.key === 'y' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              redo();
          }
          if (e.key === 'Backspace' || e.key === 'Delete') {
              if (selectedId) removeAnnotation(selectedId);
          }
          if (e.key === '+') setZoom(zoom + 0.1);
          if (e.key === '-') setZoom(zoom - 0.1);
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
  }, [selectedId, zoom]);

  // Inference Handler
  const handleInference = async () => {
      if (!imageUrl) return;
      setIsModelLoading(true);
      
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;
      
      img.onload = async () => {
          try {
             let detected = [];
             if (modelSession) {
                 // Real Inference
                 const input = preprocess(img, 640, 640);
                 const tensor = new ort.Tensor('float32', input, [1, 3, 640, 640]);
                 const outputs = await modelSession.run({ images: tensor });
                 detected = postprocess(outputs.output0, imgDims.w, imgDims.h, 0.5);
             } else {
                 // Fallback Simulation
                 await new Promise(r => setTimeout(r, 800)); // Fake delay
                 detected = simulatedInference(imgDims.w, imgDims.h);
             }

             // Convert to Annotation Format
             const newAnns = detected.map((d: any) => ({
                 id: Math.random().toString(36).substr(2, 9),
                 x: d.x, y: d.y, w: d.w, h: d.h,
                 classId: d.classId !== undefined ? d.classId.toString() : Math.floor(Math.random()*4).toString(),
                 confidence: d.score || 0.9
             }));
             
             setAnnotations(newAnns);
          } catch (e) {
             console.error("Inference error", e);
          } finally {
             setIsModelLoading(false);
          }
      }
  };

  // Canvas Interactions
  const handleDraw = (x: number, y: number) => {
      if (activeTool !== 'rect') return;
      
      const newId = Math.random().toString(36).substr(2,9);
      addAnnotation({
          id: newId,
          x: x,
          y: y,
          w: 100, // Default size, would be drag logic in full impl
          h: 100,
          classId: CLASSES.findIndex(c => c.id === currentClass).toString(),
          confidence: 1.0
      });
      selectAnnotation(newId);
      setTool('select'); // Auto switch back
  };

  const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(annotations, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "annotations.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  return (
    // Adjusted container to ensure global navigation is not blocked
    <div className="bg-[#0f172a] h-screen flex flex-col font-sans overflow-hidden text-gray-300 relative pt-16">
       
       {/* --- Header --- */}
       <div className="h-14 border-b border-white/10 bg-[#1e293b] flex items-center justify-between px-4 shrink-0 z-40 relative shadow-md">
          <div className="flex items-center gap-4">
             <Link to="/demos" className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors relative z-50">
                <ArrowLeft size={18} />
             </Link>
             <div>
                <h1 className="text-white font-bold flex items-center gap-2 text-sm tracking-wide">
                   <Crosshair size={16} className="text-mncc-primary"/>
                   DATA_STUDIO <span className="hidden sm:inline text-xs text-gray-500 font-mono">| WASM_INFERENCE</span>
                </h1>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-xs font-mono px-3 py-1 bg-black/20 rounded border border-white/5">
                   <div className={`w-2 h-2 rounded-full ${modelSession ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                   {modelSession ? 'ONNX_RUNTIME_READY' : 'SIMULATION_MODE'}
              </div>
              <button onClick={handleExport} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">
                  <Download size={14} /> <span className="hidden sm:inline">Export</span>
              </button>
          </div>
       </div>

       <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-0">
           
           {/* --- Toolbar (Left on Desktop, Bottom on Mobile) --- */}
           <div className="w-full md:w-14 h-14 md:h-full order-last md:order-first bg-[#1e293b] border-t md:border-t-0 md:border-r border-white/10 flex flex-row md:flex-col items-center justify-center md:justify-start py-0 md:py-4 gap-4 shrink-0 z-20 overflow-x-auto">
               <button 
                 onClick={() => setTool('select')}
                 className={`p-2 rounded-lg transition-all ${activeTool === 'select' ? 'bg-mncc-primary text-white shadow-glow' : 'text-gray-400 hover:bg-white/10'}`}
                 title="Select (V)"
               >
                   <MousePointer2 size={20} />
               </button>
               <button 
                 onClick={() => setTool('rect')}
                 className={`p-2 rounded-lg transition-all ${activeTool === 'rect' ? 'bg-mncc-primary text-white shadow-glow' : 'text-gray-400 hover:bg-white/10'}`}
                 title="Draw Rectangle (R)"
               >
                   <BoxSelect size={20} />
               </button>
               
               <div className="w-px h-8 md:w-8 md:h-px bg-white/10 my-1"></div>

               <button onClick={undo} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg" title="Undo (Ctrl+Z)">
                   <Undo size={18} />
               </button>
               <button onClick={redo} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg" title="Redo (Ctrl+Y)">
                   <Redo size={18} />
               </button>

               <div className="w-px h-8 md:w-8 md:h-px bg-white/10 my-1"></div>

               <button onClick={() => setZoom(zoom + 0.2)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
                   <ZoomIn size={18} />
               </button>
               <button onClick={() => setZoom(1)} className="text-[10px] font-mono text-gray-500 hover:text-white">
                   {(zoom * 100).toFixed(0)}%
               </button>
               <button onClick={() => setZoom(zoom - 0.2)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
                   <ZoomOut size={18} />
               </button>
           </div>

           {/* --- Main Canvas --- */}
           <div className="flex-1 relative bg-[#0f172a] overflow-hidden flex flex-col">
               {/* Toolbar Overlay */}
               <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 pointer-events-auto">
                   <button 
                     onClick={handleInference}
                     disabled={isModelLoading}
                     className="flex items-center gap-2 px-6 py-2 bg-mncc-primary hover:bg-emerald-600 text-white rounded-full shadow-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-wait"
                   >
                       {isModelLoading ? <RefreshCw size={14} className="animate-spin"/> : <Zap size={14} />}
                       {isModelLoading ? 'Processing...' : 'Run Auto-Detect'}
                   </button>
               </div>

               <div className="flex-1 cursor-crosshair relative z-0">
                   <Canvas>
                       <OrthographicCamera 
                          makeDefault 
                          position={[0, 0, 10]} 
                          zoom={zoom} 
                          left={-window.innerWidth / 2} 
                          right={window.innerWidth / 2} 
                          top={window.innerHeight / 2} 
                          bottom={-window.innerHeight / 2}
                       />
                       
                       {/* Lighting (Basic) */}
                       <ambientLight intensity={1} />

                       <group scale={[1, -1, 1]}> {/* Flip Y for Texture coord match */}
                           <BackgroundImage url={imageUrl} onLoad={(w, h) => setImgDims({ w, h })} />
                           
                           {/* Annotations */}
                           {annotations.map(ann => (
                               <BoundingBox 
                                   key={ann.id} 
                                   ann={ann} 
                                   isSelected={selectedId === ann.id}
                                   onSelect={() => selectAnnotation(ann.id)}
                               />
                           ))}

                           {/* Interaction Layer */}
                           {activeTool === 'rect' && (
                               <InteractionPlane width={imgDims.w} height={imgDims.h} onDraw={handleDraw} />
                           )}
                       </group>
                   </Canvas>
               </div>
               
               {/* Helper Footer - Hidden on mobile to save space */}
               <div className="hidden md:flex h-8 bg-[#1e293b] border-t border-white/10 items-center px-4 text-[10px] font-mono text-gray-500 justify-between select-none">
                   <div className="flex gap-4">
                       <span><Keyboard size={10} className="inline mr-1"/> V:Select R:Rect Backspace:Delete</span>
                       <span>ZOOM: {zoom.toFixed(1)}x</span>
                   </div>
                   <div>
                       OBJECTS: {annotations.length}
                   </div>
               </div>
           </div>

           {/* --- Right Sidebar (Hidden on mobile) --- */}
           <div className="hidden md:flex w-72 bg-[#1e293b] border-l border-white/10 flex-col z-20 shadow-xl">
               
               {/* Class Selector */}
               <div className="p-5 border-b border-white/10">
                   <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2">
                       <Layers size={14} className="text-mncc-primary" /> Ontology
                   </h3>
                   <div className="grid grid-cols-2 gap-2">
                       {CLASSES.map(cls => (
                           <button
                               key={cls.id}
                               onClick={() => setClass(cls.id)}
                               className={`flex items-center gap-2 p-2 rounded border transition-all text-xs font-medium ${
                                   currentClass === cls.id 
                                   ? 'bg-white/10 border-mncc-primary text-white' 
                                   : 'border-white/5 text-gray-400 hover:bg-white/5'
                               }`}
                           >
                               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cls.color }}></div>
                               {cls.label}
                           </button>
                       ))}
                   </div>
               </div>

               {/* Annotation List */}
               <div className="flex-1 overflow-y-auto p-2">
                   <h3 className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Annotations</h3>
                   <div className="space-y-1">
                       {annotations.map(ann => {
                           const cls = CLASSES.find(c => c.id === ann.classId) || CLASSES[0];
                           return (
                               <div 
                                   key={ann.id}
                                   onClick={() => selectAnnotation(ann.id)}
                                   className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                                       selectedId === ann.id ? 'bg-mncc-primary/20 border border-mncc-primary/50' : 'hover:bg-white/5 border border-transparent'
                                   }`}
                               >
                                   <div className="flex items-center gap-3">
                                       <Eye size={14} className={`text-gray-500 ${selectedId === ann.id ? 'text-mncc-primary' : ''}`} />
                                       <div className="flex flex-col">
                                           <span className="text-xs font-bold text-gray-300">{cls.label}</span>
                                           <span className="text-[10px] font-mono text-gray-600">CONF: {(ann.confidence*100).toFixed(0)}%</span>
                                       </div>
                                   </div>
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); removeAnnotation(ann.id); }}
                                     className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1"
                                   >
                                       <Trash2 size={14} />
                                   </button>
                               </div>
                           )
                       })}
                       {annotations.length === 0 && (
                           <div className="text-center py-10 text-gray-600 text-xs">
                               No annotations yet.<br/>Draw manually or run auto-detect.
                           </div>
                       )}
                   </div>
               </div>

               <div className="p-4 border-t border-white/10 bg-black/20">
                   <div className="flex items-center gap-3 text-xs text-gray-400">
                       <AlertCircle size={14} />
                       <span>Unsaved changes stored locally.</span>
                   </div>
               </div>

           </div>

       </div>
    </div>
  );
};

export default DataLabelingPage;
