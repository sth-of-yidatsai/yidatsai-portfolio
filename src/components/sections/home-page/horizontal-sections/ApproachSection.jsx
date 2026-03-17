import React from "react";
import "./ApproachSection.css";
import { useImageParallax } from "../../../../hooks/useImageParallax";

// ── 圖片配置 ── 統一管理，方便置換
const approachConfig = {
  leftImage:  "/images/projects/foucault-book-binding/05.webp",
  rightImage: "/images/projects/foucault-book-binding/07.webp",
};

export default function ApproachSection({ index }) {
  const { scrollClass } = useImageParallax();

  const leftSrc  = approachConfig.leftImage;
  const rightSrc = approachConfig.rightImage;

  return (
    <section className={`as-section hs-section hs-section-${index}`}>

      {/* ── Left Panel ── */}
      <div className="as-left">
        <div className="as-left-content">

          {/* Small 1:1 image */}
          <div className="as-small-image">
            <div className="as-image-frame">
              <div className="as-image-wrapper">
                <img
                  src={leftSrc}
                  alt="Design approach"
                  className={`as-image ${scrollClass}`}
                />
              </div>
            </div>
          </div>

          {/* Text block */}
          <div className="as-text-block">
            <h2 className="as-title">Design Approach</h2>
            <span className="as-rule" />
            <p className="as-body">
              Each project begins with an idea and evolves
              <br />through structure, material and detail.
            </p>
            <p className="as-body">
              By balancing aesthetics and logic,
              <br />the design forms a clear and meaningful
              <br />experience.
            </p>
          </div>

        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="as-right">

        {/* Full-bleed background image */}
        <div className="as-right-image-frame">
          <div className="as-right-image-wrapper">
            <img
              src={rightSrc}
              alt="Design work"
              className={`as-right-image ${scrollClass}`}
            />
          </div>
        </div>

        {/* 1:1 glass overlay block — bottom-left corner, contains all timeline elements */}
        <div className="as-glass-block">

          {/* Diagonal timeline SVG */}
          <svg
            className="as-timeline-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* 左下角 → 中心留空 */}
            <line
              x1="4"  y1="96"
              x2="41" y2="59"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
            {/* 右上角 → 中心留空 */}
            <line
              x1="96" y1="4"
              x2="59" y2="41"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Year and tagline labels */}
          <span className="as-year as-year-start">(2018)</span>
          <span className="as-tagline">Creative Process</span>
          <span className="as-year as-year-end">(2026)</span>

        </div>

      </div>

    </section>
  );
}
