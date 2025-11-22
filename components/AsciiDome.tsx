import React, { useEffect, useRef, useState } from 'react';

const AsciiDome: React.FC = () => {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    let frameId: number;
    let A = 0;
    let B = 0;

    const renderAscii = () => {
      const width = 80;
      const height = 40; // Intentionally wider for aspect ratio
      const buffer = new Array(width * height).fill(' ');
      const zBuffer = new Array(width * height).fill(0);

      // Dome (Hemisphere) Logic
      // Standard donut logic is torus. We modify to sphere/hemisphere.
      // Sphere: x^2 + y^2 + z^2 = r^2
      
      // Let's stick to the classic donut but sliced or squashed to look like a dome for aesthetic abstractness,
      // or implement a point cloud sphere.
      // Using point cloud sphere for "Dome" look.

      const R = 15; // Radius
      
      // Rotation
      A += 0.02;
      B += 0.02;

      const cosA = Math.cos(A), sinA = Math.sin(A);
      const cosB = Math.cos(B), sinB = Math.sin(B);

      for (let theta = 0; theta < 2 * Math.PI; theta += 0.1) {
        for (let phi = 0; phi < Math.PI / 2; phi += 0.05) { // Only top half (Dome)
           
           // Sphere coords
           const sx = R * Math.sin(phi) * Math.cos(theta);
           const sy = R * Math.cos(phi); // Y is up
           const sz = R * Math.sin(phi) * Math.sin(theta);

           // Rotate around Y and Z
           let x = sx;
           let y = sy * cosA - sz * sinA;
           let z = sy * sinA + sz * cosA;

           // Rotate around X
           let y2 = y * cosB - z * sinB;
           let z2 = y * sinB + z * cosB;
           
           // Project
           const ooz = 1 / (z2 + 40); // One over Z
           const xp = Math.floor(width / 2 + (x * 2) * ooz * width * 0.6);
           const yp = Math.floor(height / 2 - (y2) * ooz * height);

           const idx = xp + yp * width;
           if (idx >= 0 && idx < width * height) {
             if (ooz > zBuffer[idx]) {
               zBuffer[idx] = ooz;
               // Shading
               const luminance = (y2 + R)/ (2*R); // Simple height based shading
               const chars = ".,-~:;=!*#$@";
               const charIdx = Math.floor(luminance * chars.length);
               buffer[idx] = chars[Math.max(0, Math.min(chars.length - 1, charIdx))];
             }
           }
        }
      }
      
      // Add a base/columns ring
      for(let theta=0; theta<2*Math.PI; theta+=0.05) {
          const r = R * 1.1;
          const x = r * Math.cos(theta);
          const z = r * Math.sin(theta);
          
          // Rotate
          let y = -2; // Base level
          let y_rot = y * cosA - z * sinA;
          let z_rot = y * sinA + z * cosA;
          
          let y2 = y_rot * cosB - z_rot * sinB;
          let z2 = y_rot * sinB + z_rot * cosB;

          const ooz = 1 / (z2 + 40);
          const xp = Math.floor(width / 2 + (x * 2) * ooz * width * 0.6);
          const yp = Math.floor(height / 2 - (y2) * ooz * height);

          const idx = xp + yp * width;
          if (idx >= 0 && idx < width * height) {
             if (ooz > zBuffer[idx]) {
               zBuffer[idx] = ooz;
               buffer[idx] = '|';
             }
          }
      }

      if (preRef.current) {
        // Join rows
        let output = "";
        for(let i=0; i<height; i++) {
            output += buffer.slice(i*width, (i+1)*width).join('') + "\n";
        }
        preRef.current.innerText = output;
      }

      frameId = requestAnimationFrame(renderAscii);
    };

    frameId = requestAnimationFrame(renderAscii);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full bg-[#0b1020] text-mncc-primary font-mono text-[8px] md:text-[12px] leading-[8px] md:leading-[12px] overflow-hidden">
      <pre ref={preRef} className="whitespace-pre select-none blur-[0.5px]"></pre>
    </div>
  );
};

export default AsciiDome;