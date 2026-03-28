import { memo } from 'react';
import './ImgSet3aBlock.css';

function ImgSet3aBlock({ items = [], bg, color }) {
  return (
    <section
      className="block block--imgset3a"
      style={{ background: bg, color }}
    >
      <div className="block--imgset3a__grid">
        {items.map((item, i) => (
          <div key={i} className="block--imgset3a__item">
            <div className="block--imgset3a__img-wrap">
              <img
                src={item.src}
                alt={item.title ?? ''}
                loading="eager"
                decoding="async"
              />
            </div>
            {(item.title || item.subtitle) && (
              <div className="block--imgset3a__caption">
                {item.title    && <p className="block--imgset3a__title">{item.title}</p>}
                {item.subtitle && <p className="block--imgset3a__subtitle">{item.subtitle}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(ImgSet3aBlock);
