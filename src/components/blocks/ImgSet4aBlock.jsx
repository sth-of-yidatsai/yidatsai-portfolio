import { memo } from 'react';
import './ImgSet4aBlock.css';

function ImgSet4aBlock({ images = [], title, subtitle, bg, color }) {
  return (
    <section className="block block--imgset4a" style={{ background: bg, color }}>
      <div className="block--imgset4a__grid">
        {images.slice(0, 4).map((src, i) => (
          <div key={i} className="block--imgset4a__img-wrap">
            <img src={src} alt="" loading="eager" decoding="async" />
          </div>
        ))}
      </div>
      {(title || subtitle) && (
        <div className="block--imgset4a__caption">
          {title    && <p className="block--imgset4a__title">{title}</p>}
          {subtitle && <p className="block--imgset4a__subtitle">{subtitle}</p>}
        </div>
      )}
    </section>
  );
}

export default memo(ImgSet4aBlock);
