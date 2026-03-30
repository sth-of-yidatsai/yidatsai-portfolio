import React from "react";
import projects from "../../../../data/projects.json";
import "./ProjectsSection.css";

export default function ProjectsSection({ index }) {
  // 專案配置 - 指定專案ID和圖片索引
  const projectConfig = React.useMemo(
    () => [
      {
        blockNumber: "1",
        projectId: "foucault-book-binding",
        image: "02.webp",
      }, // 區塊1
      {
        blockNumber: "2",
        projectId: "foucault-book-binding",
        image: "07.webp",
      }, // 區塊2
      {
        blockNumber: "3",
        projectId: "foucault-book-binding",
        image: "05.webp",
      }, // 區塊3
      {
        blockNumber: "4",
        projectId: "foucault-book-binding",
        image: "03.webp",
      }, // 區塊4
    ],
    [],
  );

  // PracticeAreas 文字
  const PracticeAreas = {
    1: "Concept",
    2: "Structure",
    3: "Material",
    4: "Detail",
  };

  // Description文字
  const customDescriptions = {
    1: "Every project begins with a clear idea.\nConcept defines the direction, intention,\nand the story behind the design.",
    2: "Structure shapes the foundation of design.\nIt organizes elements and builds a visual\nframework that supports the concept.",
    3: "Material brings texture and depth.\nThrough surface, light, and detail,\nthe design gains its physical presence.",
    4: "Detail refines the final expression.\nSmall elements complete the design\nand reveal the true level of craftsmanship.",
  };

  return (
    <div className={`hs-section projects-section hs-section-${index}`}>
      <div className="fullscreen-projects-content">
        {projectConfig.map(({ blockNumber, projectId, image }) => {
          const project = projects.find((p) => p.id === projectId);
          if (!project) return null;

          const imagePath = `/images/projects/${projectId}/${image}`;

          return (
            <div
              key={blockNumber}
              className="fullscreen-project-block"
              style={{
                "--project-bg-image": `url(${imagePath})`,
              }}
            >
              <div className="project-block-overlay">
                <div className="project-block-number-large">{blockNumber}</div>

                <div className="project-block-content-bottom">
                  <div className="project-practice-areas-large">
                    {PracticeAreas[blockNumber]}
                  </div>
                  <span className="project-rule" />
                  <div className="project-description">
                    {customDescriptions[blockNumber]}
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
