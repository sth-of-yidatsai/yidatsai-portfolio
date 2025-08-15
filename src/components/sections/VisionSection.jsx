import React from "react";
import "./SectionBase.css";

export default function VisionSection({ config, index }) {
  return (
    <div
      className={`hs-section vision-section hs-section-${index} ${
        index > 0 ? "sticky" : ""
      }`}
    >
      <div className="hs-section-content">
        <div className="hs-section-number">
          {String(index + 1).padStart(2, "0")}
        </div>
        <h2 className="hs-section-title">{config.title}</h2>
        <h3 className="hs-section-subtitle">你中心的世界</h3>
        <p className="hs-section-text">
          從你的視角出發，創造無限可能的未來景象。
        </p>

        {/* Vision 特有的內容 */}
        <div className="vision-specific-content">
          <div className="vision-highlight">
            <p>以創新的視角，重新定義可能性</p>
          </div>
        </div>
      </div>
    </div>
  );
}
