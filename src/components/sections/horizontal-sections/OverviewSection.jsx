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
            <span className="overview-image-number">(001)</span>
            <span className="overview-image-category">Recognizable</span>
          </span>
        </div>
        <div className="overview-text-block overview-text-block-1">
          <div className="overview-title">
            <span className="title-headline">End-to-end</span>
            <span className="title-headline title-italic">Creative</span>
            <span className="title-headline">Direction &</span>
            <span className="title-headline">Production</span>
          </div>
        </div>
        <div className="overview-image-block overview-image-block-2">
          <span className="overview-image-text">
            <span className="overview-image-number">(002)</span>
            <span className="overview-image-category">Usable</span>
          </span>
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
            <span className="overview-image-number">(003)</span>
            <span className="overview-image-category">Durable</span>
          </span>
        </div>
        <div className="overview-text-block overview-text-block-2">
          <div className="overview-title">
            <span className="title-copy">
              I partner with you to clarify vision and shape a coherent visual
              language that resonates across brand and product. From first
              conversation to final presence, the process is careful and
              collaborative—aligning choices with purpose, audience, and time.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
