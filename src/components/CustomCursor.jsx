import { useState, useEffect, useRef } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef(0);
  const pendingPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // 由全域樣式決定是否隱藏預設游標，避免與頁面局部邏輯衝突

    const updatePosition = (e) => {
      // 使用 rAF 合併多次觸發，降低 re-render 次數
      pendingPosRef.current = { x: e.clientX, y: e.clientY };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          setPosition(pendingPosRef.current);
        });
      }
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseEnter = (e) => {
      // 檢查是否懸停在可點擊元素上
      if (e.target.tagName === 'A' || 
          e.target.tagName === 'BUTTON' || 
          e.target.classList.contains('clickable') ||
          e.target.closest('a') ||
          e.target.closest('button') ||
          e.target.closest('.clickable')) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = (e) => {
      // 檢查是否離開可點擊元素
      if (!e.target.closest('a') && 
          !e.target.closest('button') && 
          !e.target.closest('.clickable')) {
        setIsHovering(false);
      }
    };

    // 添加事件監聽器
    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    // 清理函數
    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* 主要游標 */}
      <div
        className={`custom-cursor ${isClicking ? 'clicking' : ''} ${isHovering ? 'hovering' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      
      {/* 游標跟隨點 */}
      <div
        className={`custom-cursor-dot ${isClicking ? 'clicking' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  );
};

export default CustomCursor;