import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import { useParallaxRef } from '../../hooks/useParallaxRef';
import './ImgSet1bBlock.css';

function ImgSet1bBlock({ src, title, subtitle, reverse }) {
  const [frameRef, imgRef] = useParallaxRef(12);
  return (
    <section className={`block block--imgset1b${reverse ? ' block--imgset1b--reverse' : ''}`}>
      <div ref={frameRef} className="block--imgset1b__img-wrap">
        <img ref={imgRef} src={src} srcSet={buildSrcSet(src)} sizes="(max-width: 768px) 100vw, 1200px" alt={title ?? ''} loading="lazy" decoding="async" />
      </div>
      {(title || subtitle) && (
        <div className="block--imgset1b__caption">
          {title    && <p className="block--imgset1b__title">{title}</p>}
          {subtitle && <p className="block--imgset1b__subtitle">{subtitle}</p>}
        </div>
      )}
    </section>
  );
}

export default memo(ImgSet1bBlock);
