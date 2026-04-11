import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import { getAltText } from '../../utils/getAltText';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';
import { pickLang } from '../../utils/pickLang';
import './ImgSet3bBlock.css';

function ImgItem({ item, modifier, language }) {
  const revealRef = useScrollReveal();
  const title    = pickLang(item.title, language);
  const subtitle = pickLang(item.subtitle, language);
  return (
    <div className={`block--imgset3b__item block--imgset3b__item--${modifier}`}>
      <div ref={revealRef} className="block--imgset3b__img-wrap">
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
        <div className="block--imgset3b__caption">
          {title    && <p className="block--imgset3b__title">{title}</p>}
          {subtitle && <p className="block--imgset3b__subtitle">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}

function ImgSet3bBlock({ items = [], bg, color, reverse }) {
  const { language } = useTranslation();
  const [a, b, c] = items;
  return (
    <section
      className="block block--imgset3b"
      style={{ background: bg, color }}
    >
      <div className={`block--imgset3b__grid${reverse ? ' block--imgset3b__grid--reverse' : ''}`}>
        <div className="block--imgset3b__left">
          {a && <ImgItem item={a} modifier="a" language={language} />}
          {b && <ImgItem item={b} modifier="b" language={language} />}
        </div>
        {c && <ImgItem item={c} modifier="c" language={language} />}
      </div>
    </section>
  );
}

export default memo(ImgSet3bBlock);
