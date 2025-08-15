import React from "react";
import "./SectionBase.css";

export default function WorksSection({ config, index }) {
  const featuredWorks = [
    {
      title: "UI/UX 設計",
      description: "現代化介面設計",
      icon: "🎨",
    },
    {
      title: "前端開發",
      description: "響應式網頁開發",
      icon: "💻",
    },
    {
      title: "品牌設計",
      description: "視覺識別系統",
      icon: "✨",
    },
  ];

  return (
    <div
      className={`hs-section works-section hs-section-${index} ${
        index > 0 ? "sticky" : ""
      }`}
    >
      <div className="hs-section-content">
        <div className="hs-section-number">
          {String(index + 1).padStart(2, "0")}
        </div>
        <h2 className="hs-section-title">{config.title}</h2>
        <h3 className="hs-section-subtitle">精選作品</h3>
        <p className="hs-section-text">展示我們的創作成果與設計理念。</p>

        {/* Works 特有的內容 */}
        <div className="works-specific-content">
          <div className="works-grid">
            {featuredWorks.map((work, workIndex) => (
              <div key={workIndex} className="work-item">
                <div className="work-icon">{work.icon}</div>
                <h4 className="work-title">{work.title}</h4>
                <p className="work-description">{work.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
