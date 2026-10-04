import { useEffect, useRef, useState } from 'react';

// One INKA editorial mark: solid pink blade + offset outline ghost.
// Story/image targets enlarge the mark and wake a tiny accent dot.
// Links and buttons tighten it. No text, no circles-as-cursor.
const STORY_SELECTOR = [
  'a[href^="/stories/"]',
  '.story-details-cover-wrapper',
  '.story-card-image-wrapper',
  '.featured-story-image-wrapper',
  '.secondary-story-image-wrapper',
  '.visual-story-image-wrapper',
  '.my-story-thumbnail-wrapper'
].join(',');

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const INKA_MARK_PATH =
  'M4 2 L20 10.5 L12.5 11.2 L14.8 19.6 L10.9 20.6 L8.6 12.2 L4.4 16 Z';

function Cursor() {
  const cursorRef = useRef(null);
  const ghostRef = useRef(null);
  const [enabled, setEnabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia !== 'undefined' &&
      window.matchMedia(FINE_POINTER_QUERY).matches
  );
  const [calm, setCalm] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia !== 'undefined' &&
      window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
  const [state, setState] = useState('default');
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);
  const posRef = useRef({ x: -100, y: -100 });
  const ghostPosRef = useRef({ x: -100, y: -100 });
  const baseRef = useRef({ x: 3, y: 3 });
  const rafRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return undefined;
    }
    const fine = window.matchMedia(FINE_POINTER_QUERY);
    const calmQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    const onFineChange = (event) => setEnabled(event.matches);
    const onCalmChange = (event) => setCalm(event.matches);
    if (typeof fine.addEventListener === 'function') {
      fine.addEventListener('change', onFineChange);
      calmQuery.addEventListener('change', onCalmChange);
    }
    return () => {
      if (typeof fine.removeEventListener === 'function') {
        fine.removeEventListener('change', onFineChange);
        calmQuery.removeEventListener('change', onCalmChange);
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    document.body.classList.add('inka-cursor-on');

    const render = () => {
      const node = cursorRef.current;
      if (node) {
        node.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }
      const ghost = ghostRef.current;
      if (ghost) {
        // Middle-ground follow: brisk lerp toward cursor + base offset,
        // with separation hard-capped so fast flicks stay editorial.
        // Settles back to the base offset within a few frames of stopping.
        const k = calm ? 1 : 0.4;
        const maxGap = 38;
        const tx = posRef.current.x + baseRef.current.x;
        const ty = posRef.current.y + baseRef.current.y;
        let gx = ghostPosRef.current.x + (tx - ghostPosRef.current.x) * k;
        let gy = ghostPosRef.current.y + (ty - ghostPosRef.current.y) * k;
        const dx = gx - tx;
        const dy = gy - ty;
        const dist = Math.hypot(dx, dy);
        if (dist > maxGap) {
          gx = tx + (dx / dist) * maxGap;
          gy = ty + (dy / dist) * maxGap;
        }
        ghostPosRef.current = { x: gx, y: gy };
        ghost.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    const onMove = (event) => {
      posRef.current = { x: event.clientX, y: event.clientY };
      setVisible(true);
      const target = event.target instanceof Element ? event.target : null;
      const storyTarget = target ? target.closest(STORY_SELECTOR) : null;
      const linkTarget = target ? target.closest('a, button') : null;
      const next = storyTarget ? 'story' : linkTarget ? 'link' : 'default';
      baseRef.current = next === 'story' ? { x: 5, y: 5 } : { x: 3, y: 3 };
      setState(next);
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    return () => {
      document.body.classList.remove('inka-cursor-on');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, calm]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className={`inka-cursor inka-cursor-${state}${pressed ? ' is-pressed' : ''}${visible ? ' is-visible' : ''}`}
        aria-hidden="true"
      >
        <svg className="inka-cursor-mark" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path d={INKA_MARK_PATH} fill="var(--color-bright-pink)" strokeLinejoin="round" />
        </svg>
        <span className="inka-cursor-accent" aria-hidden="true" />
      </div>
      {!calm && (
        <div ref={ghostRef} className="inka-cursor-ghost" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d={INKA_MARK_PATH}
              fill="none"
              stroke="var(--color-dark-text)"
              strokeWidth="1.1"
              strokeLinejoin="round"
              opacity="0.85"
            />
          </svg>
        </div>
      )}
    </>
  );
}

export default Cursor;
