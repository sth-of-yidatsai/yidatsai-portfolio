import React, { useState, useEffect } from 'react';
import './Header.css';
import projectsData from '../data/projects.json';
import arrowIcon from '../assets/icons/arrow_outward_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const toggleMenu = () => setIsOpen(!isOpen);

  // 控制滾動條顯示/隱藏
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isOpen]);



  // 使用 JSON 資料 - 從 projectImages 的第一張圖片作為輪播圖片
  const images = projectsData.map(project => project.projectImages[0]);

  // 自動輪播
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [isOpen, images.length]);

  const handleProjectClick = () => {
    // 導向專案頁面
    window.location.href = '/projects';
  };

  return (
    <>
      <div className={isOpen ? 'overlay open' : 'overlay'}>
        {/* 左半邊 - 導航選單 */}
        <div className="menu-section">
          <nav className="navigation">
            <ul>
              <li><a href="/" onClick={toggleMenu}>HOME</a></li>
              <li><a href="/projects" onClick={toggleMenu}>WORK</a></li>
              <li><a href="/about" onClick={toggleMenu}>ABOUT</a></li>
              <li><a href="/contact" onClick={toggleMenu}>CONTACT</a></li>
            </ul>
          </nav>
          <div className="brand-info">
            <div className="brand-line"></div>
            <div className="brand-text">
              <span className="brand-name animated-text">
                <div className="marquee-content">
                  <span className="brand-text-item">GRAPHIC</span>
                  <span className="brand-text-item">UIUX</span>
                  <span className="brand-text-item">3DART</span>
                  <span className="brand-text-item">GRAPHIC</span>
                  <span className="brand-text-item">UIUX</span>
                  <span className="brand-text-item">3DART</span>
                </div>
              </span>
              <span className="brand-year">©2025</span>
            </div>
          </div>
        </div>
        
        {/* 右半邊 - 圖片輪播 */}
        <div className="carousel-section">  
          <div className="carousel-container">
            {images.map((image, index) => (
              <div 
                key={index}
                className={`carousel-slide ${index === currentImageIndex ? 'active' : ''}`}
                style={{ backgroundImage: `url(${image})` }}
              />
            ))}
          </div>
          
          {/* 資訊區塊 */}
          <div className="project-info-panel">
            <div className="info-content">
              <div className="info-text-section">
                <div className="year-section">
                  <div className="info-item">
                    <span className="info-label">Year:</span>
                    <span className="info-value">{projectsData[currentImageIndex]?.year}</span>
                  </div>
                </div>
                <div className="title-section">
                  <div className="info-item">
                    <span className="info-label">Title:</span>
                    <span className="info-value">{projectsData[currentImageIndex]?.title}</span>
                  </div>
                </div>
              </div>
              <button className="project-button" onClick={handleProjectClick}>
                <img src={arrowIcon} alt="View Project" />
              </button>
            </div>
          </div>

        </div>

      </div>
      
      <header className="header">
        <div className="menu-icon" onClick={toggleMenu}>
          <span className={isOpen ? 'line line1 open' : 'line line1'}></span>
          <span className={isOpen ? 'line line2 open' : 'line line2'}></span>
        </div>
        <div className="logo">YIDA</div>
      </header>
    </>
  );
}