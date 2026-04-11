import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import { getAltText } from '../../utils/getAltText';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';
import { pickLang } from '../../utils/pickLang';
import './ImgSet2bBlock.css';

function ImgItem({ item, modifier, language }) {
  const revealRef = useScrollReveal();
  const title    = pickLang(item.title, language);
  const subtitle = pickLang(item.subtitle, language);
  return (
    <div className={`block--imgset2b__item block--imgset2b__item--${modifier}`}>
      <div ref={revealRef} className="block--imgset2b__img-wrap">
        <img src={item.src} srcSet={buildSrcSet(item.src)} sizes="(max-width: 768px) 100vw, 50vw" alt={getAltText(item.src, title ?? '', language)} loading="lazy" decoding="async" />
      </div>
      {(title || subtitle) && (
        <div className="block--imgset2b__caption">
          {title    && <p className="block--imgset2b__title">{title}</p>}
          {subtitle && <p className="block--imgset2b__subtitle">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}

function ImgSet2bBlock({ items = [], bg, color, reverse }) {
  const { language } = useTranslation();
  const [a, b] = items;
  return (
    <section
      className={`block block--imgset2b${reverse ? ' block--imgset2b--reverse' : ''}`}
      style={{ background: bg, color }}
    >
      <div className="block--imgset2b__grid">
        {a && <ImgItem item={a} modifier="a" language={language} />}
        {b && <ImgItem item={b} modifier="b" language={language} />}
      </div>
    </section>
  );
}

export default memo(ImgSet2bBlock);
