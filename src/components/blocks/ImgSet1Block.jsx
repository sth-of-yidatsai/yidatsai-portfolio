import { memo } from 'react';
import './ImgSet1Block.css';

function ImgSet1Block({ items = [], bg, color }) {
  return (
    <section
      className="block block--imgset1"
      style={{ background: bg, color }}
    >
      <div className="block--imgset1__grid">
        {items.map((item, i) => (
          <div key={i} className="block--imgset1__item">
            <div className="block--imgset1__img-wrap">
              <img
                src={item.src}
                alt={item.title ?? ''}
                decoding="async"
              />
            </div>
            {(item.title || item.subtitle) && (
              <div className="block--imgset1__caption">
                {item.title    && <p className="block--imgset1__title">{item.title}</p>}
                {item.subtitle && <p className="block--imgset1__subtitle">{item.subtitle}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(ImgSet1Block);
