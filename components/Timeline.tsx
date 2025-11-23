
import React, { useState } from 'react';
import { TimelineItem, Language } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Briefcase, Award, Calendar } from 'lucide-react';

interface TimelineProps {
  lang: Language;
  data: TimelineItem[];
  themeColor?: string; // Hex or Tailwind class logic
}

const Timeline: React.FC<TimelineProps> = ({ lang, data, themeColor = 'mncc-primary' }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const isPurple = themeColor.includes('purple');
  const activeDotClass = isPurple 
    ? 'bg-mncc-purple shadow-[0_0_15px_rgba(139,92,246,0.4)]' 
    : 'bg-mncc-primary shadow-[0_0_15px_rgba(56,124,109,0.4)]';
  const activeTextClass = isPurple ? 'text-mncc-purple' : 'text-mncc-primary';
  const activeBgClass = isPurple ? 'bg-mncc-purple/10' : 'bg-mncc-primary/10';
  const badgeClass = isPurple ? 'bg-mncc-purple/15 text-mncc-purple' : 'bg-mncc-primary/15 text-mncc-primary';
  const gradientClass = isPurple ? 'from-mncc-purple to-purple-400' : 'from-mncc-primary to-mncc-accent';

  return (
    <div className="relative max-w-5xl mx-auto px-3 md:px-0">
      <div className={`absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b ${isPurple ? 'from-mncc-purple/30' : 'from-mncc-primary/30'} to-transparent pointer-events-none`} />
      <div className="space-y-10 relative z-10">
        {data.map((item, index) => {
          const isActive = activeIndex === index;
          const isLeft = index % 2 === 0;

          const card = (
            <motion.div 
              layout
              onClick={() => toggleItem(index)}
              className={`relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 shadow-lg backdrop-blur bg-white/80 ${
                isActive 
                  ? `${badgeClass} border-current ring-2 ring-offset-2 ring-offset-[#f3f1ea]` 
                  : 'border-black/5 hover:border-current hover:-translate-y-1'
              }`}
            >
              <div className={`absolute top-0 bottom-0 w-1 bg-gradient-to-b ${gradientClass} ${isLeft ? 'left-0' : 'right-0'}`} />
              <div className="p-5 flex items-start justify-between gap-3">
                 <div>
                    <div className="md:hidden mb-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-mono">
                        {item.year}
                      </span>
                    </div>
                    <h3 className={`text-lg font-bold leading-snug ${isActive ? activeTextClass : 'text-mncc-text'}`}>
                      {item.title[lang]}
                    </h3>
                    <p className="flex items-center gap-2 text-sm text-mncc-muted mt-1">
                      <Briefcase size={14} /> {item.organization}
                    </p>
                 </div>
                 <div className={`p-2 rounded-full transition-all duration-300 ${isActive ? `${activeBgClass} rotate-180 ${activeTextClass}` : 'text-gray-400 group-hover:text-current'}`}>
                    <ChevronDown size={18} />
                 </div>
              </div>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="px-5 pb-5"
                  >
                    {item.description && (
                      <p className="text-sm text-mncc-text leading-relaxed">{item.description[lang]}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-[11px] flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-gray-700 border border-black/5">
                        <Calendar size={10} /> {item.year}
                      </span>
                      {(item.organization.includes('MIT') || item.organization.includes('Meta') || item.organization.includes('Google')) && (
                        <span className="text-[11px] flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-blue-700 border border-blue-200">
                          <Award size={10} /> {lang === 'en' ? 'Flagship Experience' : '注目の経験'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );

          const cardColumnClasses = isLeft 
            ? 'md:order-1 md:justify-end' 
            : 'md:order-3 md:justify-start';

          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              viewport={{ once: true }}
              className="relative grid md:grid-cols-[1fr,120px,1fr] items-center gap-4"
            >
              <div className={`order-2 ${cardColumnClasses} flex w-full`}>
                 <div className="w-full md:w-[95%]">{card}</div>
              </div>
              <div className="order-1 md:order-2 flex md:flex-col items-center justify-center gap-3">
                 <span className={`hidden md:inline-flex px-3 py-1 rounded-full text-xs font-mono border ${
                    isActive ? `${badgeClass} border-current` : 'bg-white text-mncc-muted border-black/5'
                 }`}>
                    {item.year}
                 </span>
                 <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${isActive ? activeDotClass : 'bg-mncc-bg border-white shadow'} `}></div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
