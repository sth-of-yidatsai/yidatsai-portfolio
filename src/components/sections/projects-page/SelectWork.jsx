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
import { buildSrcSet } from "../../../utils/imgSrcSet";
import { useTranslation } from "../../../hooks/useTranslation";
import { localizeProject } from "../../../utils/projectLocale";
import "./SelectWork.css";

// ─── Work Selection Config ──────────────────────────────────────────────────
// Each entry: { id: "project-id", image: "filename.webp" }
// `image` is the filename inside /images/projects/<id>/ — pick any project image freely.
const SELECTED_WORKS = [
  { id: "formosa-font", image: "03.webp" },
  { id: "patterned-glass-notebook", image: "16.webp" },
  { id: "foucault-book-binding", image: "01.webp" },
  { id: "patterned-glass-notebook", image: "08.webp" },
  { id: "foucault-book-binding", image: "06.webp" },
];
// ───────────────────────────────────────────────────────────────────────────

const CARD_GAP = 16; // px — must stay in sync with CSS `gap: 16px`
const AUTO_MS = 6000;
const ANIM_MS = 1900; // slightly longer than CSS transition (1800ms) to fire after animation ends

function buildCards(config, data, language) {
  return config
    .map(({ id: projectId, image: imageFile }, i) => {
      const p = data.find((x) => x.id === projectId);
      if (!p) return null;
      const lp = localizeProject(p, language);
      return {
        id: lp.id,
        title: lp.title,
        description: lp.description,
        image: `/images/projects/${lp.id}/${imageFile}`,
        number: `(${String(i + 1).padStart(2, "0")})`,
      };
    })
    .filter(Boolean);
}

export default function SelectWork() {
  const navigate = useNavigate();
  const { language, t } = useTranslation();
  const cards = useMemo(() => buildCards(SELECTED_WORKS, projectsData, language), [language]);
  const N = cards.length;

  // Triple-clone the cards: [set0, set1(real), set2] for seamless infinite loop
  const displayCards = useMemo(() => [...cards, ...cards, ...cards], [cards]);

  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const offsetRef = useRef(0);
  const autoTimer = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startOffset: 0, hasMoved: false });

  const [offset, setOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const getStep = useCallback(() => {
    const card = trackRef.current?.querySelector(".select-work__card-wrap");
    return card ? card.offsetWidth + CARD_GAP : 0;
  }, []);

  // Animate to a target offset, then silently teleport to equivalent middle-set position
  const animateTo = useCallback(
    (targetOffset) => {
      offsetRef.current = targetOffset;
      setOffset(targetOffset);
      setIsAnimating(true);

      setTimeout(() => {
        setIsAnimating(false);

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
    [getStep, N],
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

  const handleCardClick = (card) => {
    navigate(`/projects/${card.id}`);
  };

  // ─── Drag / swipe handlers ─────────────────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault(); // prevent browser native drag on <a> / <img>
    e.currentTarget.setPointerCapture(e.pointerId);
    clearInterval(autoTimer.current);
    dragRef.current = { active: true, startX: e.clientX, startOffset: offsetRef.current, hasMoved: false };
    setIsAnimating(false);
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    const delta = e.clientX - dragRef.current.startX;
    if (Math.abs(delta) > 5) dragRef.current.hasMoved = true;
    const newOffset = dragRef.current.startOffset - delta;
    offsetRef.current = newOffset;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-newOffset}px)`;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setIsDragging(false);
    const step = getStep();
    if (!step) return;
    const snapIdx = Math.round(offsetRef.current / step);
    animateTo(snapIdx * step);
    startAutoAdvance();
  }, [animateTo, getStep, startAutoAdvance]);
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <section className="select-work">
      <div className="select-work__header">
        <p className="select-work__eyebrow">{t('projectsPage.selectEyebrow')}</p>
      </div>

      <div
        ref={viewportRef}
        className={`select-work__viewport${isDragging ? " is-dragging" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={trackRef}
          className={`select-work__track${isAnimating ? " is-animating" : ""}`}
          style={{ transform: `translateX(${-offset}px)` }}
        >
          {displayCards.map((card, i) => (
            <a
              key={i}
              className="select-work__card-wrap"
              href={`/projects/${card.id}`}
              draggable={false}
              onClick={(e) => {
                e.preventDefault();
                if (!dragRef.current.hasMoved) handleCardClick(card);
              }}
              data-clickable
            >
              <div className="select-work__card">
                <div className="select-work__card-img-wrapper">
                  <img
                    src={card.image}
                    srcSet={buildSrcSet(card.image)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    alt={card.title}
                    className="select-work__card-img"
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
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
