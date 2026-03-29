import React, { useRef, useState, useEffect } from "react";
import "./FieldSection.css";
import { useImageParallax } from "../../../../hooks/useImageParallax";

/** 與 header-overlay-logo 相同的 line-roll 結構 */
function LineRoll({ children }) {
  return (
    <span className="line-roll">
      <span className="line-roll-top">{children}</span>
      <span className="line-roll-bottom" aria-hidden="true">{children}</span>
    </span>
  );
}

// ── 圖片配置 ── 統一管理，方便置換
const fieldConfig = [
  { projectId: "patterned-glass-notebook", image: "cover.webp", label: "(Product Design)" },
  { projectId: "patterned-glass-notebook", image: "02.webp",    label: "(Graphic Design)"  },
  { projectId: "patterned-glass-notebook", image: "04.webp",    label: "(Typography)"      },
  { projectId: "patterned-glass-notebook", image: "02.webp",    label: "(Poster Design)"   },
];

export default function FieldSection() {
  const { scrollClass } = useImageParallax();

  const images = fieldConfig.map((cfg) => ({
    src: `/images/projects/${cfg.projectId}/${cfg.image}`,
    label: cfg.label,
  }));

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
      { rootMargin: "-30% 0px -30% 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="fs-section">
      <div className="fs-grid">

        {/* Image 1 — Product Design (landscape, top-left, spans full height) */}
        <div className="fs-image-block fs-image-1">
          <div className="fs-image-frame">
            <div className="fs-image-wrapper">
              <img
                src={images[0].src}
                alt={images[0].label}
                className={`fs-image ${scrollClass}`}
              />
            </div>
          </div>
          <span className="fs-image-label">{images[0].label}</span>
        </div>

        {/* Image 2 — Graphic Design (portrait, top-right) */}
        <div className="fs-image-block fs-image-2">
          <div className="fs-image-frame">
            <div className="fs-image-wrapper">
              <img
                src={images[1].src}
                alt={images[1].label}
                className={`fs-image ${scrollClass}`}
              />
            </div>
          </div>
          <span className="fs-image-label">{images[1].label}</span>
        </div>

        {/* Image 3 — Typography (portrait, mid-left) */}
        <div className="fs-image-block fs-image-3">
          <div className="fs-image-frame">
            <div className="fs-image-wrapper">
              <img
                src={images[2].src}
                alt={images[2].label}
                className={`fs-image ${scrollClass}`}
              />
            </div>
          </div>
          <span className="fs-image-label">{images[2].label}</span>
        </div>

        {/* 中央文字欄 — Name 貼 Image 3 上邊，Bio 貼 Image 3 下邊 */}
        <div className="fs-center-col">
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
          <div className="fs-bio-block">
            <p className="fs-bio-text">
            Multidisciplinary Designer <br />
            based in Taipei. <br />
            Bridging Visual and Digital Experiences.
            </p>
            <p className="fs-bio-text-sub">
            From visual language to digital interaction.
            </p>
          </div>
        </div>

        {/* Image 4 — Poster Design (large, right) */}
        <div className="fs-image-block fs-image-4">
          <div className="fs-image-frame">
            <div className="fs-image-wrapper">
              <img
                src={images[3].src}
                alt={images[3].label}
                className={`fs-image ${scrollClass}`}
              />
            </div>
          </div>
          <span className="fs-image-label">{images[3].label}</span>
        </div>

      </div>
    </section>
  );
}