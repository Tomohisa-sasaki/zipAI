
import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Eye, MoveRight, Rocket, TrendingUp, Tag } from 'lucide-react';
import { Language } from '../types';

export const Demos: React.FC<{ lang: Language }> = ({ lang }) => {
  return (
    <div className="bg-mncc-bg min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
           <h1 className="text-4xl font-bold text-mncc-text mb-4">
             {lang === 'en' ? 'Technical Demos' : '技術デモ'}
           </h1>
           <p className="text-mncc-muted max-w-2xl mx-auto">
             {lang === 'en' 
                ? 'Interactive browser-based implementations of neuroimaging pipelines and simulations.' 
                : 'ブラウザベースで動作するニューロイメージングパイプラインとシミュレーションのインタラクティブデモ。'}
           </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Data Labeling Card */}
            <Link to="/demos/data-labeling" className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white hover:shadow-xl transition-all hover:-translate-y-1 shadow-sm">
               <div className="aspect-video bg-[#e0f2f1] relative flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 p-4 opacity-40">
                       {[...Array(6)].map((_, i) => (
                           <div key={i} className="border-2 border-dashed border-teal-600/30 rounded-lg"></div>
                       ))}
                   </div>
                   <Tag size={48} className="relative z-10 text-teal-600 group-hover:scale-110 transition-transform duration-300" />
               </div>
               <div className="p-6">
                   <div className="flex justify-between items-start mb-2">
                       <h3 className="text-xl font-bold text-mncc-text">Intelligent Labeling</h3>
                       <MoveRight className="text-mncc-muted group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                   </div>
                   <p className="text-sm text-mncc-muted">
                       Human-in-the-loop annotation interface with active learning and RLHF workflow simulation.
                   </p>
               </div>
            </Link>

            {/* Finance AI Card */}
            <Link to="/demos/finance-ai" className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white hover:shadow-xl transition-all hover:-translate-y-1 shadow-sm">
               <div className="aspect-video bg-[#edf7ed] relative flex items-center justify-center overflow-hidden">
                   {/* Graph Graphic */}
                   <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-end gap-1 px-8 pb-8 opacity-40 group-hover:opacity-60 transition-opacity">
                        {[40, 60, 45, 70, 55, 80, 65, 90].map((h, i) => (
                             <div key={i} className="flex-1 bg-[#58a495] rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                   </div>
                   <TrendingUp size={48} className="relative z-10 text-[#58a495] group-hover:scale-110 transition-transform duration-300" />
               </div>
               <div className="p-6">
                   <div className="flex justify-between items-start mb-2">
                       <h3 className="text-xl font-bold text-mncc-text">AI Financial Analyst</h3>
                       <MoveRight className="text-mncc-muted group-hover:text-[#58a495] group-hover:translate-x-1 transition-all" />
                   </div>
                   <p className="text-sm text-mncc-muted">
                       Automated KPI calculation, risk assessment, and Monte Carlo forecasting using financial data.
                   </p>
               </div>
            </Link>

            {/* Rocket Sim Card */}
            <Link to="/demos/rocket-sim" className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white hover:shadow-xl transition-all hover:-translate-y-1 shadow-sm">
               <div className="aspect-video bg-[#fff3e0] relative flex items-center justify-center overflow-hidden">
                   <Rocket size={48} className="relative z-10 text-[#e06c55] group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform duration-300" />
                   {/* Exhaust particles */}
                   <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-2 h-12 bg-gradient-to-t from-[#e06c55] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               </div>
               <div className="p-6">
                   <div className="flex justify-between items-start mb-2">
                       <h3 className="text-xl font-bold text-mncc-text">Rocket Telemetry</h3>
                       <MoveRight className="text-mncc-muted group-hover:text-[#e06c55] group-hover:translate-x-1 transition-all" />
                   </div>
                   <p className="text-sm text-mncc-muted">
                       Stylized real-time physics simulation of a launch vehicle with telemetry streaming integration.
                   </p>
               </div>
            </Link>

            {/* NiiVue Card */}
            <Link to="/demos/niivue" className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white hover:shadow-xl transition-all hover:-translate-y-1 shadow-sm">
               <div className="aspect-video bg-[#e3f2fd] relative flex items-center justify-center overflow-hidden">
                   <Eye size={48} className="relative z-10 text-[#42a5f5] group-hover:scale-110 transition-transform" />
               </div>
               <div className="p-6">
                   <div className="flex justify-between items-start mb-2">
                       <h3 className="text-xl font-bold text-mncc-text">NiiVue MRI Viewer</h3>
                       <MoveRight className="text-mncc-muted group-hover:text-[#42a5f5] group-hover:translate-x-1 transition-all" />
                   </div>
                   <p className="text-sm text-mncc-muted">
                       Client-side NIfTI rendering using WebGL 2.0. Explore the MNI152 template interactively.
                   </p>
               </div>
            </Link>

            {/* CPM Card */}
            <Link to="/demos/cpm" className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white hover:shadow-xl transition-all hover:-translate-y-1 shadow-sm">
               <div className="aspect-video bg-[#f3e5f5] relative flex items-center justify-center overflow-hidden">
                   <div className="grid grid-cols-5 gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                       {Array.from({length: 15}).map((_,i) => (
                           <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-purple-400' : 'bg-gray-300'}`}></div>
                       ))}
                   </div>
                   <Activity size={48} className="absolute z-10 text-purple-600" />
               </div>
               <div className="p-6">
                   <div className="flex justify-between items-start mb-2">
                       <h3 className="text-xl font-bold text-mncc-text">Connectome Modeling</h3>
                       <MoveRight className="text-mncc-muted group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                   </div>
                   <p className="text-sm text-mncc-muted">
                       Interactive logic demo of edge summation and thresholding for phenotype prediction.
                   </p>
               </div>
            </Link>
        </div>
      </div>
    </div>
  );
};
