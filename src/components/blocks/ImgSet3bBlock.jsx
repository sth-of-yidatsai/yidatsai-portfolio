import { memo } from 'react';
import './ImgSet3bBlock.css';

function ImgItem({ item, modifier }) {
  return (
    <div className={`block--imgset3b__item block--imgset3b__item--${modifier}`}>
      <div className="block--imgset3b__img-wrap">
        <img
          src={item.src}
          alt={item.title ?? ''}
          loading="eager"
          decoding="async"
        />
      </div>
      {(item.title || item.subtitle) && (
        <div className="block--imgset3b__caption">
          {item.title    && <p className="block--imgset3b__title">{item.title}</p>}
          {item.subtitle && <p className="block--imgset3b__subtitle">{item.subtitle}</p>}
        </div>
      )}
    </div>
  );
}

function ImgSet3bBlock({ items = [], bg, color }) {
  const [a, b, c] = items;
  return (
    <section
      className="block block--imgset3b"
      style={{ background: bg, color }}
    >
      <div className="block--imgset3b__grid">
        <div className="block--imgset3b__left">
          {a && <ImgItem item={a} modifier="a" />}
          {b && <ImgItem item={b} modifier="b" />}
        </div>
        {c && <ImgItem item={c} modifier="c" />}
      </div>
    </section>
  );
}

export default memo(ImgSet3bBlock);
