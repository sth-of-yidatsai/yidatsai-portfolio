import { useEffect, useRef, useState } from "react";
import "./GlobalScrollbar.css";

const MIN_THUMB_HEIGHT_PX = 32;

function getCSSVar(name, fallback) {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

export default function GlobalScrollbar() {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const stateRef = useRef({
    isDragging: false,
    dragStartY: 0,
    dragStartThumbTop: 0,
  });

  const [active, setActive] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(MIN_THUMB_HEIGHT_PX);
  const [thumbTop, setThumbTop] = useState(0);
  const colors = {
    track: getCSSVar("--gray-100", "#e0e0e0"),
    thumb: getCSSVar("--gray-800", "#1a1a1a"),
  };

  const updateThumbMetrics = () => {
    const docEl = document.documentElement;
    const scrollHeight = Math.max(
      docEl.scrollHeight,
      document.body.scrollHeight
    );
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
    const trackRect = trackEl
      ? trackEl.getBoundingClientRect()
      : { height: viewport };
    const trackHeight = trackRect.height;
    const vhRatio = viewport / scrollHeight;
    const h = Math.max(MIN_THUMB_HEIGHT_PX, Math.floor(trackHeight * vhRatio));
    setThumbHeight(h);
    const maxThumbTop = trackHeight - h;
    const scrollRatio =
      scrollHeight - viewport > 0 ? scrollTop / (scrollHeight - viewport) : 0;
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
    const newTop = Math.max(
      0,
      Math.min(
        trackRect.height - thumbHeight,
        stateRef.current.dragStartThumbTop + delta
      )
    );
    setThumbTop(newTop);
    const docEl = document.documentElement;
    const scrollHeight = Math.max(
      docEl.scrollHeight,
      document.body.scrollHeight
    );
    const viewport = window.innerHeight;
    const maxScrollTop = scrollHeight - viewport;
    const maxThumbTop = trackRect.height - thumbHeight;
    const ratio = maxThumbTop > 0 ? newTop / maxThumbTop : 0;
    const targetScrollTop = Math.max(
      0,
      Math.min(maxScrollTop, Math.round(maxScrollTop * ratio))
    );
    window.scrollTo({ top: targetScrollTop, behavior: "auto" });
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
    const nextTop = Math.max(
      0,
      Math.min(maxThumbTop, clickY - thumbHeight / 2)
    );
    const docEl = document.documentElement;
    const scrollHeight = Math.max(
      docEl.scrollHeight,
      document.body.scrollHeight
    );
    const viewport = window.innerHeight;
    const maxScrollTop = scrollHeight - viewport;
    const ratio = maxThumbTop > 0 ? nextTop / maxThumbTop : 0;
    const targetScrollTop = Math.max(
      0,
      Math.min(maxScrollTop, Math.round(maxScrollTop * ratio))
    );
    window.scrollTo({ top: targetScrollTop, behavior: "auto" });
  };

  useEffect(() => {
    updateThumbMetrics();
    let resizeRaf = 0;
    let scrollRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        updateThumbMetrics();
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        updateThumbMetrics();
      });
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(resizeRaf);
      cancelAnimationFrame(scrollRaf);
    };
  }, [thumbHeight]);

  return (
    <div
      ref={trackRef}
      className={`global-scrollbar${active ? " active" : ""}`}
      style={{ "--gs-track": colors.track, "--gs-thumb": colors.thumb }}
      onMouseDown={handleTrackClick}
    >
      <div
        ref={thumbRef}
        className="global-scrollbar-thumb"
        style={{
          height: `${thumbHeight}px`,
          transform: `translateY(${thumbTop}px)`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}
