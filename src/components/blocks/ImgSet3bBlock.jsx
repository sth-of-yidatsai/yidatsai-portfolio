import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import { getAltText } from '../../utils/getAltText';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './ImgSet3bBlock.css';

function ImgItem({ item, modifier }) {
  const revealRef = useScrollReveal();
  return (
    <div className={`block--imgset3b__item block--imgset3b__item--${modifier}`}>
      <div ref={revealRef} className="block--imgset3b__img-wrap">
        <img
          src={item.src}
          srcSet={buildSrcSet(item.src)}
          sizes="(max-width: 768px) 100vw, 33vw"
          alt={getAltText(item.src, item.title ?? '')}
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

function ImgSet3bBlock({ items = [], bg, color, reverse }) {
  const [a, b, c] = items;
  return (
    <section
      className="block block--imgset3b"
      style={{ background: bg, color }}
    >
      <div className={`block--imgset3b__grid${reverse ? ' block--imgset3b__grid--reverse' : ''}`}>
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
