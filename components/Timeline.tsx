
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
  // State to track expanded item index
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Helper for dynamic colors
  const isPurple = themeColor.includes('purple');
  
  const activeDotClass = isPurple 
    ? 'bg-mncc-purple shadow-[0_0_15px_rgba(139,92,246,0.4)]' 
    : 'bg-mncc-primary shadow-[0_0_15px_rgba(56,124,109,0.4)]';
  
  const activeTextClass = isPurple ? 'text-mncc-purple' : 'text-mncc-primary';
  const activeBgClass = isPurple ? 'bg-mncc-purple/10' : 'bg-mncc-primary/10';
  const activeBorderClass = isPurple ? 'border-mncc-purple/50 ring-mncc-purple/20' : 'border-mncc-primary/50 ring-mncc-primary/20';
  const gradientClass = isPurple ? 'from-mncc-purple to-purple-400' : 'from-mncc-primary to-mncc-accent';

  return (
    <div className="relative container mx-auto px-4 py-4 max-w-3xl">
      {/* Vertical Line */}
      <div className={`absolute left-[27px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b ${isPurple ? 'from-mncc-purple/20' : 'from-mncc-primary/20'} to-transparent transform md:-translate-x-1/2`} />

      <div className="space-y-8">
        {data.map((item, index) => {
          const isActive = activeIndex === index;
          
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative flex items-start md:items-center ${
                index % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Dot / Node */}
              <button 
                onClick={() => toggleItem(index)}
                className={`absolute left-[19px] md:left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 z-20 transition-all duration-500 focus:outline-none ${
                  isActive 
                    ? `${activeDotClass} scale-125 border-2 border-white` 
                    : `bg-[#f3f1ea] border-2 border-mncc-muted/50 hover:border-current ${isPurple ? 'hover:text-mncc-purple' : 'hover:text-mncc-primary'}`
                }`}
              >
                {isActive && <span className={`absolute inset-0 rounded-full animate-ping opacity-50 ${isPurple ? 'bg-mncc-purple' : 'bg-mncc-primary'}`}></span>}
              </button>

              {/* Date Label (Desktop) */}
              <div className={`hidden md:block w-5/12 text-center px-4 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                 <span className={`inline-block px-3 py-1 rounded-full text-sm font-mono transition-colors ${
                     isActive ? `${activeTextClass} ${activeBgClass} font-bold` : 'text-mncc-muted'
                 }`}>
                    {item.year}
                 </span>
              </div>

              {/* Mobile Spacer to align with line */}
              <div className="md:hidden w-12 flex-shrink-0"></div>

              {/* Card / Content */}
              <div className="flex-grow w-full md:w-5/12 pl-2 md:pl-0">
                <motion.div 
                  layout
                  onClick={() => toggleItem(index)}
                  className={`
                    relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 group shadow-sm
                    ${isActive 
                       ? `bg-white shadow-lg ring-1 ${activeBorderClass}` 
                       : `bg-white border-black/5 hover:border-current ${isPurple ? 'hover:text-mncc-purple' : 'hover:text-mncc-primary'}`}
                  `}
                >
                   {/* Header Section */}
                   <div className="p-5 flex items-center justify-between">
                      <div>
                         <div className="md:hidden mb-2">
                            <span className={`text-xs font-mono px-2 py-0.5 rounded ${isActive ? `${activeTextClass} ${activeBgClass}` : 'text-gray-500 bg-gray-100'}`}>
                                {item.year}
                            </span>
                         </div>
                         <h3 className={`text-lg font-bold transition-colors ${isActive ? activeTextClass : 'text-mncc-text'}`}>
                            {item.title[lang]}
                         </h3>
                         <div className="flex items-center gap-2 text-sm text-mncc-muted font-medium mt-1">
                            <Briefcase size={14} />
                            {item.organization}
                         </div>
                      </div>
                      <div className={`p-2 rounded-full transition-all duration-300 ${isActive ? `${activeBgClass} rotate-180 ${activeTextClass}` : 'text-gray-400 group-hover:text-current'}`}>
                         <ChevronDown size={20} />
                      </div>
                   </div>

                   {/* Expandable Content */}
                   <AnimatePresence>
                     {isActive && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         transition={{ duration: 0.3, ease: "easeInOut" }}
                       >
                         <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                            {item.description && (
                                <p className="text-sm text-mncc-text leading-relaxed">
                                  {item.description[lang]}
                                </p>
                            )}
                            
                            <div className="mt-4 flex flex-wrap gap-2">
                               <span className="text-[10px] flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-gray-600 border border-black/5">
                                  <Calendar size={10} /> {item.year}
                               </span>
                               {(item.organization.includes('MIT') || item.organization.includes('Meta') || item.organization.includes('Google')) && (
                                   <span className="text-[10px] flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-blue-600 border border-blue-200">
                                      <Award size={10} /> Experience
                                   </span>
                               )}
                            </div>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>

                   {/* Active Indicator Bar */}
                   {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradientClass}`}
                      />
                   )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;