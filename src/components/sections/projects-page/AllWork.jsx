import { useEffect, useRef, useState, useCallback, memo, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import projectsData from "../../../data/projects.json";
import { buildSrcSet } from "../../../utils/imgSrcSet";
import { useParallaxRef } from "../../../hooks/useParallaxRef";
import { useTranslation } from "../../../hooks/useTranslation";
import { localizeProject } from "../../../utils/projectLocale";
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

// ─── 三欄 Masonry 排版計算 ────────────────────────────────────────────────────
// 以「寬度 = 1 單位」估算每張卡片的視覺高度比例，用來平衡三欄的總高度。
// 演算法：每次將下一張卡片放入「目前最矮」的欄位（貪婪最短欄）。
// 結果：三欄各自獨立堆疊，不會因為混排高矮卡片而產生大片空白。
const SIZE_HEIGHT = {
  landscape: 0.75,   // 4:3 — shorter
  portrait:  1.333,  // 3:4 — taller
  square:    1.0,    // 1:1 — medium
};

const COL_COUNT = 3;

function buildLayout(projects, colCount = COL_COUNT) {
  const cols = Array.from({ length: colCount }, () => []);
  const heights = Array(colCount).fill(0);
  for (const p of projects) {
    const h = SIZE_HEIGHT[p.size] ?? 0.75;
    const shortest = heights.indexOf(Math.min(...heights));
    cols[shortest].push(p);
    heights[shortest] += h;
  }
  return cols;
}

function useColCount() {
  const getCount = () => {
    if (typeof window === "undefined") return COL_COUNT;
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return COL_COUNT;
  };
  const [colCount, setColCount] = useState(getCount);
  useEffect(() => {
    const mq768  = window.matchMedia("(max-width: 768px)");
    const mq1024 = window.matchMedia("(max-width: 1024px)");
    const handler = () => setColCount(getCount());
    mq768.addEventListener("change", handler);
    mq1024.addEventListener("change", handler);
    return () => {
      mq768.removeEventListener("change", handler);
      mq1024.removeEventListener("change", handler);
    };
  }, []);
  return colCount;
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

const ProjectCard = memo(function ProjectCard({ project, onClick, cardRef }) {
  const imgSrc =
    project.cover === "placeholder.webp"
      ? `/images/projects/placeholder.webp`
      : `/images/projects/${project.id}/${project.cover}`;

  const orderNum = `(${String(project.order).padStart(3, "0")})`;
  const [frameRef, imgRef] = useParallaxRef(8);

  return (
    <a
      ref={cardRef}
      className={`all-work__card-wrap all-work__card-wrap--${project.size}`}
      href={`/projects/${project.id}`}
      onClick={(e) => { e.preventDefault(); onClick(); }}
      data-clickable
    >
      <div ref={frameRef} className="all-work__card">
        <img
          ref={imgRef}
          src={imgSrc}
          srcSet={buildSrcSet(imgSrc)}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={project.title}
          className="all-work__card-img"
          loading="lazy"
          draggable={false}
        />
      </div>

      <div className="all-work__caption">
        <span className="all-work__caption-title">{project.title}</span>
        <span className="all-work__caption-num">{orderNum}</span>
      </div>
    </a>
  );
});

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AllWork() {
  const navigate = useNavigate();
  const { lang = 'en', page: pageParam } = useParams();
  const { language, t } = useTranslation();

  const initialPage = Math.max(
    1,
    Math.min(parseInt(pageParam || "1", 10), TOTAL_PAGES)
  );
  const [visibleCount, setVisibleCount] = useState(initialPage * PAGE_SIZE);

  const cardRefsMap = useRef(new Map());
  const sentinelRef = useRef(null);

  const visibleProjects = useMemo(
    () => sortedProjects.slice(0, visibleCount).map((p) => localizeProject(p, language)),
    [visibleCount, language]
  );
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
    const base = `${origin}/${lang}/projects`;

    const newPath = currentPage > 1 ? `/${lang}/projects/page/${currentPage}` : `/${lang}/projects`;
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
  }, [currentPage, lang]);

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

  // ── Notify Lenis to recalculate scroll bounds after new content renders ───
  // Lenis's ResizeObserver watches document.documentElement's clientHeight
  // (viewport size), NOT scrollHeight. Dynamic content additions increase
  // scrollHeight but not clientHeight, so Lenis never updates its limit
  // automatically — scroll gets capped at the pre-load maximum.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
    return () => cancelAnimationFrame(raf);
  }, [visibleCount]);

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
  }, [visibleCount, hasMore]);

  const handleCardClick = useCallback(
    (project) => navigate(`/${lang}/projects/${project.id}`),
    [navigate, lang]
  );


  const colCount = useColCount();
  const cols = buildLayout(visibleProjects, colCount);

  return (
    <section className="all-work">
      <div className="all-work__header">
        <p className="all-work__eyebrow">{t('projectsPage.allEyebrow')}</p>
      </div>

      <div className="all-work__masonry">
        {cols.map((col, colIdx) => (
          <div key={colIdx} className="all-work__col">
            {col.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onClick={() => handleCardClick(p)}
                cardRef={(el) => { cardRefsMap.current.set(p.id, el); }}
              />
            ))}
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="all-work__sentinel" aria-hidden="true" />
    </section>
  );
}
