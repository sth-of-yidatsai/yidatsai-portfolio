export const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
export const isTablet = !isMobile && window.innerWidth < 1024;
export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
