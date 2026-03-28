import { memo } from 'react';
import './ImgSet2aBlock.css';

function ImgSet2aBlock({ items = [], bg, color }) {
  const [a, b] = items;
  return (
    <section
      className="block block--imgset2a"
      style={{ background: bg, color }}
    >
      <div className="block--imgset2a__grid">
        {a && (
          <div className="block--imgset2a__item block--imgset2a__item--a">
            <div className="block--imgset2a__img-wrap">
              <img src={a.src} alt={a.title ?? ''} loading="eager" decoding="async" />
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
            <div className="block--imgset2a__img-wrap">
              <img src={b.src} alt={b.title ?? ''} loading="eager" decoding="async" />
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
