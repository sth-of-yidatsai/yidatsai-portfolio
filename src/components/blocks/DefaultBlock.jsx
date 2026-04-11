import { memo } from 'react';
import { buildSrcSet } from '../../utils/imgSrcSet';
import { getAltText } from '../../utils/getAltText';
import { useTranslation } from '../../hooks/useTranslation';
import './DefaultBlock.css';

function DefaultBlock({ images = [], baseUrl = '' }) {
  const { language } = useTranslation();
  return (
    <section className="block block--default">
      <div className="block--default__grid">
        {images.map((filename, i) => (
          <div key={i} className="block--default__item">
            <img
              src={`${baseUrl}/${filename}`}
              srcSet={buildSrcSet(`${baseUrl}/${filename}`)}
              sizes="(max-width: 768px) 100vw, 50vw"
              alt={getAltText(`${baseUrl}/${filename}`, '', language)}
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
