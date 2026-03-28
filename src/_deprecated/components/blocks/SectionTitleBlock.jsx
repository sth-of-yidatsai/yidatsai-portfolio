import { memo } from 'react';
import './blocks.css';

function SectionTitleBlock({
  project = {},
  bg        = 'var(--gray-900)',
  color     = 'var(--gray-600)',
  fillColor = 'var(--gray-50)',
}) {
  const { title = '', description = '' } = project;

  const titleChars = [...title];
  const descChars  = [...description];
  const descOffset = titleChars.length;

  return (
    <section
      className="block block--section-title block--section-title--sticky"
      data-scroll-type="section-title"
      data-color={color}
      data-fill-color={fillColor}
      style={{ background: bg }}
    >
      <div className="block--section-title__inner">

        <p className="block--section-title__label">Title</p>

        <h2 className="block--section-title__title">
          {titleChars.map((char, i) => (
            <span key={i} className="block--section-title__char">{char}</span>
          ))}
        </h2>

        {description && (
          <p className="block--section-title__subtitle">
            {descChars.map((char, i) => (
              <span key={descOffset + i} className="block--section-title__char">{char}</span>
            ))}
          </p>
        )}

      </div>
    </section>
  );
}

export default memo(SectionTitleBlock);
