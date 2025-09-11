import React from "react";
import "./OverviewSection.css";

export default function OverviewSection({ index }) {
  return (
    <div className={`hs-section overview-section hs-section-${index}`}>
      <div className="overview-grid">
        {/* 左上角文字區塊 */}
        <div className="overview-text-block">
          <div className="overview-title">
            <span className="title-headline">End-to-end</span>
            <span className="title-headline title-italic">Creative</span>
            <span className="title-headline">Direction &</span>
            <span className="title-headline">Production</span>
          </div>
        </div>
      </div>
    </div>
  );
}
