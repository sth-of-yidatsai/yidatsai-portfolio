import { useImageParallax } from '../../hooks/useImageParallax';
import './blocks.css';

/**
 * 全局視差圖片元件
 * 必須包在 overflow:hidden 的容器內才有裁切效果
 */
export default function ParallaxImg({ src, alt = '', className = '' }) {
  const { scrollClass } = useImageParallax();
  const cls = ['block-parallax-img', scrollClass, className].filter(Boolean).join(' ');
  return <img src={src} alt={alt} className={cls} />;
}
