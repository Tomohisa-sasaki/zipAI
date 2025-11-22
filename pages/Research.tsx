
import React from 'react';
import { Database, Tag, Cpu } from 'lucide-react';
import { Language } from '../types';
import { RESEARCH_TOPICS } from '../constants';
import ResearchCard from '../components/ResearchCard';

// Import Content Components
import { ConnectomePredictiveModeling } from '../content/ConnectomePredictiveModeling';
import { DecisionNeuroscience } from '../content/DecisionNeuroscience';

const TOPIC_CONTENT_MAP: Record<string, React.FC<{ lang: Language }>> = {
  'neuro-ai': ConnectomePredictiveModeling,
  'behavioral': DecisionNeuroscience,
  'data-labeling': ({ lang }) => (
    <div className="space-y-4">
        <p className="text-sm text-mncc-muted leading-relaxed">
            {lang === 'en' 
                ? "We develop automated RLHF (Reinforcement Learning from Human Feedback) pipelines to ensure high-quality data annotation for Large Language Models and Computer Vision."
                : "大規模言語モデルおよびコンピュータビジョンのための高品質なデータアノテーションを保証するために、自動化されたRLHF（人間からのフィードバックによる強化学習）パイプラインを開発しています。"}
        </p>
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded border border-black/5">
                <div className="text-[10px] font-bold text-mncc-primary uppercase">Precision</div>
                <div className="text-lg font-mono text-mncc-text">99.8%</div>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-black/5">
                <div className="text-[10px] font-bold text-mncc-primary uppercase">Throughput</div>
                <div className="text-lg font-mono text-mncc-text">10k/hr</div>
            </div>
        </div>
    </div>
  )
};

const Research: React.FC<{ lang: Language }> = ({ lang }) => {
  return (
    <div className="bg-mncc-bg min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-mncc-text mb-6">
             {lang === 'en' ? 'Research & Simulation' : '研究・シミュレーション'}
          </h1>
          <p className="text-lg text-mncc-muted max-w-3xl mx-auto">
            {lang === 'en' 
              ? 'Bridging NeuroAI, Behavioral Economics, and Data Infrastructure.' 
              : 'NeuroAI、行動経済学、そしてデータインフラストラクチャの融合。'}
          </p>
        </div>

        {/* Data Labeling Feature Section */}
        <div className="mb-16 bg-mncc-panel border border-black/5 rounded-2xl p-8 shadow-lg flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-mncc-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            
            <div className="flex-1 space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-mncc-primary/10 text-mncc-primary rounded-full text-xs font-bold">
                    <Tag size={12} /> Data Infrastructure
                </div>
                <h2 className="text-3xl font-bold text-mncc-text">
                    {lang === 'en' ? 'Intelligent Annotation Infrastructure' : 'インテリジェント・アノテーション・インフラ'}
                </h2>
                <p className="text-mncc-muted leading-relaxed">
                    {lang === 'en' 
                        ? "Developing next-generation annotation pipelines utilizing active learning and RLHF. By integrating human feedback loops directly into the model training process, we achieve superior dataset quality with reduced manual effort."
                        : "アクティブラーニングとRLHFを活用した次世代のアノテーションパイプラインを開発。人間のフィードバックループをモデル学習プロセスに直接統合することで、手作業を削減しつつ優れたデータセット品質を実現します。"}
                </p>
                <div className="flex gap-4 pt-2">
                     <div className="flex items-center gap-2 text-sm text-mncc-text font-medium">
                         <Cpu size={16} className="text-mncc-accent" /> Human-in-the-loop
                     </div>
                     <div className="flex items-center gap-2 text-sm text-mncc-text font-medium">
                         <Database size={16} className="text-mncc-accent" /> Vector Storage
                     </div>
                </div>
            </div>
            
            {/* Abstract Visual Representation of Labeling */}
            <div className="flex-1 w-full h-64 bg-[#fcfbf9] rounded-xl border border-black/5 relative overflow-hidden p-4 grid grid-cols-3 gap-2">
                 {Array.from({length: 6}).map((_, i) => (
                     <div key={i} className="relative bg-white border border-black/5 rounded-lg overflow-hidden shadow-sm group">
                         <div className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-gray-200 group-hover:border-mncc-primary group-hover:bg-mncc-primary transition-colors"></div>
                         <div className="absolute inset-0 flex items-center justify-center opacity-20 text-[40px] font-mono text-gray-300 select-none">
                            IMG_{i}
                         </div>
                         <div className="absolute bottom-2 left-2 text-[8px] font-mono bg-gray-100 px-1 rounded text-gray-500">
                            CONF: {(0.8 + Math.random() * 0.19).toFixed(2)}
                         </div>
                     </div>
                 ))}
                 {/* Scanning Line */}
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mncc-primary/10 to-transparent h-full w-full animate-[scan_2s_linear_infinite] pointer-events-none border-b border-mncc-primary/30"></div>
            </div>
        </div>

        {/* Core Topics Grid */}
        <div>
           <h2 className="text-2xl font-bold text-mncc-text mb-8 flex items-center gap-2">
              <Database className="text-mncc-primary" />
              {lang === 'en' ? 'Core Research Areas' : '主要研究領域'}
           </h2>
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {RESEARCH_TOPICS.map((topic) => {
               const ContentComponent = TOPIC_CONTENT_MAP[topic.id];
               return (
                 <ResearchCard key={topic.id} topic={topic} lang={lang}>
                    {ContentComponent ? <ContentComponent lang={lang} /> : <p className="text-sm text-mncc-muted">{topic.description[lang]}</p>}
                 </ResearchCard>
               );
             })}
           </div>
        </div>

        <style>{`
            @keyframes scan {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
            }
        `}</style>

      </div>
    </div>
  );
};

export default Research;
