import React from "react";
import { useLoaderData } from "react-router-dom";
import "./Projects.css";

export default function Projects() {
  const projects = useLoaderData() || [];

  return (
    <main className="projects-page">
      <h1 className="projects-title">Projects</h1>
      <div className="projects-list">
        {projects.map((project) => (
          <div key={project.id} className="projects-item">
            <span className="projects-item-title">{project.title}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
