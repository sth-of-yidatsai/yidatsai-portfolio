import './blocks.css';

export default function HeroBlock({ image, project = {} }) {
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
              <span className="block--hero__info-label">Title</span>
              <span className="block--hero__info-value">{title}</span>
            </div>
          </div>

          {year && (
            <div className="block--hero__year-section">
              <div className="block--hero__info-item">
                <span className="block--hero__info-label">Year</span>
                <span className="block--hero__info-value">{year}</span>
              </div>
            </div>
          )}

          {category.length > 0 && (
            <div className="block--hero__tag-section">
              <div className="block--hero__info-item">
                <span className="block--hero__info-label">Category</span>
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
                <span className="block--hero__info-label">Tag</span>
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
