import React, { useRef, useState, useEffect } from "react";
import "./FieldSection.css";
import { buildSrcSet } from "../../../../utils/imgSrcSet";
import { useParallaxRef } from "../../../../hooks/useParallaxRef";

/** 與 header-overlay-logo 相同的 line-roll 結構 */
function LineRoll({ children }) {
  return (
    <span className="line-roll">
      <span className="line-roll-top">{children}</span>
      <span className="line-roll-bottom" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}

// ── 圖片配置 ── 統一管理，方便置換
const fieldConfig = [
  {
    projectId: "foucault-book-binding",
    image: "08.webp",
    label: "(Editorial)",
  },
  {
    projectId: "patterned-glass-notebook",
    image: "16.webp",
    label: "(Texture)",
  },
  {
    projectId: "patterned-glass-notebook",
    image: "12.webp",
    label: "(Material)",
  },
  {
    projectId: "patterned-glass-notebook",
    image: "05.webp",
    label: "(Memory in Glass)",
  },
];

export default function FieldSection() {
  const images = fieldConfig.map((cfg) => ({
    src: `/images/projects/${cfg.projectId}/${cfg.image}`,
    label: cfg.label,
  }));

  const [frame1, img1] = useParallaxRef();
  const [frame2, img2] = useParallaxRef();
  const [frame3, img3] = useParallaxRef();
  const [frame4, img4] = useParallaxRef();

  // ── fs-name 進入畫面中央時觸發 line-roll 動畫 ──
  const nameRef = useRef(null);
  const [isNameInView, setIsNameInView] = useState(false);

  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNameInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-30% 0px -30% 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="fs-section">
      <div className="fs-grid">
        {/* Image 1 — Product Design (landscape, top-left, spans full height) */}
        <div className="fs-image-block fs-image-1">
          <div ref={frame1} className="fs-image-frame">
            <img
              ref={img1}
              src={images[0].src}
              alt={images[0].label}
              srcSet={buildSrcSet(images[0].src)}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="fs-image"
              loading="eager"
            />
          </div>
          <span className="fs-image-label">{images[0].label}</span>
        </div>

        {/* Image 2 — Graphic Design (portrait, top-right) */}
        <div className="fs-image-block fs-image-2">
          <div ref={frame2} className="fs-image-frame">
            <img
              ref={img2}
              src={images[1].src}
              alt={images[1].label}
              srcSet={buildSrcSet(images[1].src)}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="fs-image"
              loading="eager"
            />
          </div>
          <span className="fs-image-label">{images[1].label}</span>
        </div>

        {/* Image 3 — Typography (portrait, mid-left) */}
        <div className="fs-image-block fs-image-3">
          <div ref={frame3} className="fs-image-frame">
            <img
              ref={img3}
              src={images[2].src}
              alt={images[2].label}
              srcSet={buildSrcSet(images[2].src)}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="fs-image"
              loading="eager"
            />
          </div>
          <span className="fs-image-label">{images[2].label}</span>
        </div>

        {/* Name block */}
        <div className="fs-name-block">
          <div
            ref={nameRef}
            className={`fs-name${isNameInView ? " fs-name--in-view" : ""}`}
          >
            <LineRoll>YI</LineRoll>
            <LineRoll>DA</LineRoll>
            <LineRoll>TSAI</LineRoll>
          </div>
        </div>

        {/* Bio block */}
        <div className="fs-bio-block">
          <p className="fs-bio-text">
            Yi-Da Tsai｜蔡易達 <br />
            Visual Designer based in Taipei. <br />
            Focused on Typography & Editorial Design.
          </p>

          <p className="fs-bio-text-sub">
            Bridging visual language and digital experiences.
          </p>
        </div>

        {/* Image 4 — Poster Design (large, right) */}
        <div className="fs-image-block fs-image-4">
          <div ref={frame4} className="fs-image-frame">
            <img
              ref={img4}
              src={images[3].src}
              alt={images[3].label}
              srcSet={buildSrcSet(images[3].src)}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="fs-image"
              loading="eager"
            />
          </div>
          <span className="fs-image-label">{images[3].label}</span>
        </div>
      </div>
    </section>
  );
}
