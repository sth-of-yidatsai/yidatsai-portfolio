import { useEffect, useRef } from 'react';

export default function CursorDistort() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Touch-only devices keep the native cursor
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mx = window.innerWidth  / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let rafId;
    let lastTime = performance.now();
    let isDown = false;

    const CLICKABLE = [
      'a[href]', 'button', 'input', 'select', 'textarea',
      '[role="button"]', '[role="link"]', '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      // Live hover detection — works for dynamically added elements
      const el       = document.elementFromPoint(mx, my);
      const hovering = !!el?.closest(CLICKABLE);
      setRingSize(isDown ? 20 : hovering ? 64 : 40);
    };

    const onDown = () => { isDown = true;  setRingSize(20); };
    const onUp   = () => { isDown = false; setRingSize(40); };

    function setRingSize(size) {
      ring.style.width      = size + 'px';
      ring.style.height     = size + 'px';
      ring.style.marginLeft = (-size / 2) + 'px';
      ring.style.marginTop  = (-size / 2) + 'px';
    }

    const tick = (now) => {
      // Frame-rate-independent lerp (same pattern as CustomCursor.jsx)
      const dt    = Math.min((now - lastTime) / 1000, 0.05);
      lastTime    = now;
      const alpha = 1 - Math.exp(-14 * dt);  // ≈ 0.21 at 60 fps

      dot.style.transform  = `translate(${mx}px, ${my}px)`;

      rx += (mx - rx) * alpha;
      ry += (my - ry) * alpha;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup',   onUp);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup',   onUp);
    };
  }, []);

  return (
    <>
      <div className="nf2-cursor-dot"  ref={dotRef}  aria-hidden={true} />
      <div className="nf2-cursor-ring" ref={ringRef} aria-hidden={true} />
    </>
  );
}
