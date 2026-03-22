import { useEffect, useRef, useState, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import projectsData from "../../../data/projects.json";
import { useImageParallax } from "../../../hooks/useImageParallax";
import "./AllWork.css";

// ─── Config ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// 沒有明確指定 size 的作品，依照此節奏自動分配尺寸
const PATTERN = ["landscape", "portrait", "square", "landscape", "portrait", "landscape", "square", "portrait"];

let _pi = 0;
const sortedProjects = [...projectsData]
  .sort((a, b) => b.order - a.order)
  // 有 size 欄位的保留原值；沒有的依 PATTERN 循環補上
  .map((p) => (p.size ? p : { ...p, size: PATTERN[_pi++ % PATTERN.length] }));

const TOTAL = sortedProjects.length;
const TOTAL_PAGES = Math.ceil(TOTAL / PAGE_SIZE);

// ─── 雙欄 Masonry 排版計算 ────────────────────────────────────────────────────
// 以「寬度 = 1 單位」估算每張卡片的視覺高度比例，用來平衡兩欄的總高度。
// 演算法：每次將下一張卡片放入「目前較矮」的欄位（貪婪最短欄）。
// 結果：兩欄各自獨立堆疊，不會因為混排高矮卡片而產生大片空白。
const SIZE_HEIGHT = {
  landscape: 0.75,   // 4:3 — shorter
  portrait:  1.333,  // 3:4 — taller
  square:    1.0,    // 1:1 — medium
};

function buildLayout(projects) {
  const left = [], right = [];
  let leftH = 0, rightH = 0;
  for (const p of projects) {
    const h = SIZE_HEIGHT[p.size] ?? 0.75;
    // 放入較矮的欄位，讓兩欄高度盡量持平
    if (leftH <= rightH) { left.push(p); leftH += h; }
    else                 { right.push(p); rightH += h; }
  }
  return { left, right };
}

// ─── SEO <link> tag helpers ──────────────────────────────────────────────────

function setLinkTag(rel, href) {
  let el = document.querySelector(`link[data-aw][rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    el.setAttribute("data-aw", "");
    document.head.appendChild(el);
  }
  el.href = href;
}

function removeLinkTag(rel) {
  document.querySelector(`link[data-aw][rel="${rel}"]`)?.remove();
}

function removeAllLinkTags() {
  document.querySelectorAll("link[data-aw]").forEach((el) => el.remove());
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const ProjectCard = memo(function ProjectCard({ project, scrollClass, onClick, cardRef }) {
  const imgSrc =
    project.cover === "placeholder.webp"
      ? `/images/projects/placeholder.webp`
      : `/images/projects/${project.id}/${project.cover}`;

  const orderNum = `(${String(project.order).padStart(3, "0")})`;

  return (
    <div
      ref={cardRef}
      className={`all-work__card-wrap all-work__card-wrap--${project.size}`}
      onClick={onClick}
      data-clickable
    >
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

      <div className="all-work__caption">
        <span className="all-work__caption-title">{project.title}</span>
        <span className="all-work__caption-num">{orderNum}</span>
      </div>
    </div>
  );
});

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AllWork() {
  const navigate = useNavigate();
  const { page: pageParam } = useParams();
  const { scrollClass } = useImageParallax();

  const initialPage = Math.max(
    1,
    Math.min(parseInt(pageParam || "1", 10), TOTAL_PAGES)
  );
  const [visibleCount, setVisibleCount] = useState(initialPage * PAGE_SIZE);

  const cardRefsMap = useRef(new Map());
  const sentinelRef = useRef(null);

  const visibleProjects = sortedProjects.slice(0, visibleCount);
  const hasMore = visibleCount < TOTAL;
  const currentPage = Math.ceil(visibleCount / PAGE_SIZE);

  // ── URL sync + canonical / prev / next ────────────────────────────────────
  //
  // UX  → replaceState keeps the URL in sync as the user scrolls; no history
  //        entry, so Back button still works as expected.
  //
  // SEO → canonical points to the correct page URL (not always /).
  //        prev/next tell crawlers about the pagination chain.
  //        ⚠️  These tags are JS-rendered, so they're read by Google's
  //             second-wave render, not the initial HTML crawl.
  //             True SSR/SSG is needed for first-wave indexing.
  //
  useEffect(() => {
    const origin = window.location.origin;
    const base = `${origin}/projects`;

    const newPath = currentPage > 1 ? `/projects/page/${currentPage}` : "/projects";
    window.history.replaceState(null, "", newPath);

    setLinkTag("canonical", currentPage === 1 ? base : `${base}/page/${currentPage}`);

    if (currentPage > 1) {
      setLinkTag("prev", currentPage === 2 ? base : `${base}/page/${currentPage - 1}`);
    } else {
      removeLinkTag("prev");
    }

    if (currentPage < TOTAL_PAGES) {
      setLinkTag("next", `${base}/page/${currentPage + 1}`);
    } else {
      removeLinkTag("next");
    }

    return removeAllLinkTags;
  }, [currentPage]);

  // ── Scroll fade-in with per-batch stagger ─────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let batchIdx = 0;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.setProperty("--stagger-delay", `${batchIdx * 0.07}s`);
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
            batchIdx++;
          }
        });
      },
      { threshold: 0.08 }
    );

    cardRefsMap.current.forEach((el) => {
      if (el && !el.classList.contains("is-visible")) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [visibleProjects.length]);

  // ── Infinite scroll sentinel ──────────────────────────────────────────────
  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, TOTAL));
        }
      },
      { rootMargin: "0px 0px 300px 0px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  const handleCardClick = useCallback(
    (project) => navigate(`/projects/${project.id}`),
    [navigate]
  );

  const { left, right } = buildLayout(visibleProjects);

  return (
    <section className="all-work">
      <div className="all-work__header">
        <p className="all-work__eyebrow">All Projects</p>
      </div>

      <div className="all-work__masonry">
        <div className="all-work__col">
          {left.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              scrollClass={scrollClass}
              onClick={() => handleCardClick(p)}
              cardRef={(el) => { cardRefsMap.current.set(p.id, el); }}
            />
          ))}
        </div>
        <div className="all-work__col">
          {right.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              scrollClass={scrollClass}
              onClick={() => handleCardClick(p)}
              cardRef={(el) => { cardRefsMap.current.set(p.id, el); }}
            />
          ))}
        </div>
      </div>

      <div ref={sentinelRef} className="all-work__sentinel" aria-hidden="true" />
    </section>
  );
}
