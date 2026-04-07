import { useRef, useEffect } from 'react';
import store from './useGlitchStore';

// Chromatic-aberration glitch heading.
// Jitter amplitude scales with store.phase:
//   phase=0 (broken) → up to ±30 px offset
//   phase=1 (clean)  → ±2 px offset
export default function GlitchText({ children, tag: Tag = 'div', className = '' }) {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const tick = () => {
      // Intensity: 1 when broken, near 0 when clean
      const intensity = Math.max(0.06, 1 - store.phase);
      const maxOff    = 2 + intensity * 28; // 2 px → 30 px

      el.style.setProperty('--gx1', `${(Math.random() - 0.5) * maxOff}px`);
      el.style.setProperty('--gy1', `${(Math.random() - 0.5) * maxOff * 0.25}px`);
      el.style.setProperty('--gx2', `${(Math.random() - 0.5) * maxOff}px`);
      el.style.setProperty('--gy2', `${(Math.random() - 0.5) * maxOff * 0.25}px`);
    };

    tick();
    const id = setInterval(tick, 110);
    return () => clearInterval(id);
  }, []);

  return (
    <Tag
      ref={elRef}
      className={`nf-glitch-text ${className}`}
      data-text={children}
      style={{ '--gx1': '2px', '--gy1': '0px', '--gx2': '-2px', '--gy2': '0px' }}
    >
      {children}
    </Tag>
  );
}
