import React from "react";
import "./SectionBase.css";

export default function HeroSection({ index }) {
  return (
    <div className={`hs-section hero-section hs-section-${index}`}>
      <div className="hero-specific-content">
        <div className="hero-text-container">
          <h1 className="hero-title">Yi-Da Tsai</h1>
          <p className="hero-subtitle">Visual Designer & Developer</p>
          <p className="hero-description">
            Creating meaningful connections between design and technology
            through thoughtful visual experiences.
          </p>
        </div>
      </div>
    </div>
  );
}
