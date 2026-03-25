'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────
const FRAME_COUNT = 120;
const RING_R      = 45;
const RING_CIRC   = 2 * Math.PI * RING_R;






// ─── Main Component ───────────────────────────────────────────────────────────
export default function ScrollSequence() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef    = useRef<HTMLImageElement[]>([]);
  const rafRef       = useRef<number>(0);
  const glowRef      = useRef<HTMLDivElement>(null);

  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoaded,    setIsLoaded]    = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  // Cursor follow
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches;
    if (isMobile) return; // Don't track cursor on mobile devices
    
    const move = (e: MouseEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.left = `${e.clientX}px`;
      glowRef.current.style.top  = `${e.clientY}px`;
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const t = setTimeout(() => setHeroVisible(true), 400);
    return () => clearTimeout(t);
  }, [isLoaded]);

  // ─── Scroll ─────────────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 22, restDelta: 0.0005 });

  const frameIndex  = useTransform(smooth, [0, 0.85], [0, FRAME_COUNT - 1], { clamp: true });
  const ctaOpacity  = useTransform(smooth, [0.82, 0.90], [0, 1]);
  const glowOpacity = useTransform(smooth, [0.82, 0.92], [0, 1]);
  const sectionFade = useTransform(smooth, [0.96, 1.0],  [1, 0]);

  // Glass box and hero text fade out as user starts scrolling
  const heroOpacity = useTransform(smooth, [0, 0.08], [1, 0]);

  // Cinematic mid-scroll phrases (no large hero overlay anymore)
  const PHRASES = [
    { text: 'CRAFTING THE FUTURE',             s: 0.08, e: 0.22 },
    { text: 'SOFTWARE ENGINEERING EXCELLENCE', s: 0.28, e: 0.46 },
    { text: 'AI & DATA DRIVEN ARCHITECTURE',   s: 0.52, e: 0.70 },
  ];

  // ─── Pre-load ────────────────────────────────────────────────────────────
  useEffect(() => {
    let loaded = 0;
    imagesRef.current = new Array(FRAME_COUNT);
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/sequence/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;

      const done = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded >= FRAME_COUNT) setIsLoaded(true);
      };
      img.onload = done;
      img.onerror = done;
      imagesRef.current[i - 1] = img;
    }
  }, []);

  // ─── Canvas draw (DPR-aware cover-fit) ────────────────────────────────────────
  const drawFrame = useCallback((rawIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const idx = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(rawIdx)));
    const img = imagesRef.current[idx];
    if (!img?.complete || !img.naturalWidth) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width: cw, height: ch } = canvas;
    // Draw in CSS pixels (canvas is scaled by dpr via resize handler)
    const cssW = cw / dpr;
    const cssH = ch / dpr;
    const scale = Math.max(cssW / img.naturalWidth, cssH / img.naturalHeight);
    const dx = (cssW - img.naturalWidth  * scale) / 2;
    const dy = (cssH - img.naturalHeight * scale) / 2;
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.drawImage(img, dx, dy, img.naturalWidth * scale, img.naturalHeight * scale);
  }, []);

  // ─── RAF loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    const loop = () => {
      drawFrame(frameIndex.get());
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isLoaded, drawFrame, frameIndex]);

  // ─── Resize + orientation change ─────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      if (!canvasRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasRef.current.width  = window.innerWidth  * dpr;
      canvasRef.current.height = window.innerHeight * dpr;
      canvasRef.current.style.width  = `${window.innerWidth}px`;
      canvasRef.current.style.height = `${window.innerHeight}px`;
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(frameIndex.get());
    };
    resize();
    window.addEventListener('resize',            resize, { passive: true });
    window.addEventListener('orientationchange', resize, { passive: true });
    return () => {
      window.removeEventListener('resize',            resize);
      window.removeEventListener('orientationchange', resize);
    };
  }, [drawFrame, frameIndex]);

  const loadPct    = Math.min(100, Math.round((loadedCount / FRAME_COUNT) * 100));
  const dashOffset = RING_CIRC - (loadPct / 100) * RING_CIRC;

  return (
    <div ref={containerRef} className="relative h-[820vh] w-full bg-[#050505]">
      <div ref={glowRef} className="cursor-glow" />

      <motion.div
        style={{ opacity: sectionFade }}
        className="sticky top-0 h-screen w-full overflow-hidden"
      >
        {/* ── Luxury Loading Screen ───────────────────────────────── */}
        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              key="loader"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]"
            >
              <div className="relative flex items-center justify-center w-32 h-32">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={RING_R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  <circle
                    cx="50" cy="50" r={RING_R}
                    fill="none"
                    stroke="rgba(0,242,255,0.9)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRC}
                    strokeDashoffset={dashOffset}
                    style={{
                      transition: 'stroke-dashoffset 0.4s cubic-bezier(0.4,0,0.2,1)',
                      filter: 'drop-shadow(0 0 6px rgba(0,242,255,0.8))',
                    }}
                  />
                </svg>
                <span className="font-mono text-2xl font-black text-white">
                  {loadPct}<span className="text-sm text-white/40">%</span>
                </span>
              </div>
              <p className="mt-10 text-[9px] font-black uppercase tracking-[0.6em] text-white/30 animate-pulse">
                INITIALIZING WORKSPACE...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 3D Canvas (zoom-out entrance) ───────────────────────── */}
        <motion.canvas
          ref={canvasRef}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.08 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="absolute inset-0 h-full w-full sequence-canvas"
        />

        {/* ── Permanent edge vignettes ─────────────────────────────── */}
        {/* Bottom vignette — darkens the bright laptop-glow zone where text lives */}
        <div
          className="absolute inset-x-0 bottom-0 h-[42%] pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.18) 65%, transparent 100%)',
          }}
        />
        {/* Subtle side vignettes — keeps edges cinematic */}
        <div
          className="absolute inset-y-0 left-0 w-32 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.35), transparent)' }}
        />
        <div
          className="absolute inset-y-0 right-0 w-32 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.35), transparent)' }}
        />


        {/* ── Bottom-center identity text ─────────────────────────── */}
        <AnimatePresence>
          {heroVisible && (
            <motion.div
              key="identity"
              style={{ opacity: heroOpacity }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
              className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-2.5 pointer-events-none z-30"
            >
              {/* Localised scrim: a small rounded pill of darkness purely behind the text stack */}
              <div
                className="absolute inset-x-0 -inset-y-6 mx-auto"
                style={{
                  width: 'clamp(280px, 44vw, 560px)',
                  background: 'radial-gradient(ellipse 100% 100% at 50% 60%, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.40) 50%, transparent 100%)',
                  filter: 'blur(12px)',
                  pointerEvents: 'none',
                }}
              />

              {/* NAME — larger, fully opaque, crisp dark backing shadow */}
              <h1
                className="relative font-black text-white uppercase tracking-[0.35em] text-base md:text-lg"
                style={{
                  textShadow:
                    '0 1px 4px rgba(0,0,0,0.95), 0 2px 12px rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.6)',
                }}
              >
                GANGUL MISSAKA
              </h1>

              {/* SUBTITLE — readable, not washed-out */}
              <p
                className="relative text-[10px] md:text-[11px] font-black uppercase tracking-[0.45em] text-white/80"
                style={{
                  textShadow: '0 1px 6px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7)',
                }}
              >
                SOFTWARE ENGINEER&nbsp;&nbsp;//&nbsp;&nbsp;ECU STUDENT
              </p>

              {/* Thin separator */}
              <div className="relative w-8 h-px bg-cyan-400/30 my-1" />

              {/* SCROLL TO EXPLORE */}
              <p
                className="relative text-[8px] font-black uppercase tracking-[0.65em] text-white/40"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
              >
                Scroll to Explore
              </p>
              <motion.div
                animate={{ scaleY: [1, 0.35, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-px h-8 origin-top"
                style={{
                  background: 'linear-gradient(to bottom, rgba(0,242,255,0.8), transparent)',
                  boxShadow: '0 0 6px rgba(0,242,255,0.5)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mid-scroll cinematic phrases ────────────────────────── */}
        {PHRASES.map((phrase, i) => {
          const mid = (phrase.s + phrase.e) / 2;
          const opacity = useTransform(smooth, [phrase.s, mid - 0.02, mid + 0.02, phrase.e], [0, 1, 1, 0]);
          const y       = useTransform(smooth, [phrase.s, phrase.e], ['10px', '-10px']);
          return (
            <motion.div
              key={i}
              style={{ opacity, y }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <h2
                className="font-black uppercase text-white text-center px-6 leading-none tracking-tighter
                           text-4xl md:text-6xl lg:text-7xl xl:text-8xl"
                style={{ textShadow: '0 0 80px rgba(0,0,0,0.95)' }}
              >
                {phrase.text}
              </h2>
            </motion.div>
          );
        })}

        {/* ── Pulsating glow halo at frame 120 ────────────────────── */}
        <motion.div
          style={{ opacity: glowOpacity }}
          className="absolute inset-0 pointer-events-none"
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(0,242,255,0.12) 0%, rgba(0,100,180,0.06) 40%, transparent 70%)',
              animation: 'pulseGlow 2.5s ease-in-out infinite',
            }}
          />
        </motion.div>

        {/* ── "SCROLL DOWN FOR MORE" CTA at frame 120 ─────────────── */}
        <motion.div
          style={{ opacity: ctaOpacity }}
          className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 pointer-events-none z-20"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.7em] text-white/60">
            Scroll Down For More
          </p>
          <motion.svg
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            className="w-6 h-6 text-cyan-400"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0,242,255,0.8))' }}
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </motion.svg>
        </motion.div>

      </motion.div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1.0; }
        }
      `}</style>
    </div>
  );
}
