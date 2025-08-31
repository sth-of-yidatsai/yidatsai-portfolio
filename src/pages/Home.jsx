import React from "react";
import "./Home.css";
import HorizontalScroller from "../components/HorizontalScroller";
import { CubeGallery } from "../components/sections/vertical-sections";

export default function Home() {
  return (
    <div className="home-container">
      <HorizontalScroller />
      <CubeGallery />

      {/* 第二個 100vh 區塊 */}
      <section className="content-section">
        <div className="content-wrapper">
          <h2 className="section-title">About My Work</h2>
          <div className="content-grid">
            <div className="content-card">
              <h3>Design</h3>
              <p>Creative solutions for modern problems</p>
            </div>
            <div className="content-card">
              <h3>Development</h3>
              <p>Building digital experiences</p>
            </div>
            <div className="content-card">
              <h3>Innovation</h3>
              <p>Pushing creative boundaries</p>
            </div>
          </div>
        </div>
      </section>

      {/* 第三個 100vh 區塊 */}
      <section className="test-section">
        <div className="test-content">
          <h2 className="test-title">100vh Test Section</h2>
          <div className="test-indicator">
            <span>This section is exactly 100vh</span>
            <div className="vh-marker">100vh</div>
          </div>
        </div>
      </section>
    </div>
  );
}
