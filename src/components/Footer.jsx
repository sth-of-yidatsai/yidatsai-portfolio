import React from 'react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* 上方區域 - 主要內容 */}
        <div className="footer-main">
          {/* 左側 - 品牌資訊 */}
          <div className="footer-brand">
            <div className="footer-logo">YIDA</div>
            <p className="footer-tagline">
              創意設計師 · 視覺藝術家
            </p>
          </div>

          {/* 中央 - 導航連結 */}
          <div className="footer-nav">
            <div className="footer-nav-group">
              <h3 className="footer-nav-title">導覽</h3>
              <ul className="footer-nav-list">
                <li><a href="/" className="footer-nav-link">首頁</a></li>
                <li><a href="/projects" className="footer-nav-link">作品集</a></li>
                <li><a href="/about" className="footer-nav-link">關於我</a></li>
                <li><a href="/contact" className="footer-nav-link">聯絡我</a></li>
              </ul>
            </div>

            <div className="footer-nav-group">
              <h3 className="footer-nav-title">專業領域</h3>
              <ul className="footer-nav-list">
                <li><span className="footer-nav-item">平面設計</span></li>
                <li><span className="footer-nav-item">UI/UX設計</span></li>
                <li><span className="footer-nav-item">3D藝術</span></li>
                <li><span className="footer-nav-item">品牌識別</span></li>
              </ul>
            </div>
          </div>

          {/* 右側 - 聯絡資訊 */}
          <div className="footer-contact">
            <h3 className="footer-contact-title">聯絡方式</h3>
            <div className="footer-contact-info">
              <a href="mailto:hello@yidatsai.com" className="footer-contact-link">
                hello@yidatsai.com
              </a>
              <div className="footer-social">
                <a href="#" className="footer-social-link" aria-label="Instagram">
                  <span className="footer-social-text">IG</span>
                </a>
                <a href="#" className="footer-social-link" aria-label="Behance">
                  <span className="footer-social-text">BE</span>
                </a>
                <a href="#" className="footer-social-link" aria-label="LinkedIn">
                  <span className="footer-social-text">LI</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 分隔線 */}
        <div className="footer-divider"></div>

        {/* 下方區域 - 版權資訊 */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <span className="footer-copyright-text">
              © {currentYear} YIDA TSAI. ALL RIGHTS RESERVED.
            </span>
          </div>
          
          <div className="footer-meta">
            <span className="footer-location">TAIWAN</span>
            <span className="footer-status">
              <span className="footer-status-dot"></span>
              AVAILABLE FOR WORK
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
