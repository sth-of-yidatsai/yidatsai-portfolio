import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import { getAltText } from '../../utils/getAltText';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';
import { pickLang } from '../../utils/pickLang';
import './ImgSet1aBlock.css';

function ImgSet1aBlock({ src, title, subtitle }) {
  const { language } = useTranslation();
  const resolvedTitle    = pickLang(title, language);
  const resolvedSubtitle = pickLang(subtitle, language);
  const revealRef = useScrollReveal();
  return (
    <section className="block block--imgset1a">
      <div ref={revealRef} className="block--imgset1a__img-wrap">
        <img src={src} srcSet={buildSrcSet(src)} sizes="(max-width: 768px) 100vw, 1200px" alt={getAltText(src, resolvedTitle ?? '')} loading="lazy" decoding="async" />
      </div>
      {(resolvedTitle || resolvedSubtitle) && (
        <div className="block--imgset1a__caption">
          {resolvedTitle    && <p className="block--imgset1a__title">{resolvedTitle}</p>}
          {resolvedSubtitle && <p className="block--imgset1a__subtitle">{resolvedSubtitle}</p>}
        </div>
      )}
    </section>
  );
}

export default memo(ImgSet1aBlock);
