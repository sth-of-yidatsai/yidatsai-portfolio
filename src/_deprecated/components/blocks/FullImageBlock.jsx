import { memo } from "react";
import './blocks.css';

function FullImageBlock({ src, alt, caption }) {
  return (
    <section className="block block--full-image">
      <img src={src} alt={alt || ""} className="block--full-image__img" />
      {caption && <p className="block--full-image__caption">{caption}</p>}
    </section>
  );
}

export default memo(FullImageBlock);
