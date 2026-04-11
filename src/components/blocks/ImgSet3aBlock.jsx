import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import { getAltText } from '../../utils/getAltText';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';
import { pickLang } from '../../utils/pickLang';
import './ImgSet3aBlock.css';

function ImgItem({ item, language }) {
  const revealRef = useScrollReveal();
  const title    = pickLang(item.title, language);
  const subtitle = pickLang(item.subtitle, language);
  return (
    <div className="block--imgset3a__item">
      <div ref={revealRef} className="block--imgset3a__img-wrap">
        <img
          src={item.src}
          srcSet={buildSrcSet(item.src)}
          sizes="(max-width: 768px) 100vw, 33vw"
          alt={getAltText(item.src, title ?? '')}
          loading="eager"
          decoding="async"
        />
      </div>
      {(title || subtitle) && (
        <div className="block--imgset3a__caption">
          {title    && <p className="block--imgset3a__title">{title}</p>}
          {subtitle && <p className="block--imgset3a__subtitle">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}

function ImgSet3aBlock({ items = [], bg, color, reverse }) {
  const { language } = useTranslation();
  return (
    <section
      className="block block--imgset3a"
      style={{ background: bg, color }}
    >
      <div className={`block--imgset3a__grid${reverse ? ' block--imgset3a__grid--reverse' : ''}`}>
        {items.map((item, i) => (
          <ImgItem key={i} item={item} language={language} />
        ))}
      </div>
    </section>
  );
}

export default memo(ImgSet3aBlock);
