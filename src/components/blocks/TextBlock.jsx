import { memo } from 'react';
import './blocks.css';

function TextBlock({
  label     = '',
  text      = '',
  content   = '',
  bg        = 'transparent',
  color     = 'var(--gray-600)',
  fillColor = 'var(--gray-900)',
  align,
}) {
  const body  = text || content;
  const chars = [...body];

  return (
    <section
      className={`block block--text block--text--sticky${align === 'center' ? ' block--text--center' : ''}`}
      data-scroll-type="text"
      data-color={color}
      data-fill-color={fillColor}
      style={{ background: bg }}
    >
      <div className="block--text__inner">
        {label && <p className="block--text__label">{label}</p>}
        <p className="block--text__content">
          {chars.map((char, i) => (
            <span key={i} className="block--text__char">{char}</span>
          ))}
        </p>
      </div>
    </section>
  );
}

export default memo(TextBlock);
