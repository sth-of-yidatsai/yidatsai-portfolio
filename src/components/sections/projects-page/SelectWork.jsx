import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import projectsData from "../../../data/projects.json";
import { useImageParallax } from "../../../hooks/useImageParallax";
import "./SelectWork.css";

// ─── Work Selection Config ──────────────────────────────────────────────────
// Define which project and which image index appears in each card slot.
const SELECTED_WORKS = [
  "formosa-font",
  "taiwan-glass-notebook",
  "foucault-book-binding",
  "taiwan-glass-notebook",
  "foucault-book-binding",
];
// ───────────────────────────────────────────────────────────────────────────

const CARD_GAP = 16; // px — must stay in sync with CSS `gap: 16px`
const AUTO_MS = 6000;
const ANIM_MS = 1900; // slightly longer than CSS transition (1800ms) to fire after animation ends

function buildCards(config, data) {
  return config
    .map((projectId, i) => {
      const p = data.find((x) => x.id === projectId);
      if (!p) return null;
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        image: `/images/projects/${p.id}/${p.cover}`,
        number: `(${String(i + 1).padStart(2, "0")})`,
      };
    })
    .filter(Boolean);
}

export default function SelectWork() {
  const navigate = useNavigate();
  const { scrollClass } = useImageParallax();
  const cards = useMemo(() => buildCards(SELECTED_WORKS, projectsData), []);
  const N = cards.length;

  // Triple-clone the cards: [set0, set1(real), set2] for seamless infinite loop
  const displayCards = useMemo(
    () => [...cards, ...cards, ...cards],
    [cards]
  );

  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const didDrag = useRef(false);
  const autoTimer = useRef(null);
  const endDragRef = useRef(null);
  const carouselDirRef = useRef(""); // tracks last set direction to skip redundant setState
  const carouselParallaxTimer = useRef(null);

  const [offset, setOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [carouselDirection, setCarouselDirection] = useState(""); // "left" | "right" | ""

  // Activate carousel parallax in given direction
  const applyCarouselParallax = useCallback((dir) => {
    clearTimeout(carouselParallaxTimer.current);
    if (carouselDirRef.current !== dir) {
      carouselDirRef.current = dir;
      setCarouselDirection(dir);
    }
  }, []);

  // Clear carousel parallax after optional delay
  const clearCarouselParallax = useCallback((delay = 0) => {
    clearTimeout(carouselParallaxTimer.current);
    carouselParallaxTimer.current = setTimeout(() => {
      carouselDirRef.current = "";
      setCarouselDirection("");
    }, delay);
  }, []);

  const getStep = useCallback(() => {
    const card = trackRef.current?.querySelector(".select-work__card-wrap");
    return card ? card.offsetWidth + CARD_GAP : 0;
  }, []);

  // Animate to a target offset, then silently teleport to equivalent middle-set position
  const animateTo = useCallback(
    (targetOffset) => {
      // Apply parallax in the direction of travel
      const dir = targetOffset > offsetRef.current ? "left" : "right";
      applyCarouselParallax(dir);

      offsetRef.current = targetOffset;
      setOffset(targetOffset);
      setIsAnimating(true);

      setTimeout(() => {
        setIsAnimating(false);
        clearCarouselParallax(0);

        const step = getStep();
        if (!step) return;

        const idx = Math.round(targetOffset / step);
        let corrected = idx;
        if (idx >= 2 * N) corrected = idx - N;
        else if (idx < N) corrected = idx + N;

        if (corrected !== idx) {
          const correctedOffset = corrected * step;
          offsetRef.current = correctedOffset;
          // No setIsAnimating(true) — silent jump, no transition
          setOffset(correctedOffset);
        }
      }, ANIM_MS);
    },
    [getStep, N, applyCarouselParallax, clearCarouselParallax]
  );

  const startAutoAdvance = useCallback(() => {
    clearInterval(autoTimer.current);
    autoTimer.current = setInterval(() => {
      const step = getStep();
      if (!step) return;
      const currentIdx = Math.round(offsetRef.current / step);
      animateTo((currentIdx + 1) * step);
    }, AUTO_MS);
  }, [animateTo, getStep]);

  // Set initial position to middle clone set after DOM is ready (no flash).
  // Empty deps is intentional — runs once on mount only.
  useLayoutEffect(() => {
    const step = getStep();
    if (!step) return;
    const initialOffset = N * step;
    offsetRef.current = initialOffset;
    setOffset(initialOffset);
  }, [N, getStep]);

  useEffect(() => {
    startAutoAdvance();
    return () => clearInterval(autoTimer.current);
  }, [startAutoAdvance]);

  // Global mouseup to end drag even if released outside viewport
  endDragRef.current = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    const step = getStep();
    if (!step) return;
    const snapped = Math.max(
      0,
      Math.min(
        Math.round(offsetRef.current / step),
        displayCards.length - 1
      )
    );
    animateTo(snapped * step);
    startAutoAdvance();
  };

  useEffect(() => {
    const handler = () => endDragRef.current?.();
    window.addEventListener("mouseup", handler);
    return () => window.removeEventListener("mouseup", handler);
  }, []);

  // ── Mouse drag ──────────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    draggingRef.current = true;
    setIsDragging(true);
    didDrag.current = false;
    dragStartX.current = e.clientX;
    dragStartOffset.current = offsetRef.current;
    clearInterval(autoTimer.current);
    setIsAnimating(false);
  };

  const onMouseMove = (e) => {
    if (!draggingRef.current) return;
    const dx = dragStartX.current - e.clientX;
    if (Math.abs(dx) > 5) {
      didDrag.current = true;
      applyCarouselParallax(dx > 0 ? "left" : "right");
    }
    const max = (displayCards.length - 1) * getStep();
    const newOffset = Math.max(0, Math.min(dragStartOffset.current + dx, max));
    offsetRef.current = newOffset;
    setOffset(newOffset);
  };

  // ── Touch drag ──────────────────────────────────────────────────────────
  const onTouchStart = (e) => {
    draggingRef.current = true;
    setIsDragging(true);
    didDrag.current = false;
    dragStartX.current = e.touches[0].clientX;
    dragStartOffset.current = offsetRef.current;
    clearInterval(autoTimer.current);
    setIsAnimating(false);
  };

  const onTouchMove = (e) => {
    if (!draggingRef.current) return;
    const dx = dragStartX.current - e.touches[0].clientX;
    if (Math.abs(dx) > 5) {
      didDrag.current = true;
      applyCarouselParallax(dx > 0 ? "left" : "right");
    }
    const max = (displayCards.length - 1) * getStep();
    const newOffset = Math.max(0, Math.min(dragStartOffset.current + dx, max));
    offsetRef.current = newOffset;
    setOffset(newOffset);
  };

  const onTouchEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    const step = getStep();
    if (!step) return;
    const snapped = Math.max(
      0,
      Math.min(
        Math.round(offsetRef.current / step),
        displayCards.length - 1
      )
    );
    animateTo(snapped * step);
    startAutoAdvance();
  };

  const handleCardClick = (card) => {
    if (didDrag.current) return;
    navigate(`/projects/${card.id}`);
  };

  return (
    <section className="select-work">
      <div className="select-work__header">
        <p className="select-work__eyebrow">Selected Works</p>
      </div>

      <div
        className={`select-work__viewport${isDragging ? " is-dragging" : ""}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={trackRef}
          className={`select-work__track${isAnimating ? " is-animating" : ""}`}
          style={{ transform: `translateX(${-offset}px)` }}
        >
          {displayCards.map((card, i) => (
            <div
              key={i}
              className="select-work__card-wrap"
              onClick={() => handleCardClick(card)}
              data-clickable
            >
              <div className="select-work__card">
                <div className="select-work__card-img-wrapper">
                  <img
                    src={card.image}
                    alt={card.title}
                    className={`select-work__card-img${
                      carouselDirection
                        ? ` scroll-horizontal-${carouselDirection}`
                        : scrollClass
                        ? ` ${scrollClass}`
                        : ""
                    }`}
                    draggable={false}
                  />
                </div>
                <div className="select-work__card-overlay">
                  <h3 className="select-work__card-title">{card.title}</h3>
                  <span className="select-work__card-rule" />
                  <p className="select-work__card-desc">{card.description}</p>
                </div>
              </div>
              <span className="select-work__card-number">{card.number}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
