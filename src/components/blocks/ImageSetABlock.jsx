import ParallaxImg from './ParallaxImg';
import './blocks.css';

export default function ImageSetABlock({ images = [], bg, color }) {
  const items = images.slice(0, 3).map(img =>
    typeof img === 'string' ? { src: img, label: '' } : img
  );

  return (
    <section
      className="block block--image-set-a"
      style={{ background: bg, color: color }}
    >
      {items[0] && (
        <div className="block--image-set-a__item block--image-set-a__item--1">
          <div className="block--image-set-a__img-wrap block--image-set-a__img-wrap--7-5">
            <ParallaxImg src={items[0].src} alt="" />
          </div>
          {items[0].label && (
            <span className="block--image-set-a__label">{items[0].label}</span>
          )}
        </div>
      )}
      {items[1] && (
        <div className="block--image-set-a__item block--image-set-a__item--2">
          <div className="block--image-set-a__img-wrap block--image-set-a__img-wrap--1-1">
            <ParallaxImg src={items[1].src} alt="" />
          </div>
          {items[1].label && (
            <span className="block--image-set-a__label">{items[1].label}</span>
          )}
        </div>
      )}
      {items[2] && (
        <div className="block--image-set-a__item block--image-set-a__item--3">
          <div className="block--image-set-a__img-wrap block--image-set-a__img-wrap--1-1">
            <ParallaxImg src={items[2].src} alt="" />
          </div>
          {items[2].label && (
            <span className="block--image-set-a__label">{items[2].label}</span>
          )}
        </div>
      )}
    </section>
  );
}
