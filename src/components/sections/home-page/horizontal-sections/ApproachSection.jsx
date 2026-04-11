import { Fragment } from "react";
import "./ApproachSection.css";
import { buildSrcSet } from "../../../../utils/imgSrcSet";
import { useHorizontalParallaxRef } from "../../../../hooks/useHorizontalParallaxRef";
import { useTranslation } from "../../../../hooks/useTranslation";
import BilingTitle from "../../../BilingTitle";

// ── 圖片配置 ── 統一管理，方便置換
const approachConfig = {
  leftImage: "/images/projects/foucault-book-binding/06.webp",
  rightImage: "/images/projects/foucault-book-binding/20.webp",
};

export default function ApproachSection({ index }) {
  const { t, locale } = useTranslation();
  const leftSrc = approachConfig.leftImage;
  const rightSrc = approachConfig.rightImage;

  const [leftFrameRef, leftWrapperRef] = useHorizontalParallaxRef(5);
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
            <BilingTitle
              en={t('approach.title')}
              zh={locale.approach?.titleZh ?? null}
              className="as-title"
            />
            <span className="as-rule" />
            {[t('approach.body1'), t('approach.body2')].map((text, pi) => (
              <p key={pi} className="as-body">
                {text.split('\n').map((line, li, arr) => (
                  <Fragment key={li}>{line}{li < arr.length - 1 && <br />}</Fragment>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="as-right">
        <div ref={rightFrameRef} className="as-right-image-frame">
          <div
            ref={rightWrapperRef}
            className="as-right-image-parallax-wrapper"
          >
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
