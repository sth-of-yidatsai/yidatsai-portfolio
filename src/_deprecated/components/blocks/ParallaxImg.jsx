import { useRef, useEffect } from 'react';
import './blocks.css';

/**
 * 全局視差圖片元件
 * 視差方向由 body[data-scroll] attribute 驅動（CSS），不需 React re-render。
 * 必須包在 overflow:hidden 的容器內才有裁切效果。
 *
 * IntersectionObserver 管理 will-change：圖片進入視口前預先提升為 GPU layer，
 * 離開後釋放，避免 CSS transition 觸發時即時 promote → 掉幀。
 */
export default function ParallaxImg({ src, alt = '', className = '' }) {
  const imgRef = useRef(null);
  const cls = ['block-parallax-img', className].filter(Boolean).join(' ');

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        el.style.willChange = entry.isIntersecting ? 'transform' : 'auto';
      },
      // rootMargin 預留 300px，讓圖片進入視口前就提升為 GPU layer
      { rootMargin: '300px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 不加 loading="lazy"：ProjectDetail 的 preloader 已將所有圖片預載到 HTTP cache，
  // lazy 只會讓 <img> 延遲「激活」，造成捲到時才出現的空白幀，反而更慢。
  return <img ref={imgRef} src={src} alt={alt} className={cls} />;
}
