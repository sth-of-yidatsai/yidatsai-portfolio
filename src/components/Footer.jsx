import React from 'react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* 左側 - 品牌資訊 */}
        <div className="footer-brand">
          <div className="brand-line"></div>
          <div className="brand-text">
            <span className="brand-name">YIDA</span>
            <span className="brand-year">©{currentYear}</span>
          </div>
        </div>

        {/* 右側 - 連結和資訊 */}
        <div className="footer-links">
          <div className="links-section">
            <a href="/" className="footer-link">HOME</a>
            <a href="/projects" className="footer-link">WORK</a>
            <a href="/about" className="footer-link">ABOUT</a>
            <a href="/contact" className="footer-link">CONTACT</a>
          </div>
          
          <div className="footer-info">
            <p className="copyright">© {currentYear} Yida Tsai. All rights reserved.</p>
            <p className="location">Taipei, Taiwan</p>
          </div>
        </div>
      </div>
    </footer>
  );
}