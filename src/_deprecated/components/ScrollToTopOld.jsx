import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import iconArrowUp from '../assets/icons/keyboard_control_key_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';
import './ScrollToTop.css';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // 路由切換自動回頂
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname]);

  const evaluateVisibility = useCallback(() => {
    if (typeof window === 'undefined') return;
    const body = document.body;
    const html = document.documentElement;
    // 在全頁覆蓋或禁止滾動的頁面（如 Projects）時隱藏
    if (body.classList.contains('menu-open') ||
        body.classList.contains('projects-no-scroll') ||
        html.classList.contains('projects-no-scroll-html')) {
      setIsVisible(false);
      return;
    }
    const y = window.scrollY || html.scrollTop || 0;
    setIsVisible(y > 200);
  }, []);

  useEffect(() => {
    evaluateVisibility();
    window.addEventListener('scroll', evaluateVisibility, { passive: true });
    window.addEventListener('resize', evaluateVisibility);
    window.addEventListener('menu-open-change', evaluateVisibility);
    return () => {
      window.removeEventListener('scroll', evaluateVisibility);
      window.removeEventListener('resize', evaluateVisibility);
      window.removeEventListener('menu-open-change', evaluateVisibility);
    };
  }, [evaluateVisibility]);

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      className={`scroll-to-top${isVisible ? '' : ' hidden'}`}
      aria-label="回到頁面頂部"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <img src={iconArrowUp} alt="向上箭頭" />
    </button>
  );
}


