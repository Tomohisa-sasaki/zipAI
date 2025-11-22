
import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Video, AlertTriangle, Play } from 'lucide-react';
import { Language } from '../../types';

const ChihuahuaPage: React.FC<{ lang: Language }> = ({ lang }) => {
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
            } else if (err.name !== 'AbortError') {
                console.warn("Autoplay blocked:", err.message);
            }
        }
    };

    startPlayback();
  }, []);

  const handleManualPlay = () => {
      if (videoRef.current) {
          videoRef.current.play().then(() => setIsAutoplayBlocked(false));
      }
  };

  return (
    <div className="bg-[#0b1020] min-h-screen flex flex-col font-sans">
      {/* Header */}
      <div className="absolute top-6 left-6 z-20">
          <Link to="/demos" className="flex items-center gap-2 text-white/80 hover:text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 transition-all hover:bg-black/70">
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back to Demos</span>
          </Link>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
          {/* Video Container */}
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl shadow-2xl border border-white/10 overflow-hidden group">
             {!videoError ? (
                 <>
                     <video 
                        ref={videoRef}
                        loop 
                        muted 
                        playsInline 
                        autoPlay
                        crossOrigin="anonymous"
                        controls={!isAutoplayBlocked}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLVideoElement;
                            if (target.networkState === 3) {
                                setVideoError(true);
                            }
                        }}
                     >
                        {/* Primary Source: Local Asset */}
                        <source src="/assets/veo-chihuahua.mp4" type="video/mp4" />
                        {/* Secondary Source: Mixkit Dog Video */}
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-dog-catching-a-ball-in-slow-motion-3443-large.mp4" type="video/mp4" />
                        {/* Tertiary Source: Pixabay Fallback */}
                        <source src="https://cdn.pixabay.com/video/2016/09/21/5357-183786451_small.mp4" type="video/mp4" />
                     </video>
                     
                     {isAutoplayBlocked && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <button 
                                onClick={handleManualPlay}
                                className="p-6 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-110 transition-all text-white"
                            >
                                <Play size={48} fill="currentColor" />
                            </button>
                        </div>
                     )}
                 </>
             ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400">
                    <AlertTriangle size={48} className="mb-4 text-red-500" />
                    <p className="text-lg font-bold text-white">Video Load Error</p>
                    <p className="text-sm font-mono mt-2">All video sources unavailable</p>
                 </div>
             )}
             
             {/* Overlay Label */}
             <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur rounded-md border border-white/10 text-xs font-mono text-white/70 flex items-center gap-2 pointer-events-none z-20">
                 <Video size={12} className="text-mncc-primary"/>
                 <span>RAW_FOOTAGE: CHIHUAHUA_RUN_01</span>
             </div>
          </div>

          <div className="mt-8 text-center max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">Canine Locomotion Study</h2>
              <p className="text-mncc-muted text-sm">
                 High-fidelity video capture generated via Google Veo for kinematic analysis.
              </p>
          </div>
      </div>
    </div>
  );
};

export default ChihuahuaPage;
