import React from "react";
import "./OverviewSection.css";

export default function OverviewSection({ index }) {
  return (
    <div className={`hs-section overview-section hs-section-${index}`}>
      <div className="overview-grid">
        <div className="overview-image-block overview-image-block-1">
          <img
            src="/images/projects/project-004/project-004-img-09.webp"
            alt="overview"
            className="overview-image"
          />
          <span className="overview-image-text">
            <span className="overview-image-number">001</span>
            <span className="overview-image-category">Notebook</span>
          </span>
        </div>
        <div className="overview-text-block">
          <div className="overview-title">
            <span className="title-headline">End-to-end</span>
            <span className="title-headline title-italic">Creative</span>
            <span className="title-headline">Direction &</span>
            <span className="title-headline">Production</span>
          </div>
        </div>
        <div className="overview-image-block overview-image-block-2">
          <img
            src="/images/projects/project-004/project-004-img-13.webp"
            alt="overview"
            className="overview-image"
          />
        </div>
        <div className="overview-image-block overview-image-block-3">
          <img
            src="/images/projects/project-004/project-004-img-12.webp"
            alt="overview"
            className="overview-image"
          />
          <span className="overview-image-text">
            <span className="overview-image-number">001</span>
            <span className="overview-image-category">Notebook</span>
          </span>
        </div>
      </div>
    </div>
  );
}
