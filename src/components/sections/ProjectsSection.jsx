import React from "react";
import { useNavigate } from "react-router-dom";
import projects from "../../data/projects.json";
import "./SectionBase.css";

export default function ProjectsSection({ index }) {
  const navigate = useNavigate();

  // 自訂選擇四個專案對應區塊編號 1, 2, 3, 4
  const selectedProjects = [
    { blockNumber: "1", projectId: "project-001" }, // 區塊1 - GRAPHIC
    { blockNumber: "2", projectId: "project-002" }, // 區塊2 - UI.UX
    { blockNumber: "3", projectId: "project-003" }, // 區塊3 - BOOK
    { blockNumber: "4", projectId: "project-004" }, // 區塊4 - 3D ART
  ];

  // 自訂 project-label 文字
  const customLabels = {
    "project-001": "the notebook design",
    "project-002": "the book binding design",
    "project-003": "the font book design",
    "project-004": "the 3d botanical art",
  };

  // 自訂描述文字（因為不能過長）
  const customDescriptions = {
    "project-001":
      "comprises of three components: an outer box, a notebook, and a bookmark",
    "project-002":
      "comprises of three components: an outer box, a notebook, and a bookmark",
    "project-003":
      "comprises of three components: an outer box, a notebook, and a bookmark",
    "project-004":
      "comprises of three components: an outer box, a notebook, and a bookmark",
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div
      className={`hs-section projects-section hs-section-${index} ${
        index > 0 ? "sticky" : ""
      }`}
    >
      <div className="fullscreen-projects-content">
        {selectedProjects.map(({ blockNumber, projectId }) => {
          const project = projects.find((p) => p.id === projectId);
          if (!project) return null;

          return (
            <div
              key={blockNumber}
              className="fullscreen-project-block clickable"
              onClick={() => handleProjectClick(projectId)}
              style={{
                "--project-bg-image": `url(${project.projectImages?.[0]})`,
              }}
            >
              <div className="project-block-overlay">
                <div className="project-block-number-large">{blockNumber}</div>

                <div className="project-title-corner">
                  <span className="project-title-corner-title">Title: </span>
                  <span className="project-title-corner-text">
                    {project.title}
                  </span>
                </div>

                <div className="project-block-content-bottom">
                  <div className="project-category-large">
                    {project.category?.toUpperCase()}
                  </div>

                  <div className="project-info">
                    <div className="project-label">
                      {customLabels[projectId]}
                    </div>
                    <div className="project-description-small">
                      {customDescriptions[projectId]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
