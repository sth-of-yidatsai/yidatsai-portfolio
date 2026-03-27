import { memo } from "react";
import "./blocks.css";

function ImageLeftTextRightBlock({
  image,
  imageAlt,
  bg,
  color,
  title,
  text,
}) {
  const paragraphs = Array.isArray(text) ? text : text ? [text] : [];

  return (
    <section className="block block--image-left-text-right">
      <div className="block--split-full__image">
        <img src={image} alt={imageAlt || ""} className="block--split-full__img" />
      </div>
      <div
        className="block--split-full__text"
        style={{ background: bg, color }}
      >
        <div className="block--split-full__text-inner">
          {title && <h3 className="block--split-full__title">{title}</h3>}
          <span className="block--split-full__divider" />
          {paragraphs.map((p, i) => (
            <p key={i} className="block--split-full__para">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ImageLeftTextRightBlock);
