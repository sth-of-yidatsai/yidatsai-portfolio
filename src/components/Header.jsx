import { useState, useEffect } from 'react';
import './Header.css';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const toggleMenu = () => setIsOpen(!isOpen);

  // 圖片輪播數據 - 使用在線示例圖片
  const images = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'
  ];

  // 自動輪播
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, images.length]);

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
              <span className="brand-name">YIDA</span>
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