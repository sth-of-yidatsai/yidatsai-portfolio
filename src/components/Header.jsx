import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import projectsData from "../data/projects.json";
import arrowIcon from "../assets/icons/arrow_outward_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";
import MarqueeText from "./MarqueeText";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const headerRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  // 控制滾動條顯示/隱藏
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }

    // 告知其他頁面（如 Projects）選單狀態已改變
    try {
      window.dispatchEvent(
        new CustomEvent("menu-open-change", { detail: { isOpen } })
      );
    } catch {
      // 忽略舊瀏覽器的自訂事件錯誤
    }

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isOpen]);

  // 第一次開啟後標記，讓「關閉動畫」僅在曾開啟過之後才會觸發
  useEffect(() => {
    if (isOpen) setHasOpened(true);
  }, [isOpen]);

  // 輪播配置 - 指定專案ID和圖片索引
  const carouselConfig = React.useMemo(
    () => [
      { projectId: "project-001", imageIndex: 0 },
      { projectId: "project-002", imageIndex: 0 },
      { projectId: "project-003", imageIndex: 0 },
      { projectId: "project-004", imageIndex: 0 },
      { projectId: "project-002", imageIndex: 1 },
    ],
    []
  );

  // 根據配置獲取圖片和專案資訊
  const carouselData = React.useMemo(() => {
    return carouselConfig
      .map((config) => {
        const project = projectsData.find((p) => p.id === config.projectId);
        if (!project) return null;

        return {
          image:
            project.projectImages[config.imageIndex] ||
            project.projectImages[0],
          title: project.title,
          year: project.year,
          projectId: config.projectId,
        };
      })
      .filter(Boolean);
  }, [carouselConfig]);

  const images = carouselData.map((item) => item.image);

  // 自動輪播
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, images.length]);

  const handleProjectClick = () => {
    navigate("/projects");
    setIsOpen(false);
  };

  return (
    <>
      <div
        className={`overlay${isOpen ? " open" : ""}${
          hasOpened ? " has-opened" : ""
        }`}
      >
        {/* 左半邊 - 導航選單 */}
        <div className="menu-section">
          <nav className="navigation">
            <ul>
              <li>
                <Link to="/" onClick={toggleMenu}>
                  HOME
                </Link>
              </li>
              <li>
                <Link to="/projects" onClick={toggleMenu}>
                  WORK
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={toggleMenu}>
                  ABOUT
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={toggleMenu}>
                  CONTACT
                </Link>
              </li>
            </ul>
          </nav>
          <MarqueeText
            textColor="var(--linen-900)"
            lineColor="var(--gray-700)"
          />
        </div>

        {/* 右半邊 - 圖片輪播 */}
        <div className="carousel-section">
          <div className="carousel-container">
            {images.map((image, index) => (
              <div
                key={index}
                className={`carousel-slide ${
                  index === currentImageIndex ? "active" : ""
                }`}
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
                    <span className="info-value">
                      {carouselData[currentImageIndex]?.year}
                    </span>
                  </div>
                </div>
                <div className="title-section">
                  <div className="info-item">
                    <span className="info-label">Title:</span>
                    <span className="info-value">
                      {carouselData[currentImageIndex]?.title}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="project-button clickable"
                onClick={handleProjectClick}
              >
                <img src={arrowIcon} alt="View Project" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <header ref={headerRef} className="header">
        <button className="menu-icon clickable" onClick={toggleMenu}>
          <span className={isOpen ? "line line1 open" : "line line1"}></span>
          <span className={isOpen ? "line line2 open" : "line line2"}></span>
        </button>
        <div className="logo">YIDA TSAI</div>
      </header>
    </>
  );
}
