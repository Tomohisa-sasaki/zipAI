
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Github, Mail, ArrowRight, MapPin, Download, QrCode, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Language } from '../types';
import { SASAKI_DATA } from '../constants';
import Timeline from '../components/Timeline';

interface Props {
  lang: Language;
}

// --- Mock Data for Projects Carousel ---
const FEATURED_PROJECTS = [
  {
    id: 1,
    title: "Riemannian Manifold Alignment",
    desc: {
      en: "Aligning multi-subject fMRI data on a Riemannian manifold using Tangent Space Projection. By mapping covariance matrices to a common geometric space, we improved cross-subject decoding accuracy by 14% compared to standard anatomical alignment (Haxby & HCP datasets).",
      jp: "接空間射影を用いて、複数被験者のfMRIデータをリーマン多様体上でアライメントする手法。共分散行列を共通の幾何学的空間にマッピングすることで、標準的な解剖学的アライメントと比較して被験者間のデコーディング精度を14%向上させました（HaxbyおよびHCPデータセット）。"
    },
    tags: ["Riemannian Geometry", "Tangent Space", "PyTorch"],
    color: "from-indigo-500 to-purple-500"
  },
  {
    id: 2,
    title: "Dynamic Graph Transformers",
    desc: {
      en: "A Spatio-Temporal Graph Transformer (ST-GT) architecture that captures time-varying functional connectivity. Unlike static connectomes, this model utilizes self-attention to weigh transient neural events, identifying biomarkers for early-stage developmental disorders.",
      jp: "時変する機能的結合を捉える時空間グラフTransformer（ST-GT）アーキテクチャ。静的なコネクトームとは異なり、自己注意機構（Self-Attention）を用いて一過性の神経イベントを重み付けし、発達障害の初期バイオマーカーを特定します。"
    },
    tags: ["Graph Neural Networks", "Transformers", "Attention"],
    color: "from-emerald-400 to-teal-500"
  },
  {
    id: 3,
    title: "Neuro-Latent Diffusion",
    desc: {
      en: "Reconstructing visual perception from BOLD signals by aligning brain activity with the semantic latent space of Stable Diffusion (LDM). We employ a contrastive learning objective (CLIP) to map voxel-wise patterns directly to text/image embeddings for high-fidelity reconstruction.",
      jp: "脳活動をStable Diffusion（LDM）の意味論的潜在空間と整列させることで、BOLD信号から視覚知覚を再構成する研究。対照学習（CLIP）を採用し、ボクセル単位のパターンをテキスト/画像埋め込みに直接マッピングすることで、高忠実度な再構成を実現しました。"
    },
    tags: ["Generative AI", "Diffusion Models", "Contrastive Learning"],
    color: "from-pink-500 to-rose-500"
  },
  {
    id: 4,
    title: "Computational Psychiatry & RPE",
    desc: {
      en: "Integrating Reinforcement Learning (Q-Learning) with Hierarchical Bayesian Modeling to quantify 'Loss Aversion' in depressive phenotypes. We map Reward Prediction Errors (RPE) to striatal fMRI activity to separate decision noise from valuation deficits.",
      jp: "強化学習（Q学習）と階層ベイズモデリングを統合し、うつ病表現型における「損失回避」を定量化。報酬予測誤差（RPE）を線条体のfMRI活動にマッピングすることで、意思決定ノイズと価値評価の欠損を分離して解析します。"
    },
    tags: ["Reinforcement Learning", "Bayesian Modeling", "Behavioral Econ"],
    color: "from-amber-400 to-orange-500"
  },
  {
    id: 5,
    title: "Self-Supervised Brain Foundation",
    desc: {
      en: "Pre-training a Masked Autoencoder (MAE) on 10,000+ hours of resting-state fMRI. This 'Brain Foundation Model' learns universal representations of neural dynamics via self-supervision, enabling few-shot transfer learning for rare pathology diagnosis.",
      jp: "10,000時間以上の安静時fMRIデータを用いてMasked Autoencoder（MAE）を事前学習。「脳基盤モデル」として自己教師あり学習を通じて神経ダイナミクスの普遍的な表現を獲得し、希少疾患診断のためのFew-shot転移学習を可能にします。"
    },
    tags: ["Self-Supervised Learning", "Foundation Models", "MAE"],
    color: "from-blue-500 to-cyan-500"
  }
];

// --- Components ---

const SocialButton = ({ href, icon: Icon, label, colorClass }: { href: string, icon: any, label: string, colorClass: string }) => (
  <a 
    href={href} 
    target="_blank"
    rel="noopener noreferrer"
    className="relative group flex items-center justify-center w-12 h-12 bg-white border border-black/5 rounded-xl overflow-visible transition-all duration-300 hover:bg-mncc-primary hover:border-mncc-primary shadow-sm hover:shadow-lg hover:-translate-y-1"
  >
    {/* Tooltip */}
    <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-bold text-white bg-mncc-text rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl z-20">
      {label}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-mncc-text"></span>
    </span>
    
    <Icon size={20} className={`text-mncc-muted group-hover:text-white transition-colors duration-300`} />
  </a>
);

const ProfileFlipCard = ({ name }: { name: string }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-48 h-48 md:w-56 md:h-56 cursor-pointer perspective-1000 group"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div 
        className="w-full h-full relative preserve-3d transition-all duration-700"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
           {/* Gradient Ring */}
           <div className="w-full h-full rounded-full p-[4px] bg-gradient-to-br from-mncc-primary via-teal-300 to-mncc-accent shadow-lg shadow-mncc-primary/20">
             <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
                {/* Replaced with local asset path as requested */}
                <img 
                    src="/assets/profile-photo.jpg" 
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if local image isn't found yet
                      (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=TomohisaSasaki&backgroundColor=e6e4dd";
                    }}
                />
                <div className="absolute inset-0 bg-mncc-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             </div>
           </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-full bg-white border-4 border-mncc-primary flex flex-col items-center justify-center p-4 shadow-xl overflow-hidden">
            <QrCode size={48} className="text-mncc-text mb-2 relative z-10" />
            <p className="text-[10px] text-mncc-primary font-mono font-bold relative z-10">SCAN CONTACT</p>
            <div className="mt-2 flex gap-2 relative z-10">
               <div className="w-2 h-2 rounded-full bg-mncc-primary"></div>
               <div className="w-2 h-2 rounded-full bg-mncc-accent"></div>
               <div className="w-2 h-2 rounded-full bg-teal-300"></div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProjectCarousel = ({ lang }: { lang: Language }) => {
  const [index, setIndex] = useState(0);

  const nextSlide = () => setIndex((prev) => (prev + 1) % FEATURED_PROJECTS.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + FEATURED_PROJECTS.length) % FEATURED_PROJECTS.length);

  return (
    <div className="relative w-full max-w-md mx-auto md:mx-0 mt-8">
       <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-mncc-muted uppercase tracking-widest flex items-center gap-2">
             <Star size={14} className="text-mncc-accent" /> Featured Work
          </h3>
          <div className="flex gap-2">
             <button onClick={prevSlide} className="p-1.5 rounded-lg bg-white border border-black/5 hover:bg-gray-50 text-mncc-text transition-colors shadow-sm"><ChevronLeft size={14}/></button>
             <button onClick={nextSlide} className="p-1.5 rounded-lg bg-white border border-black/5 hover:bg-gray-50 text-mncc-text transition-colors shadow-sm"><ChevronRight size={14}/></button>
          </div>
       </div>

       <div className="relative h-48 overflow-hidden rounded-2xl bg-white border border-black/5 shadow-md group">
          <AnimatePresence mode='wait'>
             <motion.div
               key={index}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
               className="absolute inset-0 p-6 flex flex-col"
             >
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${FEATURED_PROJECTS[index].color}`}></div>
                <h4 className="text-xl font-bold text-mncc-text mb-2">{FEATURED_PROJECTS[index].title}</h4>
                <p className="text-sm text-mncc-muted mb-4 line-clamp-3 flex-grow leading-relaxed">
                   {FEATURED_PROJECTS[index].desc[lang]}
                </p>
                <div className="flex gap-2 mt-auto">
                   {FEATURED_PROJECTS[index].tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-1 rounded bg-mncc-bg text-mncc-muted border border-black/5 font-medium">
                        {tag}
                      </span>
                   ))}
                </div>
             </motion.div>
          </AnimatePresence>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-mncc-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm cursor-pointer">
              <span className="font-bold text-white flex items-center gap-2">
                 View Details <ArrowRight size={16} />
              </span>
          </div>
       </div>
    </div>
  );
};

const SasakiProfile: React.FC<Props> = ({ lang }) => {
  
  useEffect(() => {
    document.title = "Profile - Tomohisa Sasaki";
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": SASAKI_DATA.name,
      "jobTitle": "Researcher",
      "affiliation": {
        "@type": "Organization",
        "name": "MIT CSAIL"
      },
      "url": "https://www.linkedin.com/in/tomohisa-sasaki-0bb632345"
    });
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
      document.title = "MNCC | MIT NeuroAI Connectome Collective";
    };
  }, []);

  return (
    <div className="bg-[#f3f1ea] min-h-screen overflow-hidden relative">
      
      {/* Decorative Background Elements (Subtle) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-mncc-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-mncc-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header / Bio Section */}
      <div className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, ease: "easeOut" }}
           className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden"
        >
           <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start relative z-10">
             
             {/* Left Column: Avatar & Actions */}
             <div className="flex-shrink-0 flex flex-col items-center lg:items-start space-y-8 w-full lg:w-auto">
               <div className="mx-auto lg:mx-0">
                  <ProfileFlipCard name={SASAKI_DATA.name} />
               </div>
               
               <div className="flex justify-center lg:justify-start gap-4 w-full">
                 <SocialButton href="https://www.linkedin.com/in/tomohisa-sasaki-0bb632345" icon={Linkedin} label="Connect on LinkedIn" colorClass="" />
                 <SocialButton href="#" icon={Github} label="View GitHub Repos" colorClass="" />
                 <SocialButton href="#" icon={Mail} label="Send Email" colorClass="" />
               </div>

               {/* Project Carousel for Desktop */}
               <div className="hidden lg:block w-full">
                  <ProjectCarousel lang={lang} />
               </div>
             </div>

             {/* Right Column: Bio Content */}
             <div className="flex-grow w-full">
               <div className="text-center lg:text-left">
                   <motion.h1 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.2 }}
                     className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-tight text-mncc-text"
                   >
                     {SASAKI_DATA.name}
                   </motion.h1>
                   
                   <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8 text-lg">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/5 shadow-sm text-mncc-text">
                          <span className="w-2 h-2 bg-mncc-primary rounded-full animate-pulse"></span>
                          <span className="font-medium">{SASAKI_DATA.title[lang]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-mncc-muted">
                          <MapPin size={16} className="text-mncc-primary" /> 
                          <span>Cambridge, MA</span>
                      </div>
                   </div>
                   
                   <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10">
                     {SASAKI_DATA.keywords.map((keyword, i) => (
                       <motion.span 
                          key={keyword} 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg bg-white border border-black/5 text-mncc-primary hover:border-mncc-primary/30 hover:shadow-md transition-all cursor-default shadow-sm"
                       >
                         #{keyword}
                       </motion.span>
                     ))}
                   </div>

                   <div className="prose prose-lg max-w-none mb-10">
                       <p className="text-mncc-text text-lg md:text-xl leading-loose font-light border-l-4 border-mncc-primary pl-6">
                         {SASAKI_DATA.summary[lang]}
                       </p>
                   </div>

                   <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                     <Link 
                       to="/research" 
                       className="relative group inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-mncc-primary font-lg rounded-xl overflow-hidden shadow-lg shadow-mncc-primary/30 hover:shadow-mncc-primary/50 hover:-translate-y-1"
                     >
                       <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                       <span className="relative z-10 flex items-center gap-2">
                          {lang === 'en' ? 'View Research' : '研究内容を見る'} 
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                       </span>
                     </Link>
                     <a 
                       href="#" 
                       className="inline-flex items-center justify-center px-8 py-4 font-medium text-mncc-text transition-all duration-200 bg-white border border-black/10 rounded-xl hover:bg-gray-50 hover:border-black/20 hover:-translate-y-1 shadow-sm"
                     >
                       Download CV <Download size={18} className="ml-2 opacity-70" />
                     </a>
                   </div>
               </div>

               {/* Project Carousel for Mobile */}
               <div className="block lg:hidden w-full mt-12">
                  <ProjectCarousel lang={lang} />
               </div>

             </div>
           </div>
        </motion.div>
      </div>

      {/* Timeline Section */}
      <div className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
          <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-mncc-text mb-4">
                 {lang === 'en' ? 'Experience & History' : '経歴・沿革'}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-mncc-primary to-mncc-accent mx-auto rounded-full"></div>
          </div>
          <Timeline lang={lang} data={SASAKI_DATA.timeline} />
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default SasakiProfile;
