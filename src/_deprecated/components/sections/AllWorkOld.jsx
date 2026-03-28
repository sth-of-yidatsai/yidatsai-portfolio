import { useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import projectsData from "../../../data/projects.json";
import { useImageParallax } from "../../../hooks/useImageParallax";
import iconFirst from "../../../assets/icons/first_page_24dp_2D2D2D_FILL0_wght400_GRAD0_opsz24.svg";
import iconLast from "../../../assets/icons/last_page_24dp_2D2D2D_FILL0_wght400_GRAD0_opsz24.svg";
import iconPrev from "../../../assets/icons/chevron_backward_24dp_2D2D2D_FILL0_wght400_GRAD0_opsz24.svg";
import iconNext from "../../../assets/icons/chevron_forward_24dp_2D2D2D_FILL0_wght400_GRAD0_opsz24.svg";
import "./AllWork.css";

// ─── Config ─────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 8;

// Sort descending by order — done once at module level
const sortedProjects = [...projectsData].sort((a, b) => b.order - a.order);

// ─── Sub-components ──────────────────────────────────────────────────────────

function SquareDots({ count = 3 }) {
  return (
    <span className="all-work__dots" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="all-work__dot" />
      ))}
    </span>
  );
}

const ProjectCard = memo(function ProjectCard({ project, scrollClass, onClick }) {
  const orderNum = `(${String(project.order).padStart(3, "0")})`;
  // Placeholder images live at the projects root, real covers in their subfolder
  const imgSrc =
    project.cover === "placeholder.webp"
      ? `/images/projects/placeholder.webp`
      : `/images/projects/${project.id}/${project.cover}`;

  return (
    <div className="all-work__card-wrap" onClick={onClick} data-clickable>
      <div className="all-work__card">
        <div className="all-work__card-img-wrapper">
          <img
            src={imgSrc}
            alt={project.title}
            className={`all-work__card-img${scrollClass ? ` ${scrollClass}` : ""}`}
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>
      <div className="all-work__card-info">
        <span className="all-work__card-number">{orderNum}</span>
        <span className="all-work__card-title">{project.title}</span>
      </div>
    </div>
  );
});

// ─── Pagination ──────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onGoTo }) {
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <nav className="all-work__pagination" aria-label="Pagination">
      {/* First page */}
      <button
        className="all-work__page-btn all-work__page-btn--nav"
        onClick={() => onGoTo(1)}
        disabled={page === 1}
        aria-label="First page"
      >
        <img src={iconFirst} alt="" />
      </button>

      {/* Prev page */}
      <button
        className="all-work__page-btn all-work__page-btn--nav"
        onClick={() => onGoTo(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <img src={iconPrev} alt="" />
      </button>

      {/* Prev page number or single dot placeholder */}
      {prevPage ? (
        <button
          className="all-work__page-btn all-work__page-btn--adjacent"
          onClick={() => onGoTo(prevPage)}
        >
          {String(prevPage).padStart(2, "0")}
        </button>
      ) : (
        <span className="all-work__page-placeholder">
          <SquareDots count={1} />
        </span>
      )}

      {/* Current page */}
      <button
        className="all-work__page-btn all-work__page-btn--current"
        aria-current="page"
        disabled
      >
        {String(page).padStart(2, "0")}
      </button>

      {/* Next page number or single dot placeholder */}
      {nextPage ? (
        <button
          className="all-work__page-btn all-work__page-btn--adjacent"
          onClick={() => onGoTo(nextPage)}
        >
          {String(nextPage).padStart(2, "0")}
        </button>
      ) : (
        <span className="all-work__page-placeholder">
          <SquareDots count={1} />
        </span>
      )}

      {/* Next page */}
      <button
        className="all-work__page-btn all-work__page-btn--nav"
        onClick={() => onGoTo(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <img src={iconNext} alt="" />
      </button>

      {/* Last page */}
      <button
        className="all-work__page-btn all-work__page-btn--nav"
        onClick={() => onGoTo(totalPages)}
        disabled={page === totalPages}
        aria-label="Last page"
      >
        <img src={iconLast} alt="" />
      </button>
    </nav>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AllWork() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { scrollClass } = useImageParallax();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const sectionRef = useRef(null);
  const isFirstRender = useRef(true);

  const totalPages = Math.ceil(sortedProjects.length / ITEMS_PER_PAGE);

  const pageProjects = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return sortedProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [page]);

  // After page changes, inject the target position into the smooth scroll system
  // via CustomEvent so the eased animation runs from wherever the user is now.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!sectionRef.current) return;
    const top = sectionRef.current.getBoundingClientRect().top + window.scrollY;
    window.dispatchEvent(new CustomEvent("smoothScrollTo", { detail: { top, ease: 0.03 } }));
  }, [page]);

  const goTo = useCallback((p) => {
    setSearchParams({ page: p });
  }, [setSearchParams]);

  const handleCardClick = useCallback(
    (project) => {
      navigate(`/projects/${project.id}`);
    },
    [navigate]
  );

  return (
    <section className="all-work" ref={sectionRef}>
      <div className="all-work__header">
        <p className="all-work__eyebrow">All Works</p>
      </div>

      <div className="all-work__grid">
        {pageProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            scrollClass={scrollClass}
            onClick={() => handleCardClick(project)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onGoTo={goTo} />
      )}
    </section>
  );
}