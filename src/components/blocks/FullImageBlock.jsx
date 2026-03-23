import { useRef, useEffect, useState } from 'react';
import ParallaxImg from './ParallaxImg';
import './blocks.css';

export default function FullImageBlock({ src, alt, caption }) {
  const ref = useRef(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      // 用 offsetTop（layout 位置，含 scroll-pin spacer）判斷觸發時機
      if (window.scrollY + window.innerHeight >= el.offsetTop) {
        setEntered(true);
        window.removeEventListener('scroll', check);
      }
    };

    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, []);

  return (
    <section
      ref={ref}
      className={`block block--full-image${entered ? ' block--full-image--entered' : ''}`}
    >
      <ParallaxImg src={src} alt={alt} />
      {caption && <p className="block--full-image__caption">{caption}</p>}
    </section>
  );
}
