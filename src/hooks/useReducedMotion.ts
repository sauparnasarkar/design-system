import React from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Live-subscribed `prefers-reduced-motion` check — unlike the one-shot `matchMedia(...).matches`
 * reads elsewhere in this codebase (`SidebarNav`'s own reduced-motion check, `useCountUp` in the
 * consuming app), this re-renders if the user toggles the OS setting mid-session rather than only
 * reflecting its value at mount. Modeled on `SidebarNav`'s own `useIsMobile` hook, same
 * subscribe/cleanup shape against a different media query.
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
