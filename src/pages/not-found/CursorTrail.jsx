import { useRef, useEffect } from 'react';

const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

const GRAVITY    = 0.18;   // px/frame²
const FLOAT_TIME = 0.6;    // seconds to hover before gravity activates
const SPAWN_RATE = 2;      // spawn one particle every N pointermove events
const MAX_P      = 120;    // particle pool cap

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

    // Particle pool — reuse objects to avoid GC pressure
    const pool = [];
    let moveCount = 0;
    let mx = 0, my = 0;

    const spawn = (x, y) => {
      if (pool.length >= MAX_P) return;
      pool.push({
        x,
        y,
        // Near-zero initial velocity — tiny horizontal wobble only
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0,
        r:    1.2 + Math.random() * 2.2,
        life: 1.0,
        decay: 0.016 + Math.random() * 0.012,
        age:  0,
      });
    };

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      moveCount++;
      if (moveCount % SPAWN_RATE === 0) spawn(mx, my);
    };
    window.addEventListener('pointermove', onMove);

    let rafId;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = pool.length - 1; i >= 0; i--) {
        const p = pool[i];

        // Physics — float in place, then gravity
        p.age += 1 / 60;
        if (p.age > FLOAT_TIME) {
          p.vy += GRAVITY;
          p.x  += p.vx;
          p.y  += p.vy;
        }
        // During float: stay put (vx tiny wobble only, no y movement)
        p.life -= p.decay;

        if (p.life <= 0) {
          pool.splice(i, 1);
          continue;
        }

        // ease-out fade: bright at birth, quick fade in last 30%
        const alpha = p.life < 0.3 ? (p.life / 0.3) * 0.50 : 0.50;
        const r     = p.r * (0.5 + 0.5 * p.life); // shrink as it dies

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
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
