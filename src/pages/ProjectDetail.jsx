import React from 'react';
import { Link, useLoaderData } from 'react-router-dom';

export default function ProjectDetail() {
  const project = useLoaderData();

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


