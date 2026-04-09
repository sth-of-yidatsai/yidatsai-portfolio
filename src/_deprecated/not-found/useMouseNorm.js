import { useEffect, useRef } from 'react';

/**
 * Returns a ref whose `.current` is always { x, y, vx, vy }
 * x/y: normalized [-1, 1] from viewport centre
 * vx/vy: velocity (delta per frame)
 * No React re-renders — consumers read the ref directly.
 */
export default function useMouseNorm() {
  const mouse = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  useEffect(() => {
    let px = 0, py = 0;

    const onMove = (e) => {
      const nx =  (e.clientX / window.innerWidth)  * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      mouse.current.vx = nx - px;
      mouse.current.vy = ny - py;
      mouse.current.x  = nx;
      mouse.current.y  = ny;
      px = nx;
      py = ny;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return mouse;
}
