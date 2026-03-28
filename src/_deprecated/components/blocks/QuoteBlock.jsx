import { memo } from "react";
import './blocks.css';

function QuoteBlock({ text, author, image }) {
  return (
    <section className="block block--quote">
      <div className="block--quote__inner">
        {image && (
          <div className="block--quote__image-wrap">
            <img className="block--quote__image" src={image} alt="" />
          </div>
        )}
        <svg className="block--quote__mark" viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 52V32.5C0 22.833 2.333 14.833 7 8.5 11.667 2.167 18.667 0 28 0l2 6c-5.333 1.333-9.167 4-11.5 8S15 23.333 15 29h13V52H0Zm45 0V32.5c0-9.667 2.333-17.667 7-24C56.667 2.167 63.667 0 73 0l2 6c-5.333 1.333-9.167 4-11.5 8S60 23.333 60 29h13V52H45Z" fill="currentColor"/>
        </svg>
        <p className="block--quote__text">{text}</p>
        {author && <p className="block--quote__author">{author}</p>}
      </div>
    </section>
  );
}
export default memo(QuoteBlock);
