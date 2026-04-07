import { useRef, useEffect } from 'react';

// Skip on touch devices — no cursor to trail
const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

const TRAIL_LENGTH = 42;

export default function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Ring buffer of recent mouse positions
    const points = Array.from({ length: TRAIL_LENGTH }, () => ({ x: 0, y: 0 }));
    let head = 0;

    const onMove = (e) => {
      points[head] = { x: e.clientX, y: e.clientY };
      head = (head + 1) % TRAIL_LENGTH;
    };
    window.addEventListener('pointermove', onMove);

    let rafId;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < TRAIL_LENGTH; i++) {
        // Walk the ring buffer from oldest to newest relative to `head`
        const idx   = (head + i) % TRAIL_LENGTH;
        const alpha = i / TRAIL_LENGTH;
        const r     = alpha * 3.5;

        ctx.beginPath();
        ctx.arc(points[idx].x, points[idx].y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.55})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className="nf-cursor-trail"
      aria-hidden="true"
    />
  );
}
