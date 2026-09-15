import { useEffect, useRef } from 'react';

const GAP = 28; // px between dots
const RADIUS = 140; // px of pointer influence
const SCALE_HOT = 2.2; // dot scale at the pointer
const BASE_R = 1; // px base dot radius

/** Parse "rgba(r, g, b, a)" / "rgb()" / "#rrggbb" from a computed CSS variable. */
function parseColor(str) {
  const s = (str || '').trim();
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [r, g, b, a];
  }
  const h = s.match(/^#([0-9a-f]{6})$/i);
  if (h) {
    const n = parseInt(h[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  return [128, 128, 128, 0.1];
}

/**
 * Decorative dotted grid behind the whole page (fixed canvas). On desktop the
 * dots within RADIUS of the pointer scale up and blend toward --grid-dot-hot;
 * on touch or reduced motion the grid is static. Colors follow the theme.
 */
export default function DotGrid() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reactive =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0, h = 0, dpr = 1;
    let base = [0, 0, 0, 0.1], hot = [0, 0, 0, 0.5];
    const target = { x: -9999, y: -9999 };
    const pos = { x: -9999, y: -9999 };
    let frame = 0;

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      base = parseColor(cs.getPropertyValue('--grid-dot'));
      hot = parseColor(cs.getPropertyValue('--grid-dot-hot'));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const offX = ((w % GAP) / 2) + GAP / 2;
      const offY = ((h % GAP) / 2) + GAP / 2;
      const [br, bg, bb, ba] = base;
      const [hr, hg, hb, ha] = hot;
      ctx.fillStyle = `rgba(${br},${bg},${bb},${ba})`;
      // Cold dots in one path, hot dots individually (few of them).
      ctx.beginPath();
      const hotDots = [];
      for (let y = offY; y < h; y += GAP) {
        for (let x = offX; x < w; x += GAP) {
          const dx = x - pos.x, dy = y - pos.y;
          const d = Math.hypot(dx, dy);
          if (d < RADIUS) {
            hotDots.push([x, y, d]);
          } else {
            ctx.moveTo(x + BASE_R, y);
            ctx.arc(x, y, BASE_R, 0, Math.PI * 2);
          }
        }
      }
      ctx.fill();
      for (const [x, y, d] of hotDots) {
        const t = 1 - d / RADIUS;
        const e = t * t * (3 - 2 * t); // smoothstep
        ctx.fillStyle = `rgba(${br + (hr - br) * e},${bg + (hg - bg) * e},${bb + (hb - bb) * e},${ba + (ha - ba) * e})`;
        ctx.beginPath();
        ctx.arc(x, y, BASE_R * (1 + (SCALE_HOT - 1) * e), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.22;
      pos.y += (target.y - pos.y) * 0.22;
      draw();
      const settled = Math.abs(target.x - pos.x) < 0.3 && Math.abs(target.y - pos.y) < 0.3;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      schedule();
    };
    const onLeave = () => {
      target.x = -9999;
      target.y = -9999;
      pos.x = -9999;
      pos.y = -9999;
      schedule();
    };

    readColors();
    resize();
    const mo = new MutationObserver(() => {
      readColors();
      draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.addEventListener('resize', resize);
    if (reactive) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
    }
    return () => {
      mo.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={ref} className="dotgrid" aria-hidden="true" />;
}
