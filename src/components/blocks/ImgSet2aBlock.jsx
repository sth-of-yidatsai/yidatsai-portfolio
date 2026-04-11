import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import { getAltText } from '../../utils/getAltText';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';
import { pickLang } from '../../utils/pickLang';
import './ImgSet2aBlock.css';

function ImgItem({ item, modifier, language }) {
  const revealRef = useScrollReveal();
  const title    = pickLang(item.title, language);
  const subtitle = pickLang(item.subtitle, language);
  return (
    <div className={`block--imgset2a__item block--imgset2a__item--${modifier}`}>
      <div ref={revealRef} className="block--imgset2a__img-wrap">
        <img src={item.src} srcSet={buildSrcSet(item.src)} sizes="(max-width: 768px) 100vw, 50vw" alt={getAltText(item.src, title ?? '')} loading="eager" decoding="async" />
      </div>
      {(title || subtitle) && (
        <div className="block--imgset2a__caption">
          {title    && <p className="block--imgset2a__title">{title}</p>}
          {subtitle && <p className="block--imgset2a__subtitle">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}

function ImgSet2aBlock({ items = [], bg, color, reverse }) {
  const { language } = useTranslation();
  const [a, b] = items;
  return (
    <section
      className={`block block--imgset2a${reverse ? ' block--imgset2a--reverse' : ''}`}
      style={{ background: bg, color }}
    >
      <div className={`block--imgset2a__grid${reverse ? ' block--imgset2a__grid--reverse' : ''}`}>
        {a && <ImgItem item={a} modifier="a" language={language} />}
        {b && <ImgItem item={b} modifier="b" language={language} />}
      </div>
    </section>
  );
}

export default memo(ImgSet2aBlock);
