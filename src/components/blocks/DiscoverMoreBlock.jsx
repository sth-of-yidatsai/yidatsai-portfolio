import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import projectsData from "../../data/projects.json";
import { buildSrcSet } from "../../utils/imgSrcSet";
import { useParallaxRef } from "../../hooks/useParallaxRef";
import "./DiscoverMoreBlock.css";

function pickProjects(currentId) {
  const current = projectsData.find((p) => p.id === currentId);
  const categories = current?.category ?? [];

  const others = projectsData.filter((p) => p.id !== currentId);

  const matching = others.filter((p) =>
    p.category?.some((c) => categories.includes(c))
  );
  const nonMatching = others.filter(
    (p) => !p.category?.some((c) => categories.includes(c))
  );

  const shuffledMatching = [...matching].sort(() => Math.random() - 0.5);
  const shuffledRest = [...nonMatching].sort(() => Math.random() - 0.5);

  return [...shuffledMatching, ...shuffledRest].slice(0, 3);
}

const DiscoverMoreCard = memo(function DiscoverMoreCard({ project, onClick }) {
  const imgSrc =
    project.cover === "placeholder.webp"
      ? `/images/projects/placeholder.webp`
      : `/images/projects/${project.id}/${project.cover}`;

  const orderNum = `(${String(project.order).padStart(3, "0")})`;
  const [frameRef, imgRef] = useParallaxRef(8);

  return (
    <a
      className="discover-more__card-wrap"
      href={`/projects/${project.id}`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      data-clickable
    >
      <div ref={frameRef} className="discover-more__card">
        <img
          ref={imgRef}
          src={imgSrc}
          srcSet={buildSrcSet(imgSrc)}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={project.title}
          className="discover-more__card-img"
          loading="lazy"
          draggable={false}
        />
      </div>
      <div className="discover-more__caption">
        <span className="discover-more__caption-num">{orderNum}</span>
        <span className="discover-more__caption-title">{project.title}</span>
      </div>
    </a>
  );
});

function DiscoverMoreBlock({ currentId }) {
  const navigate = useNavigate();

  const picks = useMemo(() => pickProjects(currentId), [currentId]);

  return (
    <section className="block block--discover-more">
      <h2 className="discover-more__heading">Discover More</h2>
      <div className="discover-more__grid">
        {picks.map((project) => (
          <DiscoverMoreCard
            key={project.id}
            project={project}
            onClick={() => navigate(`/projects/${project.id}`)}
          />
        ))}
      </div>
    </section>
  );
}

export default memo(DiscoverMoreBlock);
