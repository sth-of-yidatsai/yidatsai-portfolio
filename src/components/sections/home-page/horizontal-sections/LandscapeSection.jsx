import { useMemo, useRef, useState, useEffect } from "react";
import "./LandscapeSection.css";
import { buildSrcSet } from "../../../../utils/imgSrcSet";
import cornerSvg from "../../../../assets/icons/landscape-section-corner.svg";
import centerSvg from "../../../../assets/icons/landscape-section-center.svg";
import { useTranslation } from "../../../../hooks/useTranslation";

/** 逐字捲動（從下方捲入），用於圖片切換時的文字動畫 */
function RollingText({ children }) {
  const lines = children.split('\n').map(l => l.trim());
  let charIndex = 0;
  return (
    <span className="ls-rolling-text" aria-label={children}>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="ls-rolling-line">
          {[...line].map((char) => {
            const i = charIndex++;
            return char === " " ? (
              <span key={i} className="ls-rolling-space">&nbsp;</span>
            ) : (
              <span key={i} className="ls-rolling-letter" style={{ "--i": i }}>
                <span className="ls-rolling-top">{char}</span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

// ── Slide configuration — manage here for easy replacement ──
// Each slide: { image, leftLabel, rightLabel, caption }
const LANDSCAPE_SLIDES = [
  {
    image: "/images/projects/foucault-book-binding/09.webp",
    leftLabel: "Graphic",
    rightLabel: "Graphic",
    caption: "(001)",
  },
  {
    image: "/images/projects/foucault-book-binding/08.webp",
    leftLabel: "Poster",
    rightLabel: "Poster",
    caption: "(002)",
  },
  {
    image: "/images/projects/foucault-book-binding/01.webp",
    leftLabel: "Editorial",
    rightLabel: "Editorial",
    caption: "(003)",
  },
];

function resolveSlide(cfg) {
  return {
    image: cfg.image,
    leftLabel: cfg.leftLabel,
    rightLabel: cfg.rightLabel,
    caption: cfg.caption,
  };
}

export default function LandscapeSection({
  index,
  landscapeProgress = 0,
  landscapeFullscreenProgress = 0,
}) {
  const { locale } = useTranslation();
  const slides = useMemo(
    () => LANDSCAPE_SLIDES.map((cfg, i) => {
      const localeSlide = locale.landscape?.slides?.[i];
      return {
        ...resolveSlide(cfg),
        leftLabel:  localeSlide?.leftLabel  ?? cfg.leftLabel,
        rightLabel: localeSlide?.rightLabel ?? cfg.rightLabel,
      };
    }),
    [locale],
  );

  // Refs for measuring the actual frame position inside the section
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const [frameRect, setFrameRect] = useState(null);

  useEffect(() => {
    const measure = () => {
      if (!frameRef.current || !sectionRef.current) return;
      const fr = frameRef.current.getBoundingClientRect();
      const sr = sectionRef.current.getBoundingClientRect();
      setFrameRect({
        left: fr.left - sr.left,
        top: fr.top - sr.top,
        width: fr.width,
        height: fr.height,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const NUM_TRANSITIONS = slides.length - 1; // 2

  // Which transition we're in (0 or 1)
  const transitionIndex =
    landscapeProgress >= 1
      ? NUM_TRANSITIONS - 1
      : Math.min(
          Math.floor(landscapeProgress * NUM_TRANSITIONS),
          NUM_TRANSITIONS - 1,
        );

  // Progress within the current transition (0 → 1)
  const transitionProgress =
    landscapeProgress >= 1
      ? 1
      : landscapeProgress * NUM_TRANSITIONS - transitionIndex;

  const baseSlide = slides[transitionIndex];
  const incomingSlide =
    slides[Math.min(transitionIndex + 1, slides.length - 1)];

  // Scale of incoming image driven by scroll: 0 → 1
  const incomingScale = transitionProgress;

  // Text switches to incoming slide once it covers more than half the frame
  const activeSlide = transitionProgress >= 0.5 ? incomingSlide : baseSlide;

  // Key changes when activeSlide switches → React remounts → CSS roll-in triggers
  const activeSlideIndex =
    transitionIndex + (transitionProgress >= 0.5 ? 1 : 0);

  // Show overlay whenever a transition is in progress
  const showOverlay = transitionProgress > 0.001;

  // ── Fullscreen expand ─────────────────────────────────────────────
  const fsp = landscapeFullscreenProgress;
  const showFullscreen = fsp > 0.001;

  const VW = window.innerWidth;
  const VH = window.innerHeight;
  // Fallback rect when measurement hasn't completed yet
  const fr = frameRect ?? {
    left: 0.19 * VW,
    top: 0.315 * VH - 27,
    width: 0.62 * VW,
    height: 0.37 * VH,
  };

  // ── Overlay container clip-path: inset from frame bounds → inset(0) ──
  // This clips the bleed area so the overlay starts pixel-perfect at the frame edge.
  const ctLeft = fr.left * (1 - fsp);
  const ctTop = fr.top * (1 - fsp);
  const ctRight = (VW - fr.left - fr.width) * (1 - fsp);
  const ctBottom = (VH - fr.top - fr.height) * (1 - fsp);
  const overlayClip = `inset(${ctTop}px ${ctRight}px ${ctBottom}px ${ctLeft}px)`;

  // ── Overlay image: start at frame bounds → full ──
  const imgW0 = fr.width;
  const imgH0 = fr.height;
  const imgL0 = fr.left;
  const imgT0 = fr.top;
  const imgWidth = imgW0 + (VW - imgW0) * fsp;
  const imgHeight = imgH0 + (VH - imgH0) * fsp;
  const imgLeft = imgL0 * (1 - fsp);
  const imgTop = imgT0 * (1 - fsp);

  // Fade out UI in the first 40% of the fullscreen animation
  const uiOpacity = Math.max(0, 1 - fsp / 0.4);

  const lastSlide = slides[slides.length - 1];

  return (
    <section
      ref={sectionRef}
      className={`ls-section hs-section hs-section-${index}`}
    >
      {/* Side labels */}
      <span
        key={`left-${activeSlideIndex}`}
        className="ls-side-label ls-label-left"
        style={{ opacity: uiOpacity }}
      >
        <RollingText>{activeSlide.leftLabel}</RollingText>
      </span>
      <span
        key={`right-${activeSlideIndex}`}
        className="ls-side-label ls-label-right"
        style={{ opacity: uiOpacity }}
      >
        <RollingText>{activeSlide.rightLabel}</RollingText>
      </span>

      {/* Center content: image frame + caption */}
      <div className="ls-content" style={{ opacity: uiOpacity }}>
        <div className="ls-frame-outer">
          {/* Corner decorations — corner SVG is bottom-right oriented; rotate for each corner */}
          <img
            src={cornerSvg}
            className="ls-deco ls-deco-tl"
            aria-hidden="true"
            draggable={false}
          />
          <img
            src={cornerSvg}
            className="ls-deco ls-deco-tr"
            aria-hidden="true"
            draggable={false}
          />
          <img
            src={cornerSvg}
            className="ls-deco ls-deco-bl"
            aria-hidden="true"
            draggable={false}
          />
          <img
            src={cornerSvg}
            className="ls-deco ls-deco-br"
            aria-hidden="true"
            draggable={false}
          />

          {/* Center decorations — top and bottom */}
          <img
            src={centerSvg}
            className="ls-deco ls-deco-tc"
            aria-hidden="true"
            draggable={false}
          />
          <img
            src={centerSvg}
            className="ls-deco ls-deco-bc"
            aria-hidden="true"
            draggable={false}
          />

          <div ref={frameRef} className="ls-image-frame">
            <div className="ls-image-parallax-wrapper">
              {/* Base image — current slide */}
              <img
                src={baseSlide.image}
                srcSet={buildSrcSet(baseSlide.image)}
                sizes="(max-width: 768px) 100vw, 60vw"
                alt={baseSlide.leftLabel}
                className="ls-image ls-image-base"
                draggable={false}
              />

              {/* Incoming image — scales from 0 to 1 (scroll-driven) */}
              {showOverlay && (
                <img
                  src={incomingSlide.image}
                  srcSet={buildSrcSet(incomingSlide.image)}
                  sizes="(max-width: 768px) 100vw, 60vw"
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

      {/* Mobile filmstrip (≤1024px) — CSS scroll-snap, no JS state */}
      <div className="ls-mobile-filmstrip">
        {slides.map((slide, i) => (
          <div key={i} className="ls-mobile-filmstrip-slide">
            <img
              src={slide.image}
              srcSet={buildSrcSet(slide.image)}
              sizes="80vw"
              alt={slide.leftLabel}
              className="ls-mobile-filmstrip-img"
              draggable={false}
            />
            <div className="ls-mobile-filmstrip-meta">
              <span className="ls-mobile-filmstrip-name">{slide.leftLabel}</span>
              <span className="ls-mobile-filmstrip-num">{slide.caption}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen overlay — 3rd image grows from exact frame position to full section */}
      {showFullscreen && (
        <div
          className="ls-fullscreen-overlay"
          style={{ clipPath: overlayClip }}
        >
          <img
            src={lastSlide.image}
            srcSet={buildSrcSet(lastSlide.image)}
            sizes="100vw"
            alt={lastSlide.leftLabel}
            className="ls-fullscreen-img"
            style={{
              left: `${imgLeft}px`,
              top: `${imgTop}px`,
              width: `${imgWidth}px`,
              height: `${imgHeight}px`,
            }}
            draggable={false}
          />
        </div>
      )}
    </section>
  );
}
