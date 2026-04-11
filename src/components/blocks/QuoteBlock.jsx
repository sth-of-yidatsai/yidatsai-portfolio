import { memo } from "react";
import { buildSrcSet } from '../../utils/imgSrcSet';
import { useTranslation } from '../../hooks/useTranslation';
import { pickLang } from '../../utils/pickLang';
import './QuoteBlock.css';

function QuoteBlock({ text, author, image }) {
  const { language } = useTranslation();
  const resolvedText   = pickLang(text, language);
  const resolvedAuthor = pickLang(author, language);

  return (
    <section className="block block--quote">
      <div className="block--quote__inner">
        {image && (
          <div className="block--quote__image-wrap">
            <img className="block--quote__image" src={image} srcSet={buildSrcSet(image)} sizes="(max-width: 768px) 80vw, 50vw" alt="" loading="eager" />
          </div>
        )}
        <svg className="block--quote__mark" viewBox="0 0 200 183.66" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M64.11,154.32c0,17.39-13.04,29.34-30.43,29.34-21.73,0-33.69-18.47-33.69-53.25C0,81.51,23.91,30.44,68.46,1.1c6.52-4.35,11.95,5.43,6.52,8.69C47.81,26.09,26.08,59.78,26.08,89.12c0,17.39,7.61,27.16,18.47,33.69,11.95,7.61,19.56,18.47,19.56,31.51ZM186.91,154.32c0,17.39-13.04,29.34-30.43,29.34-21.73,0-33.69-18.47-33.69-53.25,0-48.9,23.91-99.97,68.46-129.31,6.52-4.35,11.95,5.43,6.52,8.69-27.17,16.3-48.9,49.99-48.9,79.33,0,17.39,7.61,27.16,18.47,33.69,11.95,7.61,19.56,18.47,19.56,31.51Z" fill="currentColor"/>
        </svg>
        <p className="block--quote__text">{resolvedText}</p>
        {resolvedAuthor && <p className="block--quote__author">{resolvedAuthor}</p>}
      </div>
    </section>
  );
}

export default memo(QuoteBlock);
