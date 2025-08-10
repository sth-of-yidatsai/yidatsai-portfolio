import { useState, useEffect } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // 隱藏預設游標
    document.body.style.cursor = 'none';

    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
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
      document.body.style.cursor = 'auto';
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
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