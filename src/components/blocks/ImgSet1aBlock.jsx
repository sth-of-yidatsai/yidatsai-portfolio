import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import './ImgSet1aBlock.css';

function ImgSet1aBlock({ src, title, subtitle }) {
  return (
    <section className="block block--imgset1a">
      <div className="block--imgset1a__img-wrap">
        <img src={src} srcSet={buildSrcSet(src)} sizes="(max-width: 768px) 100vw, 1200px" alt={title ?? ''} loading="lazy" decoding="async" />
      </div>
      {(title || subtitle) && (
        <div className="block--imgset1a__caption">
          {title    && <p className="block--imgset1a__title">{title}</p>}
          {subtitle && <p className="block--imgset1a__subtitle">{subtitle}</p>}
        </div>
      )}
    </section>
  );
}

export default memo(ImgSet1aBlock);
