
import React from 'react';
import { ResearchTopic, Language } from '../types';
import { Layers, ArrowUpRight, Hash } from 'lucide-react';

interface Props {
  topic: ResearchTopic;
  lang: Language;
  children?: React.ReactNode;
}

const ResearchCard: React.FC<Props> = ({ topic, lang, children }) => {
  return (
    <div className="group relative h-full w-full">
      {/* Clean shadow instead of glow */}
      <div className="absolute inset-0 bg-black/5 rounded-2xl transform translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-300"></div>
      
      <div className="relative h-full bg-white border border-black/5 rounded-2xl p-1 flex flex-col overflow-hidden hover:border-mncc-primary/30 transition-colors">
        {/* Inner Content Area */}
        <div className="relative h-full rounded-xl p-6 flex flex-col z-10">
             
             {/* Top Row: Category & Icon */}
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-8 bg-mncc-primary rounded-full"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-mncc-muted group-hover:text-mncc-primary transition-colors">
                      {topic.category}
                    </span>
                </div>
                <div className="bg-mncc-bg p-2.5 rounded-xl border border-black/5 group-hover:bg-mncc-primary/10 transition-all duration-300">
                    <Layers className="text-mncc-muted group-hover:text-mncc-primary transition-colors" size={20} />
                </div>
             </div>
    
             {/* Title */}
             <h3 className="text-2xl font-bold text-mncc-text mb-4 leading-tight group-hover:text-mncc-primary transition-colors">
               {topic.title[lang]}
             </h3>
    
             {/* Description / Content */}
             <div className="flex-grow mb-8 text-mncc-muted text-sm leading-relaxed border-l-2 border-black/5 pl-4 group-hover:border-mncc-primary transition-colors">
               {children ? children : topic.description[lang]}
             </div>
    
             {/* Footer: Tags & Link */}
             <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5">
               <div className="flex flex-wrap gap-2">
                 {topic.tags.slice(0,3).map(tag => (
                   <span key={tag} className="flex items-center gap-1 text-[10px] font-medium text-mncc-muted bg-mncc-bg px-2.5 py-1.5 rounded-md border border-black/5 group-hover:border-mncc-primary/20 transition-colors">
                     <Hash size={10} /> {tag}
                   </span>
                 ))}
               </div>
               <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-mncc-bg text-mncc-text group-hover:bg-mncc-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-45 transition-all duration-300 overflow-hidden">
                  <ArrowUpRight size={18} className="relative z-10" />
               </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchCard;
