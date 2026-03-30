import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import './CarouselBlock.css';

function CarouselBlock({ images = [], interval = 5000 }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const timerRef = useRef(null);

  const goTo = useCallback((index) => {
    setCurrent((c) => {
      setPrev(c);
      return index;
    });
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % images.length);
  }, [current, images.length, goTo]);

  // Reset prev after transition ends
  useEffect(() => {
    const id = setTimeout(() => setPrev(null), 700);
    return () => clearTimeout(id);
  }, [current]);

  // Auto-advance
  useEffect(() => {
    if (images.length < 2) return;
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
  }, [next, images.length, interval]);

  return (
    <section className="block block--carousel">
      <div className="block--carousel__stage">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            srcSet={buildSrcSet(src)}
            sizes="100vw"
            alt=""
            className={[
              'block--carousel__slide',
              i === current ? 'is-active' : '',
              i === prev    ? 'is-prev'   : '',
            ].join(' ')}
            decoding="async"
          />
        ))}
      </div>

      {images.length > 1 && (
        <nav className="block--carousel__nav">
          {images.map((_, i) => (
            <button
              key={i}
              className={`block--carousel__dot${i === current ? ' is-active' : ''}`}
              onClick={() => { clearInterval(timerRef.current); goTo(i); }}
              aria-label={`Slide ${i + 1}`}
            >
              {String(i + 1).padStart(2, '0')}
            </button>
          ))}
        </nav>
      )}
    </section>
  );
}

export default memo(CarouselBlock);
