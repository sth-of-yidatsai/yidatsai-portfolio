import { useRef, useState, useEffect, useCallback } from "react";
import { buildSrcSet } from "../../../utils/imgSrcSet";
import { useTranslation } from "../../../hooks/useTranslation";
import BilingTitle from "../../BilingTitle";
import "./CapabilitiesSection.css";

const ITEM_IMAGES = [
  "/images/about/01.webp",
  "/images/about/02.webp",
  "/images/about/03.webp",
  "/images/about/04.webp",
  "/images/about/05.webp",
];

const EASE = 0.08; // lower = more lag (0.05 sluggish, 0.15 snappy)

export default function CapabilitiesSection() {
  const { t, locale } = useTranslation();
  const ITEMS = locale.capabilities.items.map((item, i) => ({
    ...item,
    image: ITEM_IMAGES[i],
  }));

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const imgWrapRef = useRef(null);
  const rafRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    targetRef.current.x = e.clientX;
    targetRef.current.y = e.clientY;
  }, []);

  // Persistent lerp loop — runs while section is mounted
  useEffect(() => {
    const tick = () => {
      const cur = currentRef.current;
      const tgt = targetRef.current;
      cur.x += (tgt.x - cur.x) * EASE;
      cur.y += (tgt.y - cur.y) * EASE;
      if (imgWrapRef.current) {
        imgWrapRef.current.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section className="cs" onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredIndex(null)}>
      {/* Header */}
      <div className="cs__header">
        <p className="cs__subtitle">{t('capabilities.eyebrow')}</p>
        <BilingTitle
          en={t('capabilities.title')}
          zh={t('capabilities.titleZh')}
          className="cs__title hatton-ultralight"
        />
      </div>

      {/* Rows */}
      <div className="cs__rows">
        {ITEMS.map((item, i) => (
          <div
            key={i}
            className={`cs__row${hoveredIndex === i ? " cs__row--hover" : ""}`}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span className="cs__num">({item.num})</span>
            <h3 className="cs__item-title">
              <span className="cs__title-wrap">
                <span className="cs__title-normal">{item.title}</span>
                <span className="cs__title-hover" aria-hidden="true">{item.title}</span>
              </span>
            </h3>
            <div className="cs__desc">
              <span className="cs__desc-bullet" aria-hidden="true" />
              <p className="cs__desc-text">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cursor-following image (fixed, translates to mouse position) */}
      <div
        ref={imgWrapRef}
        className={`cs__img-cursor${hoveredIndex !== null ? " cs__img-cursor--visible" : ""}`}
      >
        <div className="cs__img-frame">
          {(() => {
            const src = hoveredIndex !== null ? ITEMS[hoveredIndex].image : ITEMS[0].image;
            return (
              <img
                className="cs__img"
                src={src}
                srcSet={buildSrcSet(src)}
                sizes="(max-width: 768px) 100vw, 40vw"
                alt=""
                draggable="false"
              />
            );
          })()}
        </div>
      </div>
    </section>
  );
}