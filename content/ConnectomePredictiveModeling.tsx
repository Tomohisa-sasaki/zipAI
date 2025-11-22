
import React from 'react';
import { Language } from '../types';
import { Brain, Network, Sigma } from 'lucide-react';

export const ConnectomePredictiveModeling: React.FC<{ lang: Language }> = ({ lang }) => {
  return (
    <div className="space-y-8">
      <p className="text-sm leading-relaxed text-mncc-muted">
        {lang === 'en'
          ? "My workflow adheres strictly to the Nilearn ecosystem for reproducible neuroimaging. I process BIDS-formatted datasets (preprocessed via fMRIPrep) to extract functional connectomes, leveraging specialized modules for GLM, Connectivity, and Decoding."
          : "私のワークフローは、再現可能なニューロイメージングのためにNilearnエコシステムに厳密に準拠しています。BIDS形式のデータセット（fMRIPrepで前処理済み）を処理して機能的コネクトームを抽出し、GLM、Connectivity、Decodingのための専門モジュールを活用します。"}
      </p>

      {/* 1. Masking & Extraction */}
      <div className="relative pl-6 border-l-2 border-mncc-primary/30 space-y-3">
         <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-mncc-bg border-2 border-mncc-primary"></div>
         <h4 className="text-mncc-text font-bold flex items-center gap-2">
            <Brain size={16} className="text-mncc-primary" />
            1. Signal Extraction & Masking
         </h4>
         <p className="text-xs text-gray-500">
             Using <code>NiftiMapsMasker</code> to extract time-series from probabilistic atlases (e.g., DiFuMo, MSDL) or <code>NiftiLabelsMasker</code> for parcellations.
         </p>
      </div>

      {/* 2. Connectivity */}
      <div className="relative pl-6 border-l-2 border-mncc-accent/30 space-y-3">
         <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-mncc-bg border-2 border-mncc-accent"></div>
         <h4 className="text-mncc-text font-bold flex items-center gap-2">
            <Network size={16} className="text-mncc-accent" />
            2. Connectivity Estimation & Manifold Learning
         </h4>
         <p className="text-xs text-gray-500 leading-relaxed">
            I utilize <code>ConnectivityMeasure</code> to extract functional connectivity structures, projecting Symmetric Positive Definite (SPD) matrices onto a common tangent plane (Riemannian geometry) to improve linear model performance.
         </p>
      </div>
    </div>
  );
};
