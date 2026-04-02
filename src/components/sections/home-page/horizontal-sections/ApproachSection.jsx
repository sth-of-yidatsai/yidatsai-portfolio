import "./ApproachSection.css";
import { buildSrcSet } from "../../../../utils/imgSrcSet";
import { useHorizontalParallaxRef } from "../../../../hooks/useHorizontalParallaxRef";

// ── 圖片配置 ── 統一管理，方便置換
const approachConfig = {
  leftImage:  "/images/projects/foucault-book-binding/05.webp",
  rightImage: "/images/projects/foucault-book-binding/07.webp",
};

export default function ApproachSection({ index }) {
  const leftSrc  = approachConfig.leftImage;
  const rightSrc = approachConfig.rightImage;

  const [leftFrameRef,  leftWrapperRef]  = useHorizontalParallaxRef(5);
  const [rightFrameRef, rightWrapperRef] = useHorizontalParallaxRef(5);

  return (
    <section className={`as-section hs-section hs-section-${index}`}>

      {/* ── Left Panel ── */}
      <div className="as-left">
        <div className="as-left-content">

          {/* Small 1:1 image */}
          <div className="as-small-image">
            <div ref={leftFrameRef} className="as-image-frame">
              <div ref={leftWrapperRef} className="as-image-parallax-wrapper">
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
        <div ref={rightFrameRef} className="as-right-image-frame">
          <div ref={rightWrapperRef} className="as-right-image-parallax-wrapper">
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
