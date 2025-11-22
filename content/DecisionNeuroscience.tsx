
import React from 'react';
import { Language } from '../types';
import { TrendingUp, BrainCircuit, Scale } from 'lucide-react';

export const DecisionNeuroscience: React.FC<{ lang: Language }> = ({ lang }) => {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-mncc-muted">
        {lang === 'en'
          ? "I map neural Reward Prediction Error (RPE) signals to Prospect Theory value functions. By fitting computational models (Rescorla-Wagner, Q-Learning) to behavioral data, I correlate parameters like 'loss aversion' with specific neural substrates."
          : "神経系の報酬予測誤差（RPE）信号をプロスペクト理論の価値関数にマッピングします。行動データに計算モデル（Rescorla-Wagner, Q学習）を適合させ、「損失回避」などのパラメータを特定の神経基盤と相関させます。"}
      </p>

      <div className="grid grid-cols-2 gap-4">
          <div className="bg-mncc-bg/50 p-4 rounded-lg border border-black/5 flex flex-col items-center text-center group hover:border-mncc-accent/30 transition-colors">
             <TrendingUp size={20} className="text-mncc-primary mb-3 group-hover:scale-110 transition-transform" />
             <div className="text-xs text-mncc-text font-bold mb-1">RPE Signal</div>
             <div className="text-[10px] text-gray-500">Ventral Striatum (NAcc)</div>
          </div>
          <div className="bg-mncc-bg/50 p-4 rounded-lg border border-black/5 flex flex-col items-center text-center group hover:border-mncc-accent/30 transition-colors">
             <BrainCircuit size={20} className="text-mncc-accent mb-3 group-hover:scale-110 transition-transform" />
             <div className="text-xs text-mncc-text font-bold mb-1">Value Encoding</div>
             <div className="text-[10px] text-gray-500">vmPFC / OFC</div>
          </div>
      </div>
      
      <div className="bg-white/50 rounded-lg p-3 flex items-start gap-3 border border-black/5">
         <Scale size={16} className="text-gray-400 mt-1 flex-shrink-0" />
         <div>
             <h4 className="text-xs font-bold text-mncc-text mb-1">
                {lang === 'en' ? 'Prospect Theory Integration' : 'プロスペクト理論の統合'}
             </h4>
             <p className="text-[10px] text-gray-500 leading-relaxed">
                {lang === 'en' 
                   ? "Quantifying the 'Subjective Value' of mental well-being using non-linear utility functions derived from economic theory."
                   : "経済理論から導かれる非線形効用関数を用いて、精神的幸福の「主観的価値」を定量化します。"}
             </p>
         </div>
      </div>
    </div>
  );
};
