import { useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { FAQ_DATA } from "../../../seo/seoConfig";
import "./FaqSection.css";

export default function FaqSection() {
  const { language } = useLanguage();
  const data = FAQ_DATA[language] ?? FAQ_DATA.en;
  const { items } = data;
  const eyebrow = language === "zh" ? "FAQ｜常見問題" : "FAQ";
  const title = "About Me";

  const [activeIndex, setActiveIndex] = useState(null);
  const toggle = (i) => setActiveIndex((prev) => (prev === i ? null : i));

  return (
    <section className="faq">
      <div className="faq__header">
        <p className="faq__eyebrow">{eyebrow}</p>
        <h2 className="faq__title hatton-ultralight">{title}</h2>
      </div>

      <div className="faq__list">
        {items.map((item, i) => {
          const isActive = activeIndex === i;
          return (
            <div
              key={i}
              className={`faq__item${isActive ? " faq__item--active" : ""}`}
              onClick={isActive ? () => setActiveIndex(null) : undefined}
            >
              <button
                className="faq__trigger"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(i);
                }}
                aria-expanded={isActive}
              >
                <span className="faq__q-text">{item.question}</span>
                <span className="faq__icon" aria-hidden="true">
                  +
                </span>
              </button>

              {/* Grid-row animation: 0fr → 1fr */}
              <div className="faq__body-wrap">
                <div className="faq__body-inner">
                  <div className="faq__body">
                    <span className="faq__answer-label" aria-hidden="true">
                      Answer
                    </span>
                    <p className="faq__answer-text">{item.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
