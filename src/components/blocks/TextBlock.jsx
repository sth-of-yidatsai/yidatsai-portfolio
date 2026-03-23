import './blocks.css';

export default function TextBlock({ content, align }) {
  return (
    <section className={`block block--text${align === 'center' ? ' block--text--center' : ''}`}>
      <div className="block--text__inner">
        <p className="block--text__content">{content}</p>
      </div>
    </section>
  );
}