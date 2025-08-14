import { useEffect, useRef, useState } from 'react';
import './GlobalScrollbar.css';

const MIN_THUMB_HEIGHT_PX = 32;

function parseRGBA(color) {
  if (!color) return { r: 255, g: 255, b: 255, a: 1 };
  const ctx = color.trim().toLowerCase();
  if (ctx.startsWith('#')) {
    const hex = ctx.slice(1);
    const to255 = (h) => parseInt(h.length === 1 ? h + h : h, 16);
    if (hex.length === 3) {
      return { r: to255(hex[0]), g: to255(hex[1]), b: to255(hex[2]), a: 1 };
    }
    if (hex.length === 6) {
      return { r: to255(hex.slice(0, 2)), g: to255(hex.slice(2, 4)), b: to255(hex.slice(4, 6)), a: 1 };
    }
  }
  const m = ctx.match(/rgba?\(([^)]+)\)/);
  if (!m) return { r: 255, g: 255, b: 255, a: 1 };
  const parts = m[1].split(',').map((v) => v.trim());
  const r = parseFloat(parts[0]);
  const g = parseFloat(parts[1]);
  const b = parseFloat(parts[2]);
  const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
  return { r, g, b, a: Number.isNaN(a) ? 1 : a };
}

function isDarkColor(color) {
  const { r, g, b, a } = parseRGBA(color);
  if (a === 0) return false;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.5;
}

function getCSSVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export default function GlobalScrollbar() {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const stateRef = useRef({ isDragging: false, dragStartY: 0, dragStartThumbTop: 0 });

  const [active, setActive] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(MIN_THUMB_HEIGHT_PX);
  const [thumbTop, setThumbTop] = useState(0);
  const [colors, setColors] = useState({ track: 'var(--color-primary)', thumb: 'var(--color-secondary)' });

  const computeAndSetColors = () => {
    const trackEl = trackRef.current;
    if (!trackEl) return;
    const rect = trackEl.getBoundingClientRect();
    const cx = Math.min(window.innerWidth - 2, Math.max(0, rect.left + rect.width / 2));
    const cy = Math.min(window.innerHeight - 2, Math.max(0, rect.top + rect.height / 2));
    const prev = trackEl.style.pointerEvents;
    trackEl.style.pointerEvents = 'none';
    let el = document.elementFromPoint(cx, cy);
    trackEl.style.pointerEvents = prev || '';
    let bg = '';
    while (el && el !== document.documentElement && el !== document.body) {
      const cs = getComputedStyle(el);
      if (cs && cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') {
        bg = cs.backgroundColor;
        break;
      }
      el = el.parentElement;
    }
    if (!bg) {
      bg = getComputedStyle(document.body).backgroundColor || 'rgb(255,255,255)';
    }
    const darkUnderlay = isDarkColor(bg);
    const colorPrimary = getCSSVar('--color-primary', '#2d2d2d');
    const colorSecondary = getCSSVar('--color-secondary', '#c6c3be');

    if (darkUnderlay) {
      // 深色底：交換顏色（track 次色、thumb 主色）    
      setColors({ track: colorPrimary, thumb: colorSecondary });
    } else {
      // 淺色底：track 主色、thumb 次色
      setColors({ track: colorSecondary, thumb: colorPrimary });
    }
  };

  const updateThumbMetrics = () => {
    const docEl = document.documentElement;
    const scrollHeight = Math.max(docEl.scrollHeight, document.body.scrollHeight);
    const viewport = window.innerHeight;
    const scrollTop = window.scrollY || docEl.scrollTop || 0;
    const scrollable = scrollHeight > viewport + 1;
    setActive(scrollable);
    if (!scrollable) {
      setThumbHeight(MIN_THUMB_HEIGHT_PX);
      setThumbTop(0);
      return;
    }
    const trackEl = trackRef.current;
    const trackRect = trackEl ? trackEl.getBoundingClientRect() : { height: viewport };
    const trackHeight = trackRect.height;
    const vhRatio = viewport / scrollHeight;
    const h = Math.max(MIN_THUMB_HEIGHT_PX, Math.floor(trackHeight * vhRatio));
    setThumbHeight(h);
    const maxThumbTop = trackHeight - h;
    const scrollRatio = (scrollHeight - viewport) > 0 ? scrollTop / (scrollHeight - viewport) : 0;
    const t = Math.max(0, Math.min(maxThumbTop, scrollRatio * maxThumbTop));
    setThumbTop(t);
  };

  const handlePointerDown = (e) => {
    const thumbEl = thumbRef.current;
    if (!thumbEl) return;
    stateRef.current.isDragging = true;
    stateRef.current.dragStartY = e.clientY;
    stateRef.current.dragStartThumbTop = thumbEl.offsetTop;
    thumbEl.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove = (e) => {
    if (!stateRef.current.isDragging) return;
    const trackEl = trackRef.current;
    if (!trackEl) return;
    const trackRect = trackEl.getBoundingClientRect();
    const delta = e.clientY - stateRef.current.dragStartY;
    const newTop = Math.max(0, Math.min(trackRect.height - thumbHeight, stateRef.current.dragStartThumbTop + delta));
    setThumbTop(newTop);
    const docEl = document.documentElement;
    const scrollHeight = Math.max(docEl.scrollHeight, document.body.scrollHeight);
    const viewport = window.innerHeight;
    const maxScrollTop = scrollHeight - viewport;
    const maxThumbTop = trackRect.height - thumbHeight;
    const ratio = maxThumbTop > 0 ? newTop / maxThumbTop : 0;
    const targetScrollTop = Math.max(0, Math.min(maxScrollTop, Math.round(maxScrollTop * ratio)));
    window.scrollTo({ top: targetScrollTop, behavior: 'auto' });
    e.preventDefault();
  };

  const handlePointerUp = (e) => {
    if (!stateRef.current.isDragging) return;
    stateRef.current.isDragging = false;
    const thumbEl = thumbRef.current;
    if (thumbEl) thumbEl.releasePointerCapture?.(e.pointerId);
  };

  const handleTrackClick = (e) => {
    if (e.target === thumbRef.current) return;
    const trackEl = trackRef.current;
    if (!trackEl) return;
    const rect = trackEl.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const maxThumbTop = rect.height - thumbHeight;
    const nextTop = Math.max(0, Math.min(maxThumbTop, clickY - thumbHeight / 2));
    const docEl = document.documentElement;
    const scrollHeight = Math.max(docEl.scrollHeight, document.body.scrollHeight);
    const viewport = window.innerHeight;
    const maxScrollTop = scrollHeight - viewport;
    const ratio = maxThumbTop > 0 ? nextTop / maxThumbTop : 0;
    const targetScrollTop = Math.max(0, Math.min(maxScrollTop, Math.round(maxScrollTop * ratio)));
    window.scrollTo({ top: targetScrollTop, behavior: 'auto' });
  };

  useEffect(() => {
    updateThumbMetrics();
    computeAndSetColors();
    let resizeRaf = 0;
    let scrollRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        updateThumbMetrics();
        computeAndSetColors();
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        updateThumbMetrics();
        computeAndSetColors();
      });
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(resizeRaf);
      cancelAnimationFrame(scrollRaf);
    };
  }, [thumbHeight]);

  return (
    <div
      ref={trackRef}
      className={`global-scrollbar${active ? ' active' : ''}`}
      style={{ '--gs-track': colors.track, '--gs-thumb': colors.thumb }}
      onMouseDown={handleTrackClick}
    >
      <div
        ref={thumbRef}
        className="global-scrollbar-thumb"
        style={{ height: `${thumbHeight}px`, transform: `translateY(${thumbTop}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}


