
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Github, Mail, ArrowRight, MapPin, Download, QrCode, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Language, ProfileData, ProjectItem } from '../types';
import { MEMBERS } from '../constants';
import Timeline from '../components/Timeline';

interface Props {
  lang: Language;
}

const SocialButton = ({ href, icon: Icon, label, colorClass }: { href: string, icon: any, label: string, colorClass: string }) => (
  <a 
    href={href} 
    target="_blank"
    rel="noopener noreferrer"
    className={`relative group flex items-center justify-center w-12 h-12 bg-white border border-black/5 rounded-xl overflow-visible transition-all duration-300 hover:bg-current hover:border-current shadow-sm hover:shadow-lg hover:-translate-y-1 ${colorClass}`}
  >
    {/* Tooltip */}
    <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-bold text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl z-20">
      {label}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></span>
    </span>
    
    <Icon size={20} className={`text-mncc-muted group-hover:text-white transition-colors duration-300`} />
  </a>
);

const ProfileFlipCard = ({ name, image, themeGradient, themeColor }: { name: string, image: string, themeGradient: string, themeColor: string }) => {
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
           <div className={`w-full h-full rounded-full p-[4px] bg-gradient-to-br ${themeGradient} shadow-lg`}>
             <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
                {/* Use image prop directly to ensure correct loading of DiceBear or external URLs */}
                <img 
                    src={image} 
                    alt={name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             </div>
           </div>
        </div>

        {/* Back Side */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-full bg-white border-4 flex flex-col items-center justify-center p-4 shadow-xl overflow-hidden`} style={{ borderColor: 'currentColor' }}>
            <div className={themeColor.replace('mncc-', 'text-mncc-')}>
                <QrCode size={48} className="mb-2 relative z-10" />
                <p className="text-[10px] font-mono font-bold relative z-10">SCAN CONTACT</p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProjectCarousel = ({ lang, projects, themeColor }: { lang: Language, projects: ProjectItem[], themeColor: string }) => {
  const [index, setIndex] = useState(0);

  if (!projects || projects.length === 0) return null;

  const nextSlide = () => setIndex((prev) => (prev + 1) % projects.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + projects.length) % projects.length);
  
  // Derive text color class from theme name
  const textAccent = themeColor === 'mncc-purple' ? 'text-mncc-purple' : 'text-mncc-primary';

  return (
    <div className="relative w-full max-w-md mx-auto md:mx-0 mt-8">
       <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-mncc-muted uppercase tracking-widest flex items-center gap-2">
             <Star size={14} className={textAccent} /> Featured Work
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
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${projects[index].color}`}></div>
                <h4 className="text-xl font-bold text-mncc-text mb-2">{projects[index].title}</h4>
                <p className="text-xs text-mncc-muted mb-4 line-clamp-3 flex-grow leading-relaxed">
                   {projects[index].desc[lang]}
                </p>
                <div className="flex gap-2 mt-auto">
                   {projects[index].tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-1 rounded bg-mncc-bg text-mncc-muted border border-black/5 font-medium">
                        {tag}
                      </span>
                   ))}
                </div>
             </motion.div>
          </AnimatePresence>
          
          {/* Hover Overlay */}
          <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm cursor-pointer ${themeColor === 'mncc-purple' ? 'bg-mncc-purple/90' : 'bg-mncc-primary/90'}`}>
              <span className="font-bold text-white flex items-center gap-2">
                 View Details <ArrowRight size={16} />
              </span>
          </div>
       </div>
    </div>
  );
};

const ProfilePage: React.FC<Props> = ({ lang }) => {
  const { memberId } = useParams<{ memberId: string }>();
  
  // Default to Tomohisa if no ID provided (backward compatibility) or handle redirect
  const data: ProfileData | undefined = memberId ? MEMBERS[memberId] : undefined;

  useEffect(() => {
    if (data) {
        document.title = `Profile - ${data.name}`;
    }
  }, [data]);

  if (!data) {
      return <Navigate to="/members" replace />;
  }

  // Theme Helpers
  const isPurple = data.themeColor.includes('purple');
  const textAccent = isPurple ? 'text-mncc-purple' : 'text-mncc-primary';
  const bgAccent = isPurple ? 'bg-mncc-purple' : 'bg-mncc-primary';
  const borderAccent = isPurple ? 'border-mncc-purple' : 'border-mncc-primary';
  const shadowAccent = isPurple ? 'shadow-mncc-purple/30' : 'shadow-mncc-primary/30';
  const hoverTextAccent = isPurple ? 'hover:text-mncc-purple' : 'hover:text-mncc-primary';

  return (
    <div className="bg-[#f3f1ea] min-h-screen overflow-hidden relative">
      
      {/* Decorative Background Elements (Subtle) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className={`absolute -top-[20%] -right-[10%] w-[800px] h-[800px] ${isPurple ? 'bg-mncc-purple/5' : 'bg-mncc-primary/5'} rounded-full blur-3xl`}></div>
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
                  <ProfileFlipCard 
                    name={data.name} 
                    image={data.image} 
                    themeGradient={data.themeGradient} 
                    themeColor={data.themeColor}
                  />
               </div>
               
               <div className="flex justify-center lg:justify-start gap-4 w-full">
                 <SocialButton href={data.links.linkedin || '#'} icon={Linkedin} label="LinkedIn" colorClass={hoverTextAccent} />
                 <SocialButton href={data.links.github || '#'} icon={Github} label="GitHub" colorClass={hoverTextAccent} />
                 <SocialButton href={data.links.email || '#'} icon={Mail} label="Email" colorClass={hoverTextAccent} />
               </div>

               {/* Project Carousel for Desktop */}
               <div className="hidden lg:block w-full">
                  <ProjectCarousel lang={lang} projects={data.projects} themeColor={data.themeColor} />
               </div>
             </div>

             {/* Right Column: Bio Content */}
             <div className="flex-grow w-full">
               <div className="text-center lg:text-left">
                   {/* UPDATED: Wrap name on mobile to prevent overflow */}
                   <motion.h1 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.2 }}
                     className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4 leading-tight text-mncc-text whitespace-normal lg:whitespace-nowrap"
                   >
                     {data.name}
                   </motion.h1>
                   
                   <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8 text-lg">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/5 shadow-sm text-mncc-text">
                          <span className={`w-2 h-2 rounded-full animate-pulse ${bgAccent}`}></span>
                          <span className="font-medium">{data.title[lang]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-mncc-muted">
                          <MapPin size={16} className={textAccent} /> 
                          <span>Cambridge, MA</span>
                      </div>
                   </div>
                   
                   <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10">
                     {data.keywords.map((keyword, i) => (
                       <motion.span 
                          key={keyword} 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg bg-white border border-black/5 ${textAccent} hover:shadow-md transition-all cursor-default shadow-sm`}
                       >
                         #{keyword}
                       </motion.span>
                     ))}
                   </div>

                   <div className="prose prose-lg max-w-none mb-10">
                       <p className={`text-mncc-text text-sm leading-relaxed font-light border-l-4 ${borderAccent} pl-6`}>
                         {data.summary[lang]}
                       </p>
                   </div>

                   <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                     <Link 
                       to="/research" 
                       className={`relative group inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 ${bgAccent} font-lg rounded-xl overflow-hidden shadow-lg ${shadowAccent} hover:-translate-y-1`}
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
                  <ProjectCarousel lang={lang} projects={data.projects} themeColor={data.themeColor} />
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
              <div className={`w-24 h-1 bg-gradient-to-r ${data.themeGradient} mx-auto rounded-full`}></div>
          </div>
          <Timeline lang={lang} data={data.timeline} themeColor={data.themeColor} />
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

export default ProfilePage;
