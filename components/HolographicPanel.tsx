'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function HolographicPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let targetIntensity = 0;
    let currentIntensity = 0;
    
    // Flag for mobile/touch devices
    const isMobile = typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches;
    let autoPulseTime = 0;

    const handleInput = (clientX: number, clientY: number) => {
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
      );
      
      const maxDistance = isMobile ? 400 : 600;
      let rawIntensity = Math.max(0, 1 - distance / maxDistance);
      targetIntensity = Math.pow(rawIntensity, 1.8);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile) handleInput(e.clientX, e.clientY);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleInput(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const updateIntensity = () => {
      if (isMobile) {
        // On touch devices, automatically oscillate intensity so the effect is always visible
        autoPulseTime += 0.015;
        // Oscillates smoothly between 0.3 and 0.8
        const ambientIntensity = 0.55 + Math.sin(autoPulseTime) * 0.25;
        // If user is touching near it, targetIntensity might be higher
        targetIntensity = Math.max(ambientIntensity, targetIntensity * 0.95); // slowly decay touch intensity
      }

      currentIntensity += (targetIntensity - currentIntensity) * 0.08;
      
      // Directly modify CSS variables for high-performance direct DOM updates
      if (panelRef.current) {
        panelRef.current.style.setProperty('--h-intensity', currentIntensity.toFixed(3));
        const pulseSpeed = 4 - (currentIntensity * 3.2); // Faster pulse when closer
        panelRef.current.style.setProperty('--h-pulse', `${Math.max(0.5, pulseSpeed)}s`);
      }
      if (textRef.current) {
        textRef.current.style.setProperty('--h-intensity', currentIntensity.toFixed(3));
      }

      animationFrameId = requestAnimationFrame(updateIntensity);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    
    animationFrameId = requestAnimationFrame(updateIntensity);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[320px] mx-auto" style={{ perspective: '1200px' }}>
      <motion.div
        animate={{
          y: [-12, 12, -12],
          rotateX: [2, -2, 2],
          rotateY: [-4, 4, -4],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative group w-full"
      >
        <div
          ref={panelRef}
          className="relative w-full aspect-[4/5] rounded-xl overflow-hidden glass-panel hologram-panel"
        >
          {/* Base Glass Blur */}
          <div className="absolute inset-0 backdrop-blur-[24px] bg-cyan-950/20 z-0 border border-white/5"></div>
          
          {/* The Holographic Image */}
          <div className="absolute inset-0 z-10 mix-blend-screen overflow-hidden hologram-image-container flex items-center justify-center">
            <img 
              src="/profile.png" 
              alt="Holographic Projection"
              className="w-full h-full object-cover filter grayscale"
            />
          </div>

          {/* Sweeping scanline */}
          <div className="absolute inset-0 z-20 pointer-events-none hologram-sweep mix-blend-screen"></div>

          {/* Static interference / tiny scanlines */}
          <div className="absolute inset-0 z-20 pointer-events-none hologram-scanlines mix-blend-screen"></div>

          {/* Edge Glow */}
          <div className="absolute inset-0 z-30 pointer-events-none rounded-xl border-2 hologram-edge animate-pulse-glow"></div>

          {/* Hover Status */}
          <div className="absolute inset-0 z-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
             <div className="bg-black/80 border border-cyan-400/50 backdrop-blur-md px-4 py-2 rounded-sm overflow-hidden relative shadow-[0_0_15px_rgba(0,242,255,0.4)]">
               <div className="absolute inset-0 bg-cyan-400/20 hologram-scanlines opacity-50"></div>
               <span className="text-cyan-400 text-[11px] font-black tracking-[0.3em] font-mono relative z-10">
                 SYSTEM_SCAN_OK
               </span>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Typography Base */}
      <motion.div 
        ref={textRef}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="mt-10 text-[10px] font-black tracking-[0.6em] text-cyan-800 uppercase hologram-text whitespace-nowrap"
      >
        GANGUL MISSAKA // CREATOR
      </motion.div>
    </div>
  );
}
