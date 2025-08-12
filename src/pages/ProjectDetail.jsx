import React from 'react';
import { useParams, Link } from 'react-router-dom';
import projects from '../data/projects.json';

export default function ProjectDetail() {
  const { id } = useParams();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div style={{ padding: '80px 24px' }}>
        <h1>找不到此專案</h1>
        <p>ID: {id}</p>
        <Link to="/projects">返回作品牆</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Link to="/projects">← 返回作品牆</Link>
      </div>
      <h1 style={{ marginBottom: 8 }}>{project.title}</h1>
      <div style={{ opacity: 0.6, marginBottom: 24 }}>{project.year}</div>
      <div style={{ display: 'grid', gap: 24 }}>
        {project.projectImages?.map((src, idx) => (
          <img key={idx} src={src} alt={`${project.title} ${idx + 1}`} />
        ))}
      </div>
      <p style={{ marginTop: 24 }}>{project.description}</p>
    </div>
  );
}


