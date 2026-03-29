import { memo } from 'react';
import './DefaultBlock.css';

function DefaultBlock({ images = [], baseUrl = '' }) {
  return (
    <section className="block block--default">
      <div className="block--default__grid">
        {images.map((filename, i) => (
          <div key={i} className="block--default__item">
            <img
              src={`${baseUrl}/${filename}`}
              alt={`image ${i + 1}`}
              loading="eager"
              decoding="async"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(DefaultBlock);
