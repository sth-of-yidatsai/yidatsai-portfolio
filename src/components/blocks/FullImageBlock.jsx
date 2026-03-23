import ParallaxImg from './ParallaxImg';
import './blocks.css';

export default function FullImageBlock({ src, alt, caption }) {
  return (
    <section className="block block--full-image">
      <ParallaxImg src={src} alt={alt} />
      {caption && <p className="block--full-image__caption">{caption}</p>}
    </section>
  );
}
