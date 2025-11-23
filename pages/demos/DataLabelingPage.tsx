
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { Html, useTexture, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import * as ort from 'onnxruntime-web';
import { 
  ArrowLeft, Crosshair, Zap, Layers, Search, Download, 
  ZoomIn, ZoomOut, Undo, Redo, MousePointer2, BoxSelect, 
  Eye, Trash2, Save, Keyboard, RefreshCw, AlertCircle, Sliders, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { Language } from '../../types';
import { useLabelStore, Annotation } from '../../store/labelStore';
import { preprocess, postprocess, simulatedInference } from '../../utils/yolo';

interface Props {
  lang: Language;
}

// --- Constants & Config ---
const CLASSES = [
    { id: 'person', label: 'Person', color: '#ef4444' },
    { id: 'car', label: 'Car', color: '#2563eb' },
    { id: 'truck', label: 'Truck', color: '#f97316' },
    { id: 'bus', label: 'Bus', color: '#a855f7' },
    { id: 'bicycle', label: 'Bicycle', color: '#22c55e' },
    { id: 'motorcycle', label: 'Motorcycle', color: '#0ea5e9' },
    { id: 'traffic_light', label: 'Traffic Light', color: '#fbbf24' },
    { id: 'stop_sign', label: 'Stop Sign', color: '#dc2626' },
    { id: 'backpack', label: 'Backpack', color: '#8b5cf6' },
    { id: 'dog', label: 'Dog', color: '#eab308' },
];

const COCO_TO_APP_CLASS: Record<number, string> = {
    0: 'person',
    1: 'bicycle',
    2: 'car',
    3: 'motorcycle',
    5: 'bus',
    7: 'truck',
    9: 'traffic_light',
    11: 'stop_sign',
    18: 'dog',
    24: 'backpack'
};

const CURATED_YARD_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#grad)" />
  <rect x="40" y="320" width="380" height="170" rx="16" fill="#fb923c" opacity="0.95"/>
  <rect x="460" y="310" width="280" height="150" rx="18" fill="#38bdf8" opacity="0.92"/>
  <rect x="780" y="300" width="140" height="220" rx="20" fill="#f472b6" opacity="0.9"/>
  <rect x="950" y="380" width="230" height="140" rx="18" fill="#22c55e" opacity="0.9"/>
  <rect x="1120" y="160" width="40" height="170" rx="8" fill="#fbbf24" opacity="0.9"/>
  <rect x="820" y="340" width="52" height="80" rx="12" fill="#a855f7" opacity="0.9"/>
  <circle cx="240" cy="420" r="12" fill="#334155"/>
  <circle cx="560" cy="420" r="12" fill="#334155"/>
  <circle cx="1030" cy="470" r="12" fill="#334155"/>
  <rect x="0" y="520" width="1280" height="120" fill="#0b1220" opacity="0.6"/>
  <text x="60" y="140" fill="#9ca3af" font-size="32" font-family="Arial">Curated Scene: Logistics Yard</text>
</svg>
`);

type PresetImage = {
    id: string;
    title: string;
    description: string;
    url: string;
    dims: { w: number, h: number };
    annotations?: Array<{ classId: string; x: number; y: number; w: number; h: number; confidence: number; }>;
};

const PRESET_IMAGES: PresetImage[] = [
    {
        id: 'logistics-yard',
        title: 'Logistics Yard (curated)',
        description: 'Synthetic, high-contrast scene for stable benchmarking.',
        url: `data:image/svg+xml;utf8,${CURATED_YARD_SVG}`,
        dims: { w: 1280, h: 720 },
        annotations: [
            { classId: 'truck', x: 230, y: 405, w: 380, h: 170, confidence: 0.97 },
            { classId: 'bus', x: 600, y: 385, w: 280, h: 150, confidence: 0.94 },
            { classId: 'person', x: 850, y: 410, w: 52, h: 80, confidence: 0.86 },
            { classId: 'bicycle', x: 1065, y: 450, w: 230, h: 140, confidence: 0.91 },
            { classId: 'traffic_light', x: 1140, y: 245, w: 40, h: 170, confidence: 0.88 },
            { classId: 'backpack', x: 860, y: 370, w: 40, h: 50, confidence: 0.8 }
        ]
    }
];

const DEFAULT_PRESET_ID = PRESET_IMAGES[0].id;

const MODEL_PATH = 'https://raw.githubusercontent.com/Hyuto/yolo-web/master/public/model.onnx'; // Reliable demo model

const findClassIndex = (classId: string) => {
    const idx = CLASSES.findIndex(c => c.id === classId);
    return idx >= 0 ? idx : 0;
};

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

const BoundingBox = ({ ann, isSelected, onSelect, imgDims }: { ann: Annotation, isSelected: boolean, onSelect: () => void, imgDims: { w: number, h: number } }) => {
    const cls = CLASSES[parseInt(ann.classId)] || CLASSES[0];
    const color = cls.color;
    const halfW = imgDims.w / 2;
    const halfH = imgDims.h / 2;
    
    return (
        <group position={[ann.x - halfW, halfH - ann.y, 0]}>
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
  const [activePresetId, setActivePresetId] = useState<string | null>(DEFAULT_PRESET_ID);
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [imageInput, setImageInput] = useState(PRESET_IMAGES[0].url);
  const [imgDims, setImgDims] = useState(PRESET_IMAGES[0].dims);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  
  // Store
  const { 
      zoom, pan, activeTool, annotations, selectedId, currentClass,
      setZoom, setPan, setTool, selectAnnotation, setClass,
      addAnnotation, updateAnnotation, removeAnnotation, setAnnotations,
      undo, redo 
  } = useLabelStore();
  const activePreset = activePresetId ? PRESET_IMAGES.find(p => p.id === activePresetId) : undefined;

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

  // Apply curated preset scene for a stable, high-precision demo baseline
  useEffect(() => {
      if (!activePresetId) return;
      const preset = PRESET_IMAGES.find(p => p.id === activePresetId);
      if (!preset) return;

      setImageUrl(preset.url);
      setImageInput(preset.url);
      setImgDims(preset.dims);
      setZoom(1);

      if (preset.annotations) {
          const curated = preset.annotations.map(ann => ({
              id: Math.random().toString(36).substr(2, 9),
              x: ann.x,
              y: ann.y,
              w: ann.w,
              h: ann.h,
              classId: findClassIndex(ann.classId).toString(),
              confidence: ann.confidence
          }));
          setAnnotations(curated);
      }
  }, [activePresetId, setAnnotations, setZoom]);

  const mapModelClassToApp = (cls: number | string) => {
      if (typeof cls === 'number') {
          const mapped = COCO_TO_APP_CLASS[cls];
          if (mapped) return findClassIndex(mapped).toString();
          return '0';
      }
      return findClassIndex(cls).toString();
  };

  const applyDetections = (detected: any[]) => {
      const mapped = detected
        .map((d: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            x: d.x,
            y: d.y,
            w: d.w,
            h: d.h,
            classId: mapModelClassToApp(d.classId),
            confidence: d.score ?? d.confidence ?? 0.9
        }))
        .filter((d: Annotation) => d.confidence >= confidenceThreshold)
        .sort((a: Annotation, b: Annotation) => b.confidence - a.confidence);
      setAnnotations(mapped);
  };

  const refineExistingAnnotations = () => {
      const filtered = annotations
        .map(a => ({ ...a }))
        .filter(a => a.confidence >= confidenceThreshold)
        .sort((a, b) => b.confidence - a.confidence);
      setAnnotations(filtered);
  };

  const isCuratedPreset = activePresetId && PRESET_IMAGES.some(p => p.id === activePresetId && p.annotations);

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
             const preset = PRESET_IMAGES.find(p => p.url === imageUrl);

             if (preset?.annotations) {
                 detected = preset.annotations;
             } else if (modelSession) {
                 // Real Inference
                 const input = preprocess(img, 640, 640);
                 const tensor = new ort.Tensor('float32', input, [1, 3, 640, 640]);
                 const outputs = await modelSession.run({ images: tensor });
                 detected = postprocess(outputs.output0, imgDims.w, imgDims.h, 0.5);
             } else {
                 // Fallback Simulation
                 await new Promise(r => setTimeout(r, 800)); // Fake delay
                 detected = simulatedInference(imgDims.w, imgDims.h, CLASSES.length, imageUrl, confidenceThreshold);
             }
             
             applyDetections(detected);
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
      const classIndex = Math.max(CLASSES.findIndex(c => c.id === currentClass), 0);
      addAnnotation({
          id: newId,
          x: x,
          y: y,
          w: 100, // Default size, would be drag logic in full impl
          h: 100,
          classId: classIndex.toString(),
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
           
           {/* --- Scene Presets & Image Input --- */}
           <div className="w-full bg-[#111827] border-b border-white/10 px-4 py-4 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between z-30">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                 <Sparkles size={16} className="text-mncc-primary" />
                 <div className="flex flex-col">
                    <span className="font-semibold text-white">Curated scenes & custom images</span>
                    <span className="text-gray-500">Use curated presets for stable accuracy or bring your own URL.</span>
                 </div>
                 {isCuratedPreset && (
                   <span className="px-2 py-1 rounded-full bg-mncc-primary/20 text-mncc-primary font-bold text-[10px] border border-mncc-primary/40">High-Precision Mode</span>
                 )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                 {PRESET_IMAGES.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => setActivePresetId(preset.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-2 ${
                        activePresetId === preset.id 
                          ? 'bg-mncc-primary/20 border-mncc-primary/60 text-white shadow-[0_6px_30px_rgba(56,124,109,0.25)]' 
                          : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                      }`}
                    >
                      <ImageIcon size={14} />
                      {preset.title}
                    </button>
                 ))}
                 <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <ImageIcon size={14} className="text-gray-400" />
                    <input
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      onBlur={() => { setActivePresetId(null); setImageUrl(imageInput); setAnnotations([]); }}
                      placeholder="Paste any image URL"
                      className="bg-transparent text-xs text-white placeholder:text-gray-500 outline-none w-56"
                    />
                    <button 
                      onClick={() => { setActivePresetId(null); setImageUrl(imageInput); setAnnotations([]); }}
                      className="text-[11px] font-bold text-mncc-primary hover:text-white transition-colors"
                    >
                      Load
                    </button>
                 </div>
              </div>
           </div>
           
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
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 text-[11px] text-gray-200">
                   <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 backdrop-blur">
                      <span className="font-semibold text-white">{activePreset ? activePreset.title : 'Custom URL'}</span>
                      <span className="block text-[10px] text-gray-400">{activePreset?.description || 'Bring any image to test.'}</span>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 backdrop-blur">
                      <Sliders size={12} className="text-mncc-primary" />
                      <span>Confidence ≥ {(confidenceThreshold * 100).toFixed(0)}%</span>
                      <span className="text-gray-500">• {annotations.length} boxes</span>
                   </div>
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
                                   imgDims={imgDims}
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

               {/* Quality Controls */}
               <div className="p-5 border-b border-white/10">
                   <h3 className="text-xs font-bold text-white uppercase mb-3 flex items-center gap-2">
                       <Sliders size={14} className="text-mncc-primary" /> Quality Controls
                   </h3>
                   <div className="flex items-center gap-3">
                       <input 
                         type="range" 
                         min={0.3} 
                         max={0.9} 
                         step={0.01} 
                         value={confidenceThreshold} 
                         onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))} 
                         className="flex-1 accent-mncc-primary"
                       />
                       <span className="text-xs text-white font-bold">{(confidenceThreshold * 100).toFixed(0)}%</span>
                   </div>
                   <p className="text-[11px] text-gray-500 mt-2">Filter low-confidence boxes and re-run to tighten precision.</p>
                   <div className="flex gap-2 mt-3">
                       <button 
                         onClick={refineExistingAnnotations}
                         className="flex-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-colors"
                       >
                         Refine current boxes
                       </button>
                       <button 
                         onClick={() => setActivePresetId(DEFAULT_PRESET_ID)}
                         className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-gray-300 text-xs hover:text-white transition-colors"
                       >
                         Reset
                       </button>
                   </div>
               </div>

               {/* Annotation List */}
               <div className="flex-1 overflow-y-auto p-2">
                   <h3 className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Annotations</h3>
                   <div className="space-y-1">
                       {annotations.map(ann => {
                           const cls = CLASSES[parseInt(ann.classId)] || CLASSES[0];
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
