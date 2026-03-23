import ParallaxImg from './ParallaxImg';
import './blocks.css';

export default function ImageLeftTextRightBlock({ image, imageAlt, label, title, text }) {
  return (
    <section className="block block--image-left-text-right">
      <div className="block--split__inner">
        <div className="block--split__image">
          <ParallaxImg src={image} alt={imageAlt || title} />
        </div>
        <div className="block--split__text">
          {label && <p className="block--split__text__label">{label}</p>}
          {title && <h3>{title}</h3>}
          {text && <p>{text}</p>}
        </div>
      </div>
    </section>
  );
}
