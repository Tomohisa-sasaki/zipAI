
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';
import { Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC<{ lang: Language }> = ({ lang }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    
    const startPlayback = async () => {
        try {
            await video.play();
            setIsAutoplayBlocked(false);
        } catch (err: any) {
            if (err.name === 'NotAllowedError') {
                setIsAutoplayBlocked(true);
            } else if (err.name === 'AbortError') {
                // Ignore
            } else {
                console.warn("Video playback error:", err.message);
            }
        }
    };

    startPlayback();
  }, []);

  const handleManualPlay = () => {
    if (videoRef.current) {
        videoRef.current.play().then(() => setIsAutoplayBlocked(false)).catch(console.error);
    }
  };

  // Quick Chicken 50 Style (Neumorphic) - Adapted for Cream (#f3f1ea)
  const neumorphicBtn = `
    relative inline-flex items-center justify-center gap-3 px-10 py-5
    rounded-[50px] 
    bg-[#f3f1ea] 
    text-[#2d2d2d] font-bold tracking-widest uppercase text-sm
    transition-all duration-300 ease-out
    shadow-[20px_20px_60px_#d1cec7,-20px_-20px_60px_#ffffff]
    hover:shadow-[10px_10px_30px_#d1cec7,-10px_-10px_30px_#ffffff]
    hover:-translate-y-1
    hover:scale-[1.02]
    active:shadow-[inset_10px_10px_30px_#d1cec7,inset_-10px_-10px_30px_#ffffff]
    active:translate-y-0
    active:scale-95
  `;

  return (
    <div className="relative w-full h-screen bg-[#f3f1ea] overflow-hidden font-sans group">
      {/* Video Background with Heavy Cream Overlay */}
      <div className="absolute inset-0 z-0">
         {!videoError ? (
             <div className="relative w-full h-full">
                <video 
                    ref={videoRef}
                    loop 
                    muted 
                    playsInline 
                    autoPlay
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover grayscale opacity-40" 
                    onError={(e) => {
                        const target = e.target as HTMLVideoElement;
                        if (target.networkState === 3) {
                            setVideoError(true);
                        }
                    }}
                >
                    <source src="/assets/veo-chihuahua.mp4" type="video/mp4" /> 
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-blue-network-998-large.mp4" type="video/mp4" />
                    <source src="https://cdn.pixabay.com/video/2020/04/18/36462-411735643_small.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-[#f3f1ea]/80 mix-blend-hard-light"></div>
                <div className="absolute inset-0 bg-[#f3f1ea]/60"></div>
             </div>
         ) : (
             <div className="w-full h-full bg-gradient-to-br from-[#f3f1ea] via-[#e6e4dd] to-[#f3f1ea]"></div>
         )}
      </div>
      
      {/* Autoplay Blocked Overlay */}
      {isAutoplayBlocked && !videoError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#f3f1ea]/60 backdrop-blur-sm">
              <button 
                onClick={handleManualPlay}
                className={neumorphicBtn}
              >
                  <Play size={24} fill="currentColor" className="text-mncc-primary" />
                  {lang === 'en' ? 'Start Experience' : '再生する'}
              </button>
          </div>
      )}

      {/* Hero Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
          <div className="max-w-5xl space-y-8 mt-32 md:mt-0 pointer-events-auto">
              
              {/* ZIP ANIMATION TITLE */}
              <div className="relative flex justify-center items-center overflow-hidden py-4">
                  <motion.h1 
                    className="text-6xl md:text-9xl font-bold text-mncc-text tracking-tighter select-none flex items-center justify-center"
                  >
                      {/* 'Zip' slides from left, 'AI' slides from right. They 'Zip' together in middle. */}
                      {/* Responsive offset: smaller offset on mobile to prevent overflow issues */}
                      <motion.span 
                        className="inline-block"
                        initial={{ x: -60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.2 }}
                      >
                        Zip
                      </motion.span>
                      
                      {/* The joining space - optional graphic or just gap closing */}
                      <motion.span
                        className="inline-block w-0 overflow-hidden"
                        initial={{ width: 10 }}
                        animate={{ width: 0 }}
                        transition={{ delay: 0.4, duration: 0.3, ease: "easeIn" }}
                      > </motion.span>

                      <motion.span 
                        className="inline-block text-mncc-primary"
                        initial={{ x: 60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.2 }}
                      >
                        AI
                      </motion.span>
                  </motion.h1>
              </div>
              
              <motion.div 
                className="space-y-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                  <motion.div 
                     className="text-xl md:text-3xl text-mncc-muted font-light tracking-[0.1em] font-sans py-1 px-4 inline-block border-b-2 border-mncc-primary/30 relative overflow-hidden"
                  >
                      <motion.span
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="block"
                      >
                        Zip Your Potent<span className="text-mncc-primary font-bold">IA</span>l
                      </motion.span>
                  </motion.div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10 mt-20">
                      <Link 
                        to="/research"
                        className={`${neumorphicBtn} group/btn w-full sm:w-auto`}
                      >
                         <span className="group-hover/btn:text-mncc-primary transition-colors">
                           {lang === 'en' ? 'Explore Research' : '研究を探求する'}
                         </span>
                         <ArrowRight size={20} className="text-mncc-muted group-hover/btn:text-mncc-primary group-hover/btn:translate-x-1 transition-all" />
                      </Link>
                      <Link 
                        to="/demos"
                        className={`${neumorphicBtn} group/btn w-full sm:w-auto`}
                      >
                         <span className="group-hover/btn:text-mncc-accent transition-colors">
                           {lang === 'en' ? 'View Demos' : 'デモを見る'}
                         </span>
                         <Play size={18} className="text-mncc-muted group-hover/btn:text-mncc-accent group-hover/btn:scale-110 transition-all" />
                      </Link>
                  </div>
              </motion.div>
          </div>
      </div>
    </div>
  );
};

export default Home;
