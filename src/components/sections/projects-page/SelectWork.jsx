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
import "./SelectWork.css";

// ─── Work Selection Config ──────────────────────────────────────────────────
// Define which project and which image index appears in each card slot.
const SELECTED_WORKS = [
  "formosa-font",
  "patterned-glass-notebook",
  "foucault-book-binding",
  "patterned-glass-notebook",
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
  const cards = useMemo(() => buildCards(SELECTED_WORKS, projectsData), []);
  const N = cards.length;

  // Triple-clone the cards: [set0, set1(real), set2] for seamless infinite loop
  const displayCards = useMemo(
    () => [...cards, ...cards, ...cards],
    [cards]
  );

  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const autoTimer = useRef(null);

  const [offset, setOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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
    [getStep, N]
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



  return (
    <section className="select-work">
      <div className="select-work__header">
        <p className="select-work__eyebrow">Selected Projects</p>
      </div>

      <div className="select-work__viewport">
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
              onClick={(e) => { e.preventDefault(); handleCardClick(card); }}
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
