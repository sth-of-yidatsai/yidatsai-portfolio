import './blocks.css';

/**
 * 全局視差圖片元件
 * 視差方向由 body[data-scroll] attribute 驅動（CSS），不需 React re-render。
 * 必須包在 overflow:hidden 的容器內才有裁切效果。
 */
export default function ParallaxImg({ src, alt = '', className = '' }) {
  const cls = ['block-parallax-img', className].filter(Boolean).join(' ');
  return <img src={src} alt={alt} className={cls} loading="lazy" decoding="async" />;
}
