import { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

const easeClamp = (value, min, max) => Math.max(min, Math.min(max, value));

const CustomCursor = () => {
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const cursorRef = useRef(null);
  const dotRef = useRef(null);

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const dotCurrentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const updateTarget = (e) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
    };

    const handlePointerDown = () => setIsClicking(true);
    const handlePointerUp = () => setIsClicking(false);

    const handlePointerOver = (e) => {
      if (
        e.target.tagName === 'A' ||
        e.target.tagName === 'BUTTON' ||
        e.target.classList?.contains('clickable') ||
        e.target.closest?.('a') ||
        e.target.closest?.('button') ||
        e.target.closest?.('.clickable')
      ) {
        setIsHovering(true);
      }
    };

    const handlePointerOut = (e) => {
      if (
        !e.target.closest?.('a') &&
        !e.target.closest?.('button') &&
        !e.target.closest?.('.clickable')
      ) {
        setIsHovering(false);
      }
    };

    const animate = () => {
      const cursorEl = cursorRef.current;
      const dotEl = dotRef.current;
      if (!cursorEl || !dotEl) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const target = targetRef.current;
      const current = currentRef.current;
      const dotCurrent = dotCurrentRef.current;

      // 慣性跟隨：主游標較慢、dot 較快
      const mainEase = 0.2;
      const dotEase = 0.35;

      current.x += (target.x - current.x) * mainEase;
      current.y += (target.y - current.y) * mainEase;
      dotCurrent.x += (target.x - dotCurrent.x) * dotEase;
      dotCurrent.y += (target.y - dotCurrent.y) * dotEase;

      // 保守限制數值，避免 NaN 或極端跳動
      const cx = easeClamp(current.x, -10000, 10000);
      const cy = easeClamp(current.y, -10000, 10000);
      const dx = easeClamp(dotCurrent.x, -10000, 10000);
      const dy = easeClamp(dotCurrent.y, -10000, 10000);

      cursorEl.style.setProperty('--cursor-x', `${cx}px`);
      cursorEl.style.setProperty('--cursor-y', `${cy}px`);
      dotEl.style.setProperty('--cursor-dot-x', `${dx}px`);
      dotEl.style.setProperty('--cursor-dot-y', `${dy}px`);

      rafRef.current = requestAnimationFrame(animate);
    };

    // 綁定事件（使用 pointer 事件以整合滑鼠/觸控筆）
    window.addEventListener('pointermove', updateTarget);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointerover', handlePointerOver);
    window.addEventListener('pointerout', handlePointerOut);

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('pointermove', updateTarget);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerout', handlePointerOut);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className={`custom-cursor ${isClicking ? 'clicking' : ''} ${isHovering ? 'hovering' : ''}`}
      >
        <div className="custom-cursor-shape" />
      </div>
      <div
        ref={dotRef}
        className={`custom-cursor-dot ${isClicking ? 'clicking' : ''}`}
      >
        <div className="custom-cursor-dot-shape" />
      </div>
    </>
  );
};

export default CustomCursor;