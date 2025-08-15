import React from "react";
import "./SectionBase.css";

export default function MissionSection({ config, index }) {
  // 內建配置
  const sectionConfig = {
    subtitle: "設計思維",
    content: "以使用者為中心的設計思維，打造更好的體驗。",
    bgColor: "#2d2d2d",
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

        {/* Mission 特有的內容 */}
        <div className="mission-specific-content">
          <div className="mission-principles">
            <div className="principle-item">
              <h4>使用者優先</h4>
              <p>始終以使用者需求為設計核心</p>
            </div>
            <div className="principle-item">
              <h4>創新思維</h4>
              <p>突破傳統框架，創造新的可能</p>
            </div>
            <div className="principle-item">
              <h4>品質追求</h4>
              <p>精益求精，追求完美的使用體驗</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
