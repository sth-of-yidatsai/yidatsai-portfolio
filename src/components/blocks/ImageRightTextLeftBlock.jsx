import { memo } from "react";
import ParallaxImg from './ParallaxImg';
import "./blocks.css";

function ImageRightTextLeftBlock({
  image,
  imageAlt,
  bg,
  color,
  title,
  text,
}) {
  const paragraphs = Array.isArray(text) ? text : text ? [text] : [];

  return (
    <section className="block block--image-right-text-left">
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
      <div className="block--split-full__image">
        <ParallaxImg src={image} alt={imageAlt || ""} />
      </div>
    </section>
  );
}

export default memo(ImageRightTextLeftBlock);
