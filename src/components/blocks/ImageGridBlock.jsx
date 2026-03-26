import { memo } from "react";
import ParallaxImg from './ParallaxImg';
import './blocks.css';

function ImageGridBlock({ images = [], columns = 2 }) {
  const cols = Math.min(Math.max(columns, 2), 4);

  return (
    <section className={`block block--image-grid block--image-grid--${cols}`}>
      <div className="block--image-grid__inner">
        {images.map((src, i) => (
          <div key={i} className="block--image-grid__item">
            <ParallaxImg src={typeof src === 'string' ? src : src.src} alt={`image ${i + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(ImageGridBlock);
