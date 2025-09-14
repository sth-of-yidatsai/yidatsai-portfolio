import React from "react";
import { useNavigate } from "react-router-dom";
import projects from "../../../data/projects.json";
import "./ProjectsSection.css";

export default function ProjectsSection({ index }) {
  const navigate = useNavigate();

  // 專案配置 - 指定專案ID和圖片索引
  const projectConfig = React.useMemo(
    () => [
      { blockNumber: "1", projectId: "project-004", imageIndex: 9 }, // 區塊1
      { blockNumber: "2", projectId: "project-005", imageIndex: 3 }, // 區塊2
      { blockNumber: "3", projectId: "project-003", imageIndex: 15 }, // 區塊3
      { blockNumber: "4", projectId: "project-002", imageIndex: 1 }, // 區塊4
    ],
    []
  );

  // PracticeAreas 文字
  const PracticeAreas = {
    "project-004": "GRAPHIC",
    "project-005": "EDITORIAL",
    "project-003": "TYPEFACE",
    "project-002": "3D ART",
  };

  // Copy 文字
  const Copy = {
    "project-004": "Instant recognition, lasting recall.",
    "project-005": "Complexity made readable.",
    "project-003": "Your voice, set in type.",
    "project-002": "Materials, made visible.",
  };

  // Description文字
  const customDescriptions = {
    "project-004":
      "Identity and campaign visuals people recognize and remember. The studio provides a clear brand guide and files prepared for print and digital, ready to deploy.",
    "project-005":
      "We turn complex content into readable publications and manage printing from start to finish, delivering finished copies to you.",
    "project-003":
      "Type that carries your voice across every touchpoint. We provide font files, licensing guidance, and specimens for print, web, and UI.",
    "project-002":
      "Photoreal and stylized 3D that tells the material story. We deliver stills, loops, and GLB/USDZ assets prepared for web, retail, and installation contexts.",
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className={`hs-section projects-section hs-section-${index}`}>
      <div className="fullscreen-projects-content">
        {projectConfig.map(({ blockNumber, projectId, imageIndex }) => {
          const project = projects.find((p) => p.id === projectId);
          if (!project) return null;

          // 動態生成圖片路徑
          const imagePath = `/images/projects/${projectId}/${projectId}-img-${String(
            imageIndex
          ).padStart(2, "0")}.webp`;

          return (
            <div
              key={blockNumber}
              className="fullscreen-project-block clickable"
              onClick={() => handleProjectClick(projectId)}
              style={{
                "--project-bg-image": `url(${imagePath})`,
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
                  <div className="project-practice-areas-large">
                    {PracticeAreas[projectId]}
                  </div>
                  <div className="project-info">
                    <div className="project-copy">{Copy[projectId]}</div>
                    <div className="project-description">
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
