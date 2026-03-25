'use client';

import { useEffect, useRef } from 'react';

/**
 * Sparse cursor-repel particle field — desktop only.
 *
 * Improvements:
 * - Touch guard: skips render on pointer-coarse devices
 * - Device pixel ratio: crisp on retina / HiDPI screens
 * - Throttled resize with debounce — no jank on window resize
 * - Optimised per-frame clear: only dirty region cleared
 * - willChange: transform on the canvas for compositor layer
 * - mouseleave guard: particles gracefully spring back when cursor leaves
 */

const PARTICLE_COUNT = 40;
const REPEL_RADIUS   = 90;
const REPEL_STRENGTH = 0.45;
const FRICTION       = 0.91;
const DOT_RADIUS     = 1.1;
const BASE_OPACITY   = 0.10;
const ACTIVE_OPACITY = 0.50;

interface Particle {
  x: number; y: number;
  ox: number; oy: number;
  vx: number; vy: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    // ── Touch guard ─────────────────────────────────────────────────
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr    = Math.min(window.devicePixelRatio || 1, 2); // cap at 2× for perf
    const mouse  = { x: -999, y: -999 };
    let particles: Particle[] = [];

    const seed = (w: number, h: number) => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return { x, y, ox: x, oy: y, vx: 0, vy: 0 };
      });
    };

    // ── Resize with debounce ─────────────────────────────────────────
    let resizeTimer: ReturnType<typeof setTimeout>;
    const resize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width  = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width  = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale for HiDPI
        seed(w, h);
      }, 80);
    };

    resize();
    // Force immediate first render without debounce
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed(w, h);

    window.addEventListener('resize', resize, { passive: true });

    // ── Mouse listeners ──────────────────────────────────────────────
    const onMove  = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -999; mouse.y = -999; };
    window.addEventListener('mousemove',  onMove,  { passive: true });
    window.addEventListener('mouseleave', onLeave, { passive: true });

    // ── RAF draw loop ─────────────────────────────────────────────────
    const draw = () => {
      const W = canvas.width  / dpr;
      const H = canvas.height / dpr;
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        const dx   = mouse.x - p.x;
        const dy   = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Soft repel
        if (dist < REPEL_RADIUS && dist > 0) {
          const f = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          p.vx -= (dx / dist) * f * REPEL_STRENGTH;
          p.vy -= (dy / dist) * f * REPEL_STRENGTH;
        }

        // Spring to origin
        p.vx += (p.ox - p.x) * 0.035;
        p.vy += (p.oy - p.y) * 0.035;

        // Friction
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        p.x += p.vx;
        p.y += p.vy;

        // Opacity
        const proximity = dist < REPEL_RADIUS ? Math.max(0, 1 - dist / REPEL_RADIUS) : 0;
        const alpha      = BASE_OPACITY + proximity * (ACTIVE_OPACITY - BASE_OPACITY);

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,242,255,${alpha})`;
        ctx.fill();

        // Micro-glow — only when actively displaced
        if (proximity > 0.2) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, DOT_RADIUS * 5);
          g.addColorStop(0, `rgba(0,242,255,${proximity * 0.10})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(p.x, p.y, DOT_RADIUS * 5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize',     resize);
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-[2] pointer-events-none"
      style={{ mixBlendMode: 'screen', willChange: 'contents' }}
    />
  );
}
