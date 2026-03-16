import React, { useMemo } from "react";
import "./LandscapeSection.css";
import projectsData from "../../../data/projects.json";
import { useImageParallax } from "../../../hooks/useImageParallax";
import cornerSvg from "../../../assets/icons/landscape-section-corner.svg";
import centerSvg from "../../../assets/icons/landscape-section-center.svg";

/** 逐字捲動（從下方捲入），用於圖片切換時的文字動畫 */
function RollingText({ children }) {
  return (
    <span className="ls-rolling-text" aria-label={children}>
      {[...children].map((char, i) =>
        char === " " ? (
          <span key={i} className="ls-rolling-space">&nbsp;</span>
        ) : (
          <span key={i} className="ls-rolling-letter" style={{ "--i": i }}>
            <span className="ls-rolling-top">{char}</span>
          </span>
        )
      )}
    </span>
  );
}

// ── Slide configuration — manage here for easy replacement ──
// Each slide: { projectId, imageIndex, leftLabel, rightLabel, caption }
const LANDSCAPE_SLIDES = [
  {
    projectId: "project-003",
    imageIndex: 8,
    leftLabel: "Product Design",
    rightLabel: "Product Design",
    caption: "(001)",
  },
  {
    projectId: "project-003",
    imageIndex: 2,
    leftLabel: "Editorial",
    rightLabel: "Editorial",
    caption: "(002)",
  },
  {
    projectId: "project-003",
    imageIndex: 0,
    leftLabel: "Illustration",
    rightLabel: "Illustration",
    caption: "(003)",
  },
];

function resolveSlide(cfg) {
  const project = projectsData.find((p) => p.id === cfg.projectId);
  return {
    image:
      project?.projectImages[cfg.imageIndex] ??
      project?.projectImages[0] ??
      "",
    leftLabel: cfg.leftLabel,
    rightLabel: cfg.rightLabel,
    caption: cfg.caption,
  };
}

export default function LandscapeSection({ index, landscapeProgress = 0 }) {
  const slides = useMemo(() => LANDSCAPE_SLIDES.map(resolveSlide), []);

  const { scrollClass } = useImageParallax();

  const NUM_TRANSITIONS = slides.length - 1; // 2

  // Which transition we're in (0 or 1)
  const transitionIndex =
    landscapeProgress >= 1
      ? NUM_TRANSITIONS - 1
      : Math.min(
          Math.floor(landscapeProgress * NUM_TRANSITIONS),
          NUM_TRANSITIONS - 1
        );

  // Progress within the current transition (0 → 1)
  const transitionProgress =
    landscapeProgress >= 1
      ? 1
      : landscapeProgress * NUM_TRANSITIONS - transitionIndex;

  const baseSlide = slides[transitionIndex];
  const incomingSlide = slides[Math.min(transitionIndex + 1, slides.length - 1)];

  // Scale of incoming image driven by scroll: 0 → 1
  const incomingScale = transitionProgress;

  // Text switches to incoming slide once it covers more than half the frame
  const activeSlide = transitionProgress >= 0.5 ? incomingSlide : baseSlide;

  // Key changes when activeSlide switches → React remounts → CSS roll-in triggers
  const activeSlideIndex = transitionIndex + (transitionProgress >= 0.5 ? 1 : 0);

  // Show overlay whenever a transition is in progress
  const showOverlay = transitionProgress > 0.001;

  return (
    <section className={`ls-section hs-section hs-section-${index}`}>
      {/* Side labels */}
      <span key={`left-${activeSlideIndex}`} className="ls-side-label ls-label-left">
        <RollingText>{activeSlide.leftLabel}</RollingText>
      </span>
      <span key={`right-${activeSlideIndex}`} className="ls-side-label ls-label-right">
        <RollingText>{activeSlide.rightLabel}</RollingText>
      </span>

      {/* Center content: image frame + caption */}
      <div className="ls-content">
        <div className="ls-frame-outer">
          {/* Corner decorations — corner SVG is bottom-right oriented; rotate for each corner */}
          <img src={cornerSvg} className="ls-deco ls-deco-tl" aria-hidden="true" draggable={false} />
          <img src={cornerSvg} className="ls-deco ls-deco-tr" aria-hidden="true" draggable={false} />
          <img src={cornerSvg} className="ls-deco ls-deco-bl" aria-hidden="true" draggable={false} />
          <img src={cornerSvg} className="ls-deco ls-deco-br" aria-hidden="true" draggable={false} />

          {/* Center decorations — top and bottom */}
          <img src={centerSvg} className="ls-deco ls-deco-tc" aria-hidden="true" draggable={false} />
          <img src={centerSvg} className="ls-deco ls-deco-bc" aria-hidden="true" draggable={false} />

          <div className="ls-image-frame">
            <div className={`ls-image-parallax-wrapper ${scrollClass}`}>
              {/* Base image — current slide */}
              <img
                src={baseSlide.image}
                alt={baseSlide.leftLabel}
                className="ls-image ls-image-base"
                draggable={false}
              />

              {/* Incoming image — scales from 0 to 1 (scroll-driven) */}
              {showOverlay && (
                <img
                  src={incomingSlide.image}
                  alt={incomingSlide.leftLabel}
                  className="ls-image ls-image-incoming"
                  style={{ transform: `scale(${incomingScale})` }}
                  draggable={false}
                />
              )}
            </div>
          </div>
        </div>

        {/* Caption below image */}
        <p key={`caption-${activeSlideIndex}`} className="ls-caption">
          <RollingText>{activeSlide.caption}</RollingText>
        </p>
      </div>
    </section>
  );
}
