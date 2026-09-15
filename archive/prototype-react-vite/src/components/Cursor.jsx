import { useEffect, useRef } from 'react';

const MQ = '(hover: hover) and (pointer: fine) and (min-width: 1024px)';
const TARGETS = 'a, button, [data-cursor]';

/**
 * Custom cursor, desktop only: a 12px circle that follows the pointer with a
 * slight lerp; over interactive targets it grows to 64px (mix-blend-mode:
 * difference) and shows the target's data-cursor label. Never the only
 * affordance. aria-hidden; the native cursor is hidden via html.cursor-on.
 */
export default function Cursor() {
  const ref = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const label = labelRef.current;
    if (!el || !label) return;
    const mq = window.matchMedia(MQ);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const html = document.documentElement;
    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let frame = 0;
    let active = false;

    const tick = () => {
      const k = reduced ? 1 : 0.28;
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      const settled = Math.abs(target.x - pos.x) < 0.2 && Math.abs(target.y - pos.y) < 0.2;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      el.classList.add('cursor--visible');
      schedule();
    };
    const onOver = (e) => {
      const t = e.target instanceof Element ? e.target.closest(TARGETS) : null;
      if (!t) return;
      const text = t.getAttribute('data-cursor') || '';
      label.textContent = text;
      el.classList.add('cursor--hover');
      el.classList.toggle('cursor--label', text.length > 0);
    };
    const onOut = (e) => {
      const from = e.target instanceof Element ? e.target.closest(TARGETS) : null;
      if (!from) return;
      const to = e.relatedTarget instanceof Element ? e.relatedTarget.closest(TARGETS) : null;
      if (to === from) return;
      el.classList.remove('cursor--hover', 'cursor--label');
    };
    const onLeave = () => el.classList.remove('cursor--visible');
    const onDown = () => el.classList.add('cursor--down');
    const onUp = () => el.classList.remove('cursor--down');

    const enable = () => {
      if (active) return;
      active = true;
      html.classList.add('cursor-on');
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerover', onOver);
      document.addEventListener('pointerout', onOut);
      html.addEventListener('pointerleave', onLeave);
      window.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
    };
    const disable = () => {
      if (!active) return;
      active = false;
      html.classList.remove('cursor-on');
      el.classList.remove('cursor--visible', 'cursor--hover', 'cursor--label', 'cursor--down');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      html.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const sync = () => (mq.matches ? enable() : disable());
    sync();
    mq.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      disable();
    };
  }, []);

  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span ref={labelRef} className="cursor__label" />
    </div>
  );
}
