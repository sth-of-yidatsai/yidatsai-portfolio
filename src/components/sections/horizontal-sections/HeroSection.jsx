import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";
import projectsData from "../../../data/projects.json";
import arrowIcon from "../../../assets/icons/arrow_outward_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";
import leftArrowIcon from "../../../assets/icons/keyboard_arrow_left_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";
import rightArrowIcon from "../../../assets/icons/keyboard_arrow_right_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";

export default function HeroSection({ index }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animationPhase, setAnimationPhase] = useState("idle"); // 'idle', 'exit', 'enter'
  const [previousIndex, setPreviousIndex] = useState(0);
  const [displayData, setDisplayData] = useState(null);
  const navigate = useNavigate();

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
          tags: project.tags || [],
          projectId: config.projectId,
        };
      })
      .filter(Boolean);
  }, [carouselConfig]);

  const images = carouselData.map((item) => item.image);

  // 處理文字動畫轉場
  useEffect(() => {
    if (previousIndex !== currentImageIndex && displayData) {
      // 開始動畫序列
      setAnimationPhase("exit");

      // 第一階段：文字向下消失
      setTimeout(() => {
        // 在文字完全消失後，更新顯示資料
        setDisplayData(carouselData[currentImageIndex]);
        setPreviousIndex(currentImageIndex);
        setAnimationPhase("enter");

        // 第二階段：文字向上浮起
        setTimeout(() => {
          setAnimationPhase("idle");
        }, 600);
      }, 600);
    } else {
      // 初次載入，直接更新顯示資料
      setDisplayData(carouselData[currentImageIndex]);
      setPreviousIndex(currentImageIndex);
    }
  }, [currentImageIndex, carouselData, previousIndex, displayData]);

  // 自動輪播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length, currentImageIndex]); // 添加currentImageIndex依賴，手動切換時會重設

  // 手動切換功能
  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleProjectClick = () => {
    navigate("/projects");
  };

  return (
    <div className={`hs-section hero-section hs-section-${index}`}>
      {/* 輪播背景 */}
      <div className="hero-carousel-container">
        {images.map((image, imgIndex) => (
          <div
            key={imgIndex}
            className={`hero-carousel-slide ${
              imgIndex === currentImageIndex ? "active" : ""
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </div>

      {/* 底部專案資訊欄 */}
      <div className="hero-project-info-panel">
        <div className="hero-info-content">
          {/* 左箭頭 */}
          <button
            className="hero-nav-button hero-prev-button clickable"
            onClick={handlePrevious}
            aria-label="Previous project"
          >
            <img src={leftArrowIcon} alt="Previous" />
          </button>

          {/* 右箭頭 */}
          <button
            className="hero-nav-button hero-next-button clickable"
            onClick={handleNext}
            aria-label="Next project"
          >
            <img src={rightArrowIcon} alt="Next" />
          </button>

          {/* Title區域 */}
          <div className="hero-title-section">
            <div className="hero-info-item">
              <span className="hero-info-label">Title:</span>
              <span
                className={`hero-info-value ${
                  animationPhase !== "idle" ? `animate-${animationPhase}` : ""
                }`}
              >
                {displayData?.title}
              </span>
            </div>
          </div>

          {/* Year區域 */}
          <div className="hero-year-section">
            <div className="hero-info-item">
              <span className="hero-info-label">Year:</span>
              <span
                className={`hero-info-value ${
                  animationPhase !== "idle" ? `animate-${animationPhase}` : ""
                }`}
              >
                {displayData?.year}
              </span>
            </div>
          </div>

          {/* TAG區域 */}
          <div className="hero-tag-section">
            <div className="hero-info-item">
              <span className="hero-info-label">Tag:</span>
              <div
                className={`hero-tag-list ${
                  animationPhase !== "idle" ? `animate-${animationPhase}` : ""
                }`}
              >
                {displayData?.tags?.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="hero-tag-item"
                    style={{
                      "--animation-delay": `${(index + 1) * 0.05}s`,
                    }}
                  >
                    {tag}
                  </span>
                )) || []}
              </div>
            </div>
          </div>

          {/* 前往專案按鈕 */}
          <button
            className="hero-project-button clickable"
            onClick={handleProjectClick}
          >
            <img src={arrowIcon} alt="View Projects" />
          </button>
        </div>
      </div>
    </div>
  );
}
