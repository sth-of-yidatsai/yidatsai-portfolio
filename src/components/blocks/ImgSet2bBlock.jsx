import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import './ImgSet2bBlock.css';

function ImgItem({ item, modifier }) {
  return (
    <div className={`block--imgset2b__item block--imgset2b__item--${modifier}`}>
      <div className="block--imgset2b__img-wrap">
        <img src={item.src} srcSet={buildSrcSet(item.src)} sizes="(max-width: 768px) 100vw, 50vw" alt={item.title ?? ''} loading="lazy" decoding="async" />
      </div>
      {(item.title || item.subtitle) && (
        <div className="block--imgset2b__caption">
          {item.title    && <p className="block--imgset2b__title">{item.title}</p>}
          {item.subtitle && <p className="block--imgset2b__subtitle">{item.subtitle}</p>}
        </div>
      )}
    </div>
  );
}

function ImgSet2bBlock({ items = [], bg, color, reverse }) {
  const [a, b] = items;
  return (
    <section
      className={`block block--imgset2b${reverse ? ' block--imgset2b--reverse' : ''}`}
      style={{ background: bg, color }}
    >
      <div className="block--imgset2b__grid">
        {a && <ImgItem item={a} modifier="a" />}
        {b && <ImgItem item={b} modifier="b" />}
      </div>
    </section>
  );
}

export default memo(ImgSet2bBlock);
