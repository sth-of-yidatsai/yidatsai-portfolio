import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import { getAltText } from '../../utils/getAltText';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';
import { pickLang } from '../../utils/pickLang';
import './ImgTextBlock.css';

function ImgTextBlock({
  image,
  imageAlt,
  title,
  text,
  reverse = false,
  bgColor,
  titleColor,
  textColor,
}) {
  const { language } = useTranslation();
  const resolvedTitle = pickLang(title, language);
  const rawText = pickLang(text, language);
  const paragraphs = Array.isArray(rawText) ? rawText : rawText ? [rawText] : [];
  const resolvedAlt = imageAlt ?? getAltText(image, '', language);
  const revealRef = useScrollReveal();

  const imgPanel = (
    <div ref={revealRef} className="block--imgtxt__image">
      <img src={image} srcSet={buildSrcSet(image)} sizes="(max-width: 768px) 100vw, 50vw" alt={resolvedAlt} loading="eager" decoding="async" />
    </div>
  );

  const textPanel = (
    <div className="block--imgtxt__text" style={{ background: bgColor }}>
      <div className="block--imgtxt__text-inner">
        {resolvedTitle && (
          <h3
            className="block--imgtxt__title"
            style={titleColor ? { color: titleColor } : undefined}
          >
            {resolvedTitle}
          </h3>
        )}
        <span
          className="block--imgtxt__divider"
          style={textColor ? { background: textColor } : undefined}
        />
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="block--imgtxt__para"
            style={textColor ? { color: textColor } : undefined}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );

  return (
    <section className={`block block--imgtxt${reverse ? ' block--imgtxt--reverse' : ''}`}>
      {reverse ? <>{textPanel}{imgPanel}</> : <>{imgPanel}{textPanel}</>}
    </section>
  );
}

export default memo(ImgTextBlock);
