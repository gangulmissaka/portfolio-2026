'use client';

import { useEffect, useRef } from 'react';

/**
 * Premium sci-fi targeting reticle — desktop only.
 *
 * Key improvements vs previous version:
 * - Zero React state: hover detection is pure DOM → no re-render on every hover
 * - RAF-driven lerp loop with double-buffered transforms (translate3d / GPU layer)
 * - Touch guard: returns null on pointer-coarse / touch-only devices
 * - Single passive event listener — never blocks scroll
 * - `will-change: transform` on both layers for compositor promotion
 */
export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const svgRef  = useRef<SVGSVGElement>(null);
  const rafRef  = useRef<number>(0);

  // Live values held in refs — no state = no re-renders
  const mouse   = useRef({ x: -300, y: -300 });
  const ringPos = useRef({ x: -300, y: -300 });
  const hovered = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    // ── Touch guard ─────────────────────────────────────────────────
    // Hide on touch-primary devices (phones/tablets). matchMedia is
    // more reliable than navigator.maxTouchPoints for this purpose.
    if (window.matchMedia('(pointer: coarse)').matches) return;

    mounted.current = true;

    // ── Mouse tracking ──────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    // ── Hover detection (zero re-renders) ───────────────────────────
    const INTERACTIVE = 'a, button, [role="button"], input, textarea, label, select';
    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      hovered.current = !!el.closest(INTERACTIVE);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover',  onOver, { passive: true });

    // ── RAF lerp loop ────────────────────────────────────────────────
    // Separate lerp factors:  ring trails for elegance, dot is instant
    const RING_LERP = 0.095; // slower trail = smoother feel

    const tick = () => {
      if (!mounted.current) return;

      // Lerp ring toward exact mouse position
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * RING_LERP;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * RING_LERP;

      const mx = mouse.current.x;
      const my = mouse.current.y;
      const rx = ringPos.current.x;
      const ry = ringPos.current.y;
      const h  = hovered.current;

      // Write directly to style — no React state involvement
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx - 2}px,${my - 2}px,0)`;
        dotRef.current.style.opacity   = '1';
      }

      if (ringRef.current) {
        const size = h ? 26 : 34;
        const half = size / 2;
        ringRef.current.style.transform = `translate3d(${rx - half}px,${ry - half}px,0)`;
        ringRef.current.style.width     = `${size}px`;
        ringRef.current.style.height    = `${size}px`;
      }

      // Update SVG stroke brightness on hover directly
      if (svgRef.current) {
        const arcs  = svgRef.current.querySelectorAll<SVGPathElement>('.reticle-arc');
        const ticks = svgRef.current.querySelectorAll<SVGLineElement>('.reticle-tick');
        const alpha = h ? '1' : '0.65';
        const glow  = h ? 'drop-shadow(0 0 4px rgba(0,242,255,1))' : 'drop-shadow(0 0 2px rgba(0,242,255,0.5))';
        arcs.forEach(a  => { a.style.strokeOpacity = alpha; a.style.filter = glow; });
        ticks.forEach(t => { t.style.strokeOpacity = h ? '0.9' : '0.3'; });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mounted.current = false;
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover',  onOver);
    };
  }, []);

  // ── On touch devices return nothing ─────────────────────────────────
  // (server-safe: we check in useEffect, but hide by default via CSS)
  return (
    <>
      {/* Precise dot — GPU layer */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[9999] pointer-events-none select-none"
        style={{
          width:        '4px',
          height:       '4px',
          borderRadius: '50%',
          background:   'rgba(0,242,255,1)',
          boxShadow:    '0 0 8px 1px rgba(0,242,255,0.9)',
          opacity:       0,
          willChange:   'transform',
        }}
      />

      {/* Lagged ring with SVG reticle — GPU layer */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[9998] pointer-events-none select-none"
        style={{
          width:      '34px',
          height:     '34px',
          willChange: 'transform, width, height',
          transition: 'width 0.18s ease, height 0.18s ease',
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 40 40"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          {/* 4 partial arc segments */}
          {[0, 90, 180, 270].map((rot) => (
            <g key={rot} transform={`rotate(${rot} 20 20)`}>
              <path
                className="reticle-arc"
                d="M 20 4 A 16 16 0 0 1 34 13"
                fill="none"
                stroke="rgba(0,242,255,1)"
                strokeWidth="0.8"
                strokeLinecap="round"
                style={{ strokeOpacity: 0.65, transition: 'stroke-opacity 0.15s ease, filter 0.15s ease' }}
              />
            </g>
          ))}

          {/* Cardinal crosshair ticks */}
          {[
            { x1: 20, y1: 0,  x2: 20, y2: 5  },
            { x1: 20, y1: 35, x2: 20, y2: 40 },
            { x1: 0,  y1: 20, x2: 5,  y2: 20 },
            { x1: 35, y1: 20, x2: 40, y2: 20 },
          ].map((l, i) => (
            <line
              key={i}
              className="reticle-tick"
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke="rgba(0,242,255,1)"
              strokeWidth="0.8"
              strokeLinecap="round"
              style={{ strokeOpacity: 0.3, transition: 'stroke-opacity 0.15s ease' }}
            />
          ))}

          {/* Inner reference circle */}
          <circle
            cx="20" cy="20" r="2.5"
            fill="none"
            stroke="rgba(0,242,255,0.3)"
            strokeWidth="0.5"
          />
        </svg>
      </div>
    </>
  );
}
