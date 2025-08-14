import React from 'react';
import './About.css';

export default function About() {
  return (
    <main className="about-page">
      <section className="about-hero container-narrow">
        <h1 className="about-title">關於我</h1>
        <p className="about-subtitle">設計師／視覺創作者</p>
      </section>

      <section className="about-content container-narrow">
        <div className="about-grid">
          <div className="about-intro">
            <p>
              我專注於視覺設計、介面體驗與 3D 藝術，擅長將抽象概念轉化為具體且具有敘事性的視覺語言，
              並在不同媒介之間尋找更具張力的呈現方式。
            </p>
            <p>
              近年亦投入互動與前端實作，讓設計能在真實情境中被驗證與優化，達成在美學與可用性之間的平衡。
            </p>
          </div>

          <div className="about-meta">
            <div className="about-meta-group">
              <h3>專長</h3>
              <ul className="about-list">
                <li>平面設計</li>
                <li>UI/UX 設計</li>
                <li>3D 藝術</li>
                <li>品牌識別</li>
              </ul>
            </div>

            <div className="about-meta-group">
              <h3>工具</h3>
              <ul className="about-list">
                <li>Figma / Adobe CC</li>
                <li>Blender</li>
                <li>Web / 前端</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}