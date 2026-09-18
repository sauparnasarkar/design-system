import React from 'react';

/** Below this, SidebarNav's rail becomes an off-canvas drawer instead of narrowing in place. */
export const MOBILE_QUERY = '(max-width: 768px)';

/**
 * Live-subscribed viewport-width check, same subscribe/cleanup shape as `useReducedMotion`.
 * Extracted from `SidebarNav`'s own former local implementation so a consumer app can align its
 * own layout decisions (e.g. whether a header control has room to render at all) to the exact
 * breakpoint where `SidebarNav` itself switches to the mobile drawer, instead of hardcoding a
 * second copy of `768px` that could drift out of sync.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches,
  );
  React.useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}
