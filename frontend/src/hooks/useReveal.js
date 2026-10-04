import { useEffect, useRef } from 'react';

/**
 * Observes descendants carrying [data-reveal] and adds .is-visible once
 * each scrolls into view. Presentational only: without IntersectionObserver
 * everything is revealed immediately so content is never hidden.
 */
export function useReveal(deps = []) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll('[data-reveal]:not(.is-visible)');
    if (targets.length === 0) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // Deps are provided by the caller (e.g. after async data loads).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return rootRef;
}
