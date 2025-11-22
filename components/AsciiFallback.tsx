import React, { useEffect, useRef, useState } from 'react';

const AsciiFallback: React.FC = () => {
  const preRef = useRef<HTMLPreElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    // Check reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) setShouldAnimate(false);

    const handler = (e: MediaQueryListEvent) => setShouldAnimate(!e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!shouldAnimate) return;

    let frameId: number;
    let t = 0;

    const width = 64;
    const height = 24;
    const chars = " .:-=+*#%@";

    const render = () => {
      t += 0.05;
      let output = "";
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // Normalize coords -1 to 1
          const u = (x / width) * 2 - 1;
          const v = ((y / height) * 2 - 1) * (height/width) * 2.0;
          
          // Rotating wave function
          const val = Math.sin(u * 4.0 + t) * Math.cos(v * 4.0 + t * 0.5);
          const r = Math.sqrt(u*u + v*v);
          
          // Mask circle
          if (r > 0.8) {
              output += " ";
              continue;
          }

          // Map to char
          const idx = Math.floor(((val + 1) / 2) * (chars.length - 1));
          output += chars[idx];
        }
        output += "\n";
      }

      if (preRef.current) {
        preRef.current.textContent = output;
      }
      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [shouldAnimate]);

  return (
    <div 
        className="flex items-center justify-center w-full h-full bg-[#0b1020] text-[#3dd6a0] font-mono text-[10px] leading-[10px] overflow-hidden"
        aria-live="polite"
        role="img" 
        aria-label="ASCII representation of neural activity"
    >
      <pre ref={preRef} className="whitespace-pre select-none opacity-50">
        {shouldAnimate ? "Loading Simulation..." : "Simulation Paused (Reduced Motion)"}
      </pre>
    </div>
  );
};

export default AsciiFallback;
