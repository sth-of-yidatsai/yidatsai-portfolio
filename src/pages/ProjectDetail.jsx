import { Link, useLoaderData } from 'react-router-dom';
import BlockRenderer from '../components/blocks/BlockRenderer';
import './ProjectDetail.css';

export default function ProjectDetail() {
  const project = useLoaderData();

  if (project.blocks) {
    return (
      <main className="project-detail project-detail--blocks">
        <BlockRenderer blocks={project.blocks} project={project} />
      </main>
    );
  }

  // Fallback: no blocks defined — render plain image list
  return (
    <main className="project-detail project-detail--fallback">
      <div className="project-detail__back">
        <Link to="/projects">← Back</Link>
      </div>
      <h1 className="project-detail__title">{project.title}</h1>
      <p className="project-detail__year">{project.year}</p>
      {project.description && (
        <p className="project-detail__desc">{project.description}</p>
      )}
      <div className="project-detail__images">
        {project.images?.map((filename, idx) => (
          <img
            key={idx}
            src={`/images/projects/${project.id}/${filename}`}
            alt={`${project.title} ${idx + 1}`}
          />
        ))}
      </div>
    </main>
  );
}