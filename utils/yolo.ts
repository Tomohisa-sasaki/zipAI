
import * as ort from 'onnxruntime-web';

// Helper: Preprocess Image for YOLOv8 (640x640, Normalize 0-1)
export const preprocess = (image: HTMLImageElement, modelWidth: number, modelHeight: number): Float32Array => {
  const canvas = document.createElement('canvas');
  canvas.width = modelWidth;
  canvas.height = modelHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.drawImage(image, 0, 0, modelWidth, modelHeight);
  const imgData = ctx.getImageData(0, 0, modelWidth, modelHeight);
  const { data } = imgData;

  // Float32Array for Red, Green, Blue channels
  const float32Data = new Float32Array(3 * modelWidth * modelHeight);

  for (let i = 0; i < data.length / 4; i++) {
    // Normalize 0-255 -> 0.0-1.0
    float32Data[i] = data[i * 4] / 255.0; // R
    float32Data[i + modelWidth * modelHeight] = data[i * 4 + 1] / 255.0; // G
    float32Data[i + 2 * modelWidth * modelHeight] = data[i * 4 + 2] / 255.0; // B
  }

  return float32Data;
};

// Helper: Intersection over Union
const iou = (box1: number[], box2: number[]) => {
    const [x1, y1, w1, h1] = box1;
    const [x2, y2, w2, h2] = box2;
    
    const xi1 = Math.max(x1 - w1/2, x2 - w2/2);
    const yi1 = Math.max(y1 - h1/2, y2 - h2/2);
    const xi2 = Math.min(x1 + w1/2, x2 + w2/2);
    const yi2 = Math.min(y1 + h1/2, y2 + h2/2);
    
    const interArea = Math.max(0, xi2 - xi1) * Math.max(0, yi2 - yi1);
    const box1Area = w1 * h1;
    const box2Area = w2 * h2;
    
    return interArea / (box1Area + box2Area - interArea);
};

// Helper: Postprocess Tensor Output
export const postprocess = (
  results: ort.Tensor, 
  imgWidth: number, 
  imgHeight: number, 
  confThreshold: number
): any[] => {
  // YOLOv8 Output: [1, 84, 8400] (Batch, 4 Box + 80 Classes, Anchors)
  const [batch, channels, anchors] = results.dims; // 1, 84, 8400
  const data = results.data as Float32Array; // Flat array
  
  const boxes = [];

  // Transpose logic simplified: Loop through anchors
  for (let i = 0; i < anchors; i++) {
    // Find max class score
    let maxScore = 0;
    let classId = -1;
    
    // Classes start at index 4 (after x, y, w, h)
    for (let c = 4; c < channels; c++) {
       // Access [0, c, i] in flattened array
       // offset = c * anchors + i
       const score = data[c * anchors + i];
       if (score > maxScore) {
         maxScore = score;
         classId = c - 4;
       }
    }

    if (maxScore > confThreshold) {
       const x = data[0 * anchors + i];
       const y = data[1 * anchors + i];
       const w = data[2 * anchors + i];
       const h = data[3 * anchors + i];

       // Normalize to pixel coords
       const xPixel = (x / 640) * imgWidth;
       const yPixel = (y / 640) * imgHeight;
       const wPixel = (w / 640) * imgWidth;
       const hPixel = (h / 640) * imgHeight;

       boxes.push({
         x: xPixel, y: yPixel, w: wPixel, h: hPixel,
         score: maxScore,
         classId: classId
       });
    }
  }

  // Non-Maximum Suppression (Simple greedy)
  boxes.sort((a, b) => b.score - a.score);
  const finalBoxes = [];
  while (boxes.length > 0) {
    const current = boxes.shift();
    finalBoxes.push(current);
    // Remove boxes with high IoU with current
    for (let i = boxes.length - 1; i >= 0; i--) {
      if (iou([current.x, current.y, current.w, current.h], [boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h]) > 0.45) {
        boxes.splice(i, 1);
      }
    }
  }

  return finalBoxes;
};

// Fallback Simulation for when WASM/Model fails (CORS issues common in demos)
export const simulatedInference = (width: number, height: number) => {
   const count = 3 + Math.floor(Math.random() * 5);
   const boxes = [];
   for(let i=0; i<count; i++) {
       const w = 50 + Math.random() * 100;
       const h = 50 + Math.random() * 100;
       const x = w/2 + Math.random() * (width - w);
       const y = h/2 + Math.random() * (height - h);
       boxes.push({
           x, y, w, h,
           score: 0.6 + Math.random() * 0.39,
           classId: Math.floor(Math.random() * 4) // 4 demo classes
       });
   }
   return boxes;
}
