import { memo } from 'react';
import './ImgTextBlock.css';

function ImgTextBlock({
  image,
  imageAlt = '',
  title,
  text,
  reverse = false,
  bgColor,
  titleColor,
  textColor,
}) {
  const paragraphs = Array.isArray(text) ? text : text ? [text] : [];

  const imgPanel = (
    <div className="block--imgtxt__image">
      <img src={image} alt={imageAlt} loading="eager" decoding="async" />
    </div>
  );

  const textPanel = (
    <div className="block--imgtxt__text" style={{ background: bgColor }}>
      <div className="block--imgtxt__text-inner">
        {title && (
          <h3
            className="block--imgtxt__title"
            style={titleColor ? { color: titleColor } : undefined}
          >
            {title}
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
