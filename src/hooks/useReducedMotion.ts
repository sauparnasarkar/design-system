import React from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Live-subscribed `prefers-reduced-motion` check — re-renders if the user toggles the OS setting
 * mid-session rather than only reflecting its value at mount. Modeled on `SidebarNav`'s own
 * `useIsMobile` hook, same subscribe/cleanup shape against a different media query. `SidebarNav`
 * and `useCountUp`/`useYearAnimation` (in the consuming app) all call this same shared hook
 * directly during render -- none of them keep a separate one-shot `matchMedia` check of their
 * own.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches,
  );
  React.useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
