import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import { getAltText } from '../../utils/getAltText';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';
import { pickLang } from '../../utils/pickLang';
import './ImgSet1bBlock.css';

function ImgSet1bBlock({ src, title, subtitle, reverse }) {
  const { language } = useTranslation();
  const resolvedTitle    = pickLang(title, language);
  const resolvedSubtitle = pickLang(subtitle, language);
  const revealRef = useScrollReveal();
  return (
    <section className={`block block--imgset1b${reverse ? ' block--imgset1b--reverse' : ''}`}>
      <div ref={revealRef} className="block--imgset1b__img-wrap">
        <img src={src} srcSet={buildSrcSet(src)} sizes="(max-width: 768px) 100vw, 1200px" alt={getAltText(src, resolvedTitle ?? '')} loading="lazy" decoding="async" />
      </div>
      {(resolvedTitle || resolvedSubtitle) && (
        <div className="block--imgset1b__caption">
          {resolvedTitle    && <p className="block--imgset1b__title">{resolvedTitle}</p>}
          {resolvedSubtitle && <p className="block--imgset1b__subtitle">{resolvedSubtitle}</p>}
        </div>
      )}
    </section>
  );
}

export default memo(ImgSet1bBlock);
