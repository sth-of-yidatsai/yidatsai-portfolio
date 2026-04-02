import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './ImgSet3aBlock.css';

function ImgItem({ item }) {
  const revealRef = useScrollReveal();
  return (
    <div className="block--imgset3a__item">
      <div ref={revealRef} className="block--imgset3a__img-wrap">
        <img
          src={item.src}
          srcSet={buildSrcSet(item.src)}
          sizes="(max-width: 768px) 100vw, 33vw"
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
  );
}

function ImgSet3aBlock({ items = [], bg, color, reverse }) {
  return (
    <section
      className="block block--imgset3a"
      style={{ background: bg, color }}
    >
      <div className={`block--imgset3a__grid${reverse ? ' block--imgset3a__grid--reverse' : ''}`}>
        {items.map((item, i) => (
          <ImgItem key={i} item={item} />
        ))}
      </div>
    </section>
  );
}

export default memo(ImgSet3aBlock);
