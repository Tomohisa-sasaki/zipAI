
import { TimelineItem, ResearchTopic, NavLink, ProfileData, ProjectItem } from './types';

export const NAV_LINKS: NavLink[] = [
  { label: { en: 'Home', jp: 'ホーム' }, path: '/' },
  { label: { en: 'Members', jp: 'メンバー' }, path: '/members' },
  { label: { en: 'Research', jp: '研究紹介' }, path: '/research' },
  { label: { en: 'Demos', jp: 'デモ' }, path: '/demos' },
  { label: { en: 'Contact', jp: 'お問い合わせ' }, path: '/contact' },
];

// --- TOMOHISA SASAKI DATA ---
export const SASAKI_TIMELINE: TimelineItem[] = [
  {
    year: "2025",
    title: { en: "Founder", jp: "創設者" },
    organization: "ZipAI",
    description: { en: "Established a cross-disciplinary research community.", jp: "分野横断的な研究コミュニティを設立。" }
  },
  {
    year: "2024",
    title: { en: "Research Intern", jp: "研究インターン" },
    organization: "Google",
    description: { en: "Focus on large-scale neural data analysis.", jp: "大規模神経データ分析に注力。" }
  },
  {
    year: "2022–Present",
    title: { en: "Researcher", jp: "研究員" },
    organization: "MIT CSAIL",
    description: { en: "Developing GNN models for connectomics.", jp: "コネクトミクスのためのGNNモデル開発。" }
  },
  {
    year: "2019",
    title: { en: "Participant", jp: "参加者" },
    organization: "MITES Summer (MIT OEOP)",
    description: { en: "Completed 6-week residential STEM program.", jp: "6週間の滞在型STEMプログラムを修了。" }
  }
];

export const SASAKI_PROJECTS: ProjectItem[] = [
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

export const SASAKI_DATA: ProfileData = {
  id: "tomohisa-sasaki",
  name: "Tomohisa Sasaki",
  nameJp: "佐々木 智久",
  title: { en: "Researcher (MIT CSAIL)", jp: "研究員 (MIT CSAIL)" },
  role: { en: "Founder", jp: "創設者" },
  image: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" fill="none" shape-rendering="auto" width="512" height="512"><metadata xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"><rdf:RDF><rdf:Description><dc:title>Avataaars</dc:title><dc:creator>Pablo Stanley</dc:creator><dc:source xsi:type="dcterms:URI">https://avataaars.com/</dc:source><dcterms:license xsi:type="dcterms:URI">https://avataaars.com/</dcterms:license><dc:rights>Remix of „Avataaars” (https://avataaars.com/) by „Pablo Stanley”, licensed under „Free for personal and commercial use” (https://avataaars.com/)</dc:rights></rdf:Description></rdf:RDF></metadata><mask id="viewboxMask"><rect width="280" height="280" rx="0" ry="0" x="0" y="0" fill="#fff" /></mask><g mask="url(#viewboxMask)"><g transform="translate(8)"><path d="M132 36a56 56 0 0 0-56 56v6.17A12 12 0 0 0 66 110v14a12 12 0 0 0 10.3 11.88 56.04 56.04 0 0 0 31.7 44.73v18.4h-4a72 72 0 0 0-72 72v9h200v-9a72 72 0 0 0-72-72h-4v-18.39a56.04 56.04 0 0 0 31.7-44.73A12 12 0 0 0 198 124v-14a12 12 0 0 0-10-11.83V92a56 56 0 0 0-56-56Z" fill="#edb98a"/><path d="M108 180.61v8a55.79 55.79 0 0 0 24 5.39c8.59 0 16.73-1.93 24-5.39v-8a55.79 55.79 0 0 1-24 5.39 55.79 55.79 0 0 1-24-5.39Z" fill="#000" fill-opacity=".1"/><g transform="translate(0 170)"><path d="M132 57.05c14.91 0 27-11.2 27-25 0-1.01-.06-2.01-.2-3h1.2a72 72 0 0 1 72 72V110H32v-8.95a72 72 0 0 1 72-72h1.2c-.14.99-.2 1.99-.2 3 0 13.8 12.09 25 27 25Z" fill="#E6E6E6"/><path d="M100.78 29.12 101 28c-2.96.05-6 1-6 1l-.42.66A72.01 72.01 0 0 0 32 101.06V110h74s-10.7-51.56-5.24-80.8l.02-.08ZM158 110s11-53 5-82c2.96.05 6 1 6 1l.42.66a72.01 72.01 0 0 1 62.58 71.4V110h-74Z" fill="#a7ffc4"/><path d="M101 28c-6 29 5 82 5 82H90L76 74l6-9-6-6 19-30s3.04-.95 6-1ZM163 28c6 29-5 82-5 82h16l14-36-6-9 6-6-19-30s-3.04-.95-6-1Z" fill-rule="evenodd" clip-rule="evenodd" fill="#000" fill-opacity=".15"/><path d="M108 21.54c-6.77 4.6-11 11.12-11 18.35 0 7.4 4.43 14.05 11.48 18.67l5.94-4.68 4.58.33-1-3.15.08-.06c-6.1-3.15-10.08-8.3-10.08-14.12V21.54ZM156 36.88c0 5.82-3.98 10.97-10.08 14.12l.08.06-1 3.15 4.58-.33 5.94 4.68C162.57 53.94 167 47.29 167 39.89c0-7.23-4.23-13.75-11-18.35v15.34Z" fill="#F2F2F2"/><path d="m183.42 85.77.87-2.24 6.27-4.7a4 4 0 0 1 4.85.05l6.6 5.12-18.59 1.77Z" fill="#E6E6E6"/></g><g transform="translate(78 134)"><path fill-rule="evenodd" clip-rule="evenodd" d="M40.06 27.72C40.7 20.7 46.7 16 54 16c7.34 0 13.36 4.75 13.95 11.85.03.38-.87.67-1.32.45-5.54-2.77-9.75-4.16-12.63-4.16-2.84 0-7 1.36-12.45 4.07-.5.25-1.53-.07-1.5-.49Z" fill="#000" fill-opacity=".7"/></g><g transform="translate(104 122)"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 8c0 4.42 5.37 8 12 8s12-3.58 12-8" fill="#000" fill-opacity=".16"/></g><g transform="translate(76 90)"><path d="M27 16c-4.84 0-9 2.65-10.84 6.45-.54 1.1.39 1.85 1.28 1.12a15.13 15.13 0 0 1 9.8-3.22 6 6 0 1 0 10.7 2.8 2 2 0 0 0-.12-.74l-.15-.38a6 6 0 0 0-1.64-2.48C33.9 17.32 30.5 16 27 16ZM85 16c-4.84 0-9 2.65-10.84 6.45-.54 1.1.39 1.85 1.28 1.12a15.13 15.13 0 0 1 9.8-3.22 6 6 0 1 0 10.7 2.8 2 2 0 0 0-.12-.74l-.15-.38a6 6 0 0 0-1.64-2.48C91.9 17.32 88.5 16 85 16Z" fill="#000" fill-opacity=".6"/></g><g transform="translate(76 82)"></g><g transform="translate(-1)"><path d="M197 168h-2v56.06a9 9 0 1 0 2 0V168ZM71 176h-2v56.06a9 9 0 1 0 2 0V176Z" fill="#F4F4F4"/><circle cx="133" cy="20" r="20" fill="#F4F4F4"/><path d="M93.45 77.53h79.1c6.08 0 9.82 2.93 9.82 9V166c0 30.46 22.63 30.41 22.63 10.92v-73.86C205 68.8 187.77 21 133 21c-54.77 0-72 47.8-72 82.05v73.86c0 19.5 22.63 19.54 22.63-10.92V86.53c0-6.07 3.73-9 9.82-9Z" fill="#b1e2ff"/><path d="M198.67 67H67.33C76.42 42.5 96.26 21 133 21s56.58 21.5 65.67 46Z" fill="#000" fill-opacity=".2"/><path d="M91.2 33.73 102.5 50 115 32H93.66c-.83.56-1.65 1.14-2.46 1.73ZM172.34 32H152l12.5 18 10.95-15.77c-1-.77-2.04-1.51-3.11-2.23ZM133.5 50 121 32h25l-12.5 18Z" fill="#fff" fill-opacity=".5"/><path d="M99 59 86.5 41 74 59h25ZM130 59l-12.5-18L105 59h25ZM148.5 41 161 59h-25l12.5-18ZM192 59l-12.5-18L167 59h25Z" fill="#000" fill-opacity=".5"/></g><g transform="translate(49 72)"></g><g transform="translate(62 42)"></g></g></g></svg>')}`,
  themeColor: "mncc-primary",
  themeGradient: "from-mncc-primary to-mncc-accent",
  keywords: ["NeuroAI", "Generative Models", "HCI"],
  summary: {
    en: "Researcher at MIT CSAIL. I build generative foundation models for brain dynamics, bridging the gap between biological and artificial intelligence. My work focuses on self-supervised learning for fMRI and connectome-based predictive modeling.",
    jp: "MIT CSAILの研究員。生物学的知能と人工知能のギャップを埋める、脳ダイナミクスのための生成基盤モデルを構築しています。fMRIの自己教師あり学習やコネクトームに基づく予測モデリングに注力しています。"
  },
  timeline: SASAKI_TIMELINE,
  projects: SASAKI_PROJECTS,
  links: {
    linkedin: "https://www.linkedin.com/in/tomohisa-sasaki-0bb632345",
    github: "https://github.com/tomohisa-sasaki",
    email: "mailto:tomohisa@mit.edu"
  }
};

// --- YICHENG WU DATA ---
export const WU_TIMELINE: TimelineItem[] = [
  {
    year: "2025",
    title: { en: "Co-Founder", jp: "共同創業者" },
    organization: "ZipAI",
    description: { en: "Leading AI strategy and community growth.", jp: "AI戦略とコミュニティ成長を主導。" }
  },
  {
    year: "2019–Present",
    title: { en: "Researcher", jp: "研究員" },
    organization: "MIT CSAIL",
    description: { en: "Research on Neuro-Symbolic AI and program synthesis.", jp: "ニューロシンボリックAIとプログラム合成の研究。" }
  },
  {
    year: "2017–2019",
    title: { en: "Backend Engineer", jp: "バックエンドエンジニア" },
    organization: "Meta",
    description: { en: "Engineered scalable backend systems for social graph data processing.", jp: "ソーシャルグラフデータ処理のためのスケーラブルなバックエンドシステムを設計。" }
  },
  {
    year: "2017",
    title: { en: "B.S. in Computer Science", jp: "コンピュータ科学 学士" },
    organization: "Stanford University",
    description: { en: "Graduated with a focus on Systems and AI.", jp: "システムとAIを専攻し卒業。" }
  }
];

export const WU_PROJECTS: ProjectItem[] = [
  {
    id: 1,
    title: "Neuro-Symbolic Reasoning",
    desc: {
      en: "Combining neural networks with symbolic logic to improve reasoning capabilities in AI systems.",
      jp: "ニューラルネットワークと記号論理を組み合わせ、AIシステムの推論能力を向上させる研究。"
    },
    tags: ["Neuro-Symbolic", "Logic", "AI"],
    color: "from-purple-500 to-indigo-600"
  },
  {
    id: 2,
    title: "Robust RL Agents",
    desc: {
      en: "Developing reinforcement learning agents that are robust to distributional shifts in their environment.",
      jp: "環境の分布シフトに対してロバストな強化学習エージェントの開発。"
    },
    tags: ["Reinforcement Learning", "Robustness"],
    color: "from-violet-500 to-fuchsia-500"
  }
];

export const WU_DATA: ProfileData = {
  id: "yicheng-wu",
  name: "Yicheng Wu",
  nameJp: "ウ ギセイ",
  title: { en: "Researcher (MIT CSAIL)", jp: "研究員 (MIT CSAIL)" },
  role: { en: "Co-Founder", jp: "共同創業者" },
  image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yicheng&backgroundColor=e6e4dd",
  themeColor: "mncc-purple",
  themeGradient: "from-mncc-purple to-indigo-500",
  keywords: ["CompNeuro", "Neuro-Symbolic", "Distributed Systems"],
  summary: {
    en: "Co-Founder of ZipAI. Stanford CS graduate (2017) and former Backend Engineer at Meta. Currently researching Neuro-Symbolic AI at MIT CSAIL, bridging large-scale distributed systems with advanced reasoning models.",
    jp: "ZipAI共同創業者。スタンフォード大学コンピュータ科学部卒業（2017年）、元Metaバックエンドエンジニア。現在はMIT CSAILにて、大規模分散システムと高度な推論モデルを融合させたニューロシンボリックAIの研究を行っています。"
  },
  timeline: WU_TIMELINE,
  projects: WU_PROJECTS,
  links: {
    linkedin: "https://www.linkedin.com/in/yicheng-wu-demo",
    github: "https://github.com/yicheng-wu",
    email: "mailto:yicheng@mit.edu"
  }
};

export const RESEARCH_TOPICS: ResearchTopic[] = [
  {
    id: 'neuro-ai',
    title: { en: 'NeuroAI & Connectomics', jp: 'NeuroAI・コネクトミクス' },
    category: 'Core Research',
    description: { en: 'Predictive modeling of brain networks using Graph Neural Networks.', jp: 'グラフニューラルネットワークを用いた脳内ネットワークの予測モデリング。' },
    tags: ['fMRI', 'GNN', 'Graph Theory']
  },
  {
    id: 'behavioral',
    title: { en: 'Behavioral Economics', jp: '行動経済学' },
    category: 'Interdisciplinary',
    description: { en: 'Quantifying decision-making biases via RL parameters.', jp: '強化学習パラメータを用いた意思決定バイアスの定量化。' },
    tags: ['Reinforcement Learning', 'Prospect Theory']
  },
  {
    id: 'data-labeling',
    title: { en: 'Data Labeling Infrastructure', jp: 'データラベリング基盤' },
    category: 'Infrastructure',
    description: { en: 'Scalable annotation pipelines for large-scale ML datasets.', jp: '大規模MLデータセットのためのスケーラブルなアノテーションパイプライン。' },
    tags: ['Active Learning', 'RLHF', 'Scale']
  }
];

export const MEMBERS = {
  'tomohisa-sasaki': SASAKI_DATA,
  'yicheng-wu': WU_DATA
};

// Global App Configuration for Deployment
export const APP_CONFIG = {
  repoUrl: "https://github.com/zipai-research/zipai-platform",
  twitterUrl: "https://twitter.com/zipai_research"
};
