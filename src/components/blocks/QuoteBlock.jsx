import './blocks.css';

export default function QuoteBlock({ text, author }) {
  return (
    <section className="block block--quote">
      <div className="block--quote__inner">
        <span className="block--quote__mark">"</span>
        <p className="block--quote__text">{text}</p>
        {author && <p className="block--quote__author">{author}</p>}
      </div>
    </section>
  );
}