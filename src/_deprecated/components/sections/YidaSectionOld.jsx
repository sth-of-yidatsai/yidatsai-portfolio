import React from "react";
import "./YidaSection.css";
import { useScrollDetection } from "../../../hooks/useHorizontalScroll";

export default function YidaSection({ index }) {
  const {
    isScrolling,
    horizontalDirection,
    verticalDirection,
    isInHorizontalSection,
  } = useScrollDetection();

  return (
    <div className={`hs-section yida-section hs-section-${index}`}>
      <div className="yida-grid">
        <div className="yida-name-block">
          <div className="yida-name-block-1"></div>
          <div className="yida-image-frame">
            <div className="yida-image-wrapper">
              <img
                src="/images/projects/project-005/project-005-img-12.webp"
                alt="yida"
                className={`yida-image ${
                  isScrolling
                    ? isInHorizontalSection
                      ? `scroll-horizontal-${horizontalDirection}`
                      : `scroll-vertical-${verticalDirection}`
                    : ""
                }`}
              />
            </div>
          </div>
          <div className="yida-name-block-2">
            <p className="yida-name">Yida Tsai</p>
          </div>
        </div>
        <div className="yida-image-block yida-image-block-1">
          <div className="yida-image-frame">
            <div className="yida-image-wrapper">
              <img
                src="/images/projects/project-005/project-005-img-08.webp"
                alt="yida"
                className={`yida-image ${
                  isScrolling
                    ? isInHorizontalSection
                      ? `scroll-horizontal-${horizontalDirection}`
                      : `scroll-vertical-${verticalDirection}`
                    : ""
                }`}
              />
            </div>
          </div>
        </div>
        <div className="yida-text-block yida-text-block-1">
          <div className="yida-about-me">
            <p className="about-me about-me-label">About</p>
            <div className="divider-vertical" />
            <p className="about-me about-me-text">
              Independent multidisciplinary designer, based in Taipei, Taiwan —
              working with brands and institutions across Asia–Pacific.
            </p>
            <div className="yida-image-frame">
              <div className="yida-image-wrapper">
                <img
                  src="/images/projects/project-005/project-005-img-06.webp"
                  alt="yida"
                  className={`yida-image ${
                    isScrolling
                      ? isInHorizontalSection
                        ? `scroll-horizontal-${horizontalDirection}`
                        : `scroll-vertical-${verticalDirection}`
                      : ""
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
