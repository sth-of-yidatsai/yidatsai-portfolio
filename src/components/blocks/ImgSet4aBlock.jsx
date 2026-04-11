import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import { getAltText } from '../../utils/getAltText';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';
import { pickLang } from '../../utils/pickLang';
import './ImgSet4aBlock.css';

function ImgWrap({ src }) {
  const revealRef = useScrollReveal();
  return (
    <div ref={revealRef} className="block--imgset4a__img-wrap">
      <img src={src} srcSet={buildSrcSet(src)} sizes="(max-width: 768px) 50vw, 25vw" alt={getAltText(src)} loading="eager" decoding="async" />
    </div>
  );
}

function ImgSet4aBlock({ images = [], title, subtitle, bg, color }) {
  const { language } = useTranslation();
  const resolvedTitle    = pickLang(title, language);
  const resolvedSubtitle = pickLang(subtitle, language);
  return (
    <section className="block block--imgset4a" style={{ background: bg, color }}>
      <div className="block--imgset4a__grid">
        {images.slice(0, 4).map((src, i) => (
          <ImgWrap key={i} src={src} />
        ))}
      </div>
      {(resolvedTitle || resolvedSubtitle) && (
        <div className="block--imgset4a__caption">
          {resolvedTitle    && <p className="block--imgset4a__title">{resolvedTitle}</p>}
          {resolvedSubtitle && <p className="block--imgset4a__subtitle">{resolvedSubtitle}</p>}
        </div>
      )}
    </section>
  );
}

export default memo(ImgSet4aBlock);
