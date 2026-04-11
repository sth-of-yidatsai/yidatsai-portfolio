import { memo } from "react";
import { useTranslation } from '../../hooks/useTranslation';
import './HeroBlock.css';

function HeroBlock({ image, project = {} }) {
  const { t } = useTranslation();
  const { title, year, category = [], tags = [] } = project;

  return (
    <section className="block block--hero">
      <div
        className="block--hero__bg"
        style={{ backgroundImage: image ? `url(${image})` : undefined }}
      />

      <div className="block--hero__info-panel">
        <div className="block--hero__info-content">

          <div className="block--hero__title-section">
            <div className="block--hero__info-item">
              <span className="block--hero__info-label">{t('hero.labelTitle')}</span>
              <span className="block--hero__info-value">{title}</span>
            </div>
          </div>

          {year && (
            <div className="block--hero__year-section">
              <div className="block--hero__info-item">
                <span className="block--hero__info-label">{t('hero.labelYear')}</span>
                <span className="block--hero__info-value">{year}</span>
              </div>
            </div>
          )}

          {category.length > 0 && (
            <div className="block--hero__tag-section">
              <div className="block--hero__info-item">
                <span className="block--hero__info-label">{t('hero.labelCategory')}</span>
                <div className="block--hero__tag-list">
                  {category.map((cat, i) => (
                    <span key={i} className="block--hero__tag-item">{cat}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div className="block--hero__tag-section">
              <div className="block--hero__info-item">
                <span className="block--hero__info-label">{t('hero.labelTag')}</span>
                <div className="block--hero__tag-list">
                  {tags.map((tag, i) => (
                    <span key={i} className="block--hero__tag-item">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

export default memo(HeroBlock);
