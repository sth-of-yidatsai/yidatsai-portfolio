import { memo } from "react";
import './blocks.css';

function ImageSetBBlock({ images = [], bg, color }) {
  const items = images.slice(0, 3).map(img =>
    typeof img === 'string' ? { src: img, label: '' } : img
  );

  return (
    <section
      className="block block--image-set-b"
      style={{ background: bg, color: color }}
    >
      {items[0] && (
        <div className="block--image-set-b__item block--image-set-b__item--1">
          <div className="block--image-set-b__img-wrap block--image-set-b__img-wrap--4-5">
            <img src={items[0].src} alt="" className="block--image-set-b__img" />
          </div>
          {items[0].label && (
            <span className="block--image-set-b__label">{items[0].label}</span>
          )}
        </div>
      )}
      {items[1] && (
        <div className="block--image-set-b__item block--image-set-b__item--2">
          <div className="block--image-set-b__img-wrap block--image-set-b__img-wrap--5-4">
            <img src={items[1].src} alt="" className="block--image-set-b__img" />
          </div>
          {items[1].label && (
            <span className="block--image-set-b__label">{items[1].label}</span>
          )}
        </div>
      )}
      {items[2] && (
        <div className="block--image-set-b__item block--image-set-b__item--3">
          <div className="block--image-set-b__img-wrap block--image-set-b__img-wrap--4-5">
            <img src={items[2].src} alt="" className="block--image-set-b__img" />
          </div>
          {items[2].label && (
            <span className="block--image-set-b__label">{items[2].label}</span>
          )}
        </div>
      )}
    </section>
  );
}

export default memo(ImageSetBBlock);
