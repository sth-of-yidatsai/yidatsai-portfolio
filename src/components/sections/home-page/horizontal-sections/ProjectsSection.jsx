import React from "react";
import projects from "../../../../data/projects.json";
import { pickResponsiveSrc } from "../../../../utils/imgSrcSet";
import { useTranslation } from "../../../../hooks/useTranslation";
import BilingTitle from "../../../BilingTitle";
import "./ProjectsSection.css";

export default function ProjectsSection({ index }) {
  const { locale } = useTranslation();
  const [tappedIndex, setTappedIndex] = React.useState(null);

  const handleBlockClick = (i) => {
    setTappedIndex((prev) => (prev === i ? null : i));
  };

  // 專案配置 - 指定專案ID和圖片索引
  const projectConfig = React.useMemo(
    () => [
      {
        blockNumber: "1",
        projectId: "formosa-font",
        image: "13.webp",
      }, // 區塊1
      {
        blockNumber: "2",
        projectId: "foucault-book-binding",
        image: "03.webp",
      }, // 區塊2
      {
        blockNumber: "3",
        projectId: "patterned-glass-notebook",
        image: "13.webp",
      }, // 區塊3
      {
        blockNumber: "4",
        projectId: "patterned-glass-notebook",
        image: "16.webp",
      }, // 區塊4
    ],
    [],
  );

  const PracticeAreas = locale.projects.areas;
  const PracticeAreasZh = locale.projects.areasZh;
  const customDescriptions = locale.projects.descriptions;

  return (
    <div className={`hs-section projects-section hs-section-${index}`}>
      <div className="fullscreen-projects-content">
        {projectConfig.map(({ blockNumber, projectId, image }) => {
          const project = projects.find((p) => p.id === projectId);
          if (!project) return null;

          const imagePath = `/images/projects/${projectId}/${image}`;

          const blockIdx = parseInt(blockNumber) - 1;
          return (
            <div
              key={blockNumber}
              className={`fullscreen-project-block${tappedIndex === blockIdx ? " is-tapped" : ""}`}
              style={{
                "--project-bg-image": `url(${pickResponsiveSrc(imagePath)})`,
              }}
              onClick={() => handleBlockClick(blockIdx)}
            >
              <div className="project-block-overlay">
                <div className="project-block-number-large">{blockNumber}</div>

                <div className="project-block-content-bottom">
                  <div className="project-practice-areas-large">
                    <BilingTitle
                      en={PracticeAreas[blockNumber]}
                      zh={PracticeAreasZh[blockNumber]}
                      as="span"
                    />
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
