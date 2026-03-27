import './blocks.css';

/**
 * 全局視差圖片元件
 * 視差方向由 body[data-scroll] attribute 驅動（CSS），不需 React re-render。
 * 必須包在 overflow:hidden 的容器內才有裁切效果。
 */
export default function ParallaxImg({ src, alt = '', className = '' }) {
  const cls = ['block-parallax-img', className].filter(Boolean).join(' ');
  // 不加 loading="lazy"：ProjectDetail 的 preloader 已將所有圖片預載到 HTTP cache，
  // lazy 只會讓 <img> 延遲「激活」，造成捲到時才出現的空白幀，反而更慢。
  return <img src={src} alt={alt} className={cls} />;
}
