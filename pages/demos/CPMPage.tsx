
import React, { useState, useMemo } from 'react';
import { Language } from '../../types';
import { Link } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';

interface Props {
  lang: Language;
}

const CPMPage: React.FC<Props> = ({ lang }) => {
  const [threshold, setThreshold] = useState(0.65);
  const size = 10; // 10x10 matrix
  
  const matrix = useMemo(() => {
      const mat = [];
      for(let i=0; i<size; i++) {
          const row = [];
          for(let j=0; j<size; j++) {
             if (i === j) {
                 row.push(1.0);
             } else {
                 const val = (Math.sin(i) * Math.cos(j) + 1) / 2; 
                 row.push(val);
             }
          }
          mat.push(row);
      }
      return mat;
  }, []);

  const { posEdges, score } = useMemo(() => {
      let pos = 0;
      let s = 0;
      for(let i=0; i<size; i++) {
          for(let j=0; j<i; j++) {
              if (matrix[i][j] > threshold) {
                  pos++;
                  s += matrix[i][j];
              }
          }
      }
      return { posEdges: pos, score: s.toFixed(2) };
  }, [threshold, matrix]);

  return (
    <div className="bg-[#f3f1ea] min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
         <div className="flex items-center gap-4 mb-8">
            <Link to="/demos" className="p-2 rounded-full bg-white border border-black/5 hover:bg-gray-50 text-mncc-muted hover:text-mncc-text transition-colors shadow-sm">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-mncc-text">Connectome Predictive Modeling (CPM)</h1>
              <p className="text-mncc-muted text-sm">
                 Interactive demonstration of edge summation logic for phenotype prediction.
              </p>
            </div>
         </div>

         <div className="grid lg:grid-cols-2 gap-8">
             {/* Visualization */}
             <div className="bg-white border border-black/5 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-mncc-text font-bold">Connectivity Matrix (10x10 ROI)</h3>
                    <span className="text-xs font-mono text-mncc-primary">r-value heatmap</span>
                </div>
                
                <div className="aspect-square bg-gray-50 rounded-lg p-2 grid grid-cols-10 gap-px border border-black/5">
                    {matrix.map((row, i) => 
                       row.map((val, j) => {
                          const isActive = i !== j && val > threshold;
                          return (
                            <div 
                               key={`${i}-${j}`}
                               className={`
                                 w-full h-full rounded-sm transition-all duration-300
                                 ${isActive ? 'bg-mncc-primary shadow-[0_0_4px_rgba(56,124,109,0.5)] scale-95' : 'bg-gray-200'}
                               `}
                               style={{ 
                                   opacity: i===j ? 0.1 : isActive ? 1 : val * 0.3
                               }}
                               title={`Edge ${i}-${j}: r=${val.toFixed(2)}`}
                            />
                          )
                       })
                    )}
                </div>
             </div>

             {/* Controls & Stats */}
             <div className="space-y-6">
                 <div className="bg-white border border-black/5 rounded-xl p-6 shadow-sm">
                     <label className="block text-sm font-bold text-mncc-text mb-2 flex justify-between">
                        <span>Selection Threshold (r)</span>
                        <span className="text-mncc-primary font-mono">{threshold.toFixed(2)}</span>
                     </label>
                     <input 
                        type="range" 
                        min="0.1" 
                        max="0.95" 
                        step="0.01" 
                        value={threshold}
                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-mncc-primary"
                     />
                     <p className="text-xs text-mncc-muted mt-2">
                        Drag to select edges correlated with the phenotype.
                     </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white border border-black/5 rounded-xl p-4 text-center shadow-sm">
                         <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Selected Edges</div>
                         <div className="text-3xl font-mono text-mncc-text font-bold">{posEdges}</div>
                     </div>
                     <div className="bg-white border border-black/5 rounded-xl p-4 text-center shadow-sm">
                         <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Network Score</div>
                         <div className="text-3xl font-mono text-mncc-accent font-bold">{score}</div>
                     </div>
                 </div>

                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                     <div className="flex items-start gap-3">
                         <Info className="text-blue-500 shrink-0 mt-1" size={16} />
                         <div className="text-sm text-gray-600 leading-relaxed">
                             <p className="mb-2 font-bold text-blue-800">Methodology Note</p>
                             In a real CPM pipeline, this summary score is calculated for each subject and correlated with behavioral measures (e.g., IQ, symptom severity) using Leave-One-Out Cross-Validation.
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default CPMPage;
