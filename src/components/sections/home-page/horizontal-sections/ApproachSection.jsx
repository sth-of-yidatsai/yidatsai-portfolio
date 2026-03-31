import React from "react";
import "./ApproachSection.css";
import { buildSrcSet } from "../../../../utils/imgSrcSet";

// ── 圖片配置 ── 統一管理，方便置換
const approachConfig = {
  leftImage:  "/images/projects/foucault-book-binding/05.webp",
  rightImage: "/images/projects/foucault-book-binding/07.webp",
};

export default function ApproachSection({ index }) {
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
                  srcSet={buildSrcSet(leftSrc)}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  alt="Design approach"
                  className="as-image"
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
              srcSet={buildSrcSet(rightSrc)}
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="Design work"
              className="as-right-image"
            />
          </div>
        </div>


      </div>

    </section>
  );
}
