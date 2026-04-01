import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import { useParallaxRef } from '../../hooks/useParallaxRef';
import './ImgSet2aBlock.css';

function ImgSet2aBlock({ items = [], bg, color, reverse }) {
  const [a, b] = items;
  const [frameA, imgA] = useParallaxRef(12);
  const [frameB, imgB] = useParallaxRef(12);
  return (
    <section
      className={`block block--imgset2a${reverse ? ' block--imgset2a--reverse' : ''}`}
      style={{ background: bg, color }}
    >
      <div className={`block--imgset2a__grid${reverse ? ' block--imgset2a__grid--reverse' : ''}`}>
        {a && (
          <div className="block--imgset2a__item block--imgset2a__item--a">
            <div ref={frameA} className="block--imgset2a__img-wrap">
              <img ref={imgA} src={a.src} srcSet={buildSrcSet(a.src)} sizes="(max-width: 768px) 100vw, 50vw" alt={a.title ?? ''} loading="eager" decoding="async" />
            </div>
            {(a.title || a.subtitle) && (
              <div className="block--imgset2a__caption">
                {a.title    && <p className="block--imgset2a__title">{a.title}</p>}
                {a.subtitle && <p className="block--imgset2a__subtitle">{a.subtitle}</p>}
              </div>
            )}
          </div>
        )}
        {b && (
          <div className="block--imgset2a__item block--imgset2a__item--b">
            <div ref={frameB} className="block--imgset2a__img-wrap">
              <img ref={imgB} src={b.src} srcSet={buildSrcSet(b.src)} sizes="(max-width: 768px) 100vw, 50vw" alt={b.title ?? ''} loading="eager" decoding="async" />
            </div>
            {(b.title || b.subtitle) && (
              <div className="block--imgset2a__caption">
                {b.title    && <p className="block--imgset2a__title">{b.title}</p>}
                {b.subtitle && <p className="block--imgset2a__subtitle">{b.subtitle}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(ImgSet2aBlock);
