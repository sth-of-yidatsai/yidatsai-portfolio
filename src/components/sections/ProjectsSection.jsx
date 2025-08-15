import React from "react";
import projects from "../../data/projects.json";
import "./SectionBase.css";

export default function ProjectsSection({ config, index }) {
  // 內建配置
  const sectionConfig = {
    subtitle: "專案展示",
    content: "深入了解每個專案背後的故事。",
    bgColor: "#1a1a1a",
    textColor: "#ffffff",
  };

  return (
    <div
      className={`hs-section hs-section-${index} ${index > 0 ? "sticky" : ""}`}
      style={{
        backgroundColor: sectionConfig.bgColor,
        color: sectionConfig.textColor,
      }}
    >
      <div className="hs-section-content">
        <div className="hs-section-number">
          {String(index + 1).padStart(2, "0")}
        </div>
        <h2 className="hs-section-title">{config.title}</h2>
        <h3 className="hs-section-subtitle">{sectionConfig.subtitle}</h3>
        <p className="hs-section-text">{sectionConfig.content}</p>

        {/* Projects 特有的內容 - 保持原有的專案展示 */}
        <div className="hs-projects-grid">
          {projects.slice(0, 3).map((project, projectIndex) => (
            <div key={projectIndex} className="hs-project-item">
              <img
                src={project.projectImages?.[0]}
                alt={project.title}
                className="hs-project-img"
              />
              <div className="hs-project-title">{project.title}</div>
              <div className="hs-project-description">
                {project.description?.substring(0, 60)}...
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
