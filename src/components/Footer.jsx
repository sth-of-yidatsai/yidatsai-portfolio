import React, { useEffect, useRef } from 'react';
import './Footer.css';

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    // 檢查是否有 GSAP 可用
    if (typeof window !== 'undefined' && window.gsap && window.ScrollTrigger && window.SplitText) {
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      const SplitText = window.SplitText;

      gsap.registerPlugin(ScrollTrigger, SplitText);

      // 初始化動畫
      const initFooterAnimations = () => {
        // 主標題動畫
        const mainTitle = footerRef.current?.querySelector('.main-title');
        if (mainTitle) {
          const mainTitleSplit = SplitText.create(mainTitle, { type: 'lines' });
          gsap.set(mainTitleSplit.lines, { opacity: 0, y: 30, filter: 'blur(8px)' });
        }

        // 波長標籤動畫
        const wavelengthLabels = footerRef.current?.querySelectorAll('.wavelength-label');
        const allSplitLines = [];
        
        wavelengthLabels?.forEach((label) => {
          const split = SplitText.create(label, { type: 'lines' });
          gsap.set(split.lines, { opacity: 0, y: 30, filter: 'blur(8px)' });
          allSplitLines.push(...split.lines);
        });

        // ScrollTrigger 動畫
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: '.footer-animation-section',
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 1,
          }
        });

        tl.to('.svg-container', { autoAlpha: 1, duration: 0.01 }, 0)
          .to('.text-grid', { autoAlpha: 1, duration: 0.01 }, 0)
          .to('.main-title', { autoAlpha: 1, duration: 0.01 }, 0)
          .to('.svg-container', {
            transform: 'scaleY(0.05) translateY(-30px)',
            duration: 0.3,
            ease: 'power2.out'
          }, 0)
          .to('.svg-container', {
            transform: 'scaleY(1) translateY(0px)',
            duration: 1.2,
            ease: 'power2.out'
          }, 0.3)
          .to(allSplitLines, {
            duration: 0.8,
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.08,
            ease: 'power2.out'
          }, 0.9)
          .to('.level-5', { y: '-25vh', duration: 0.8, ease: 'power2.out' }, 0.9)
          .to('.level-4', { y: '-20vh', duration: 0.8, ease: 'power2.out' }, 0.9)
          .to('.level-3', { y: '-15vh', duration: 0.8, ease: 'power2.out' }, 0.9)
          .to('.level-2', { y: '-10vh', duration: 0.8, ease: 'power2.out' }, 0.9)
          .to('.level-1', { y: '-5vh', duration: 0.8, ease: 'power2.out' }, 0.9);
      };

      // 確保字體載入完成後初始化動畫
      document.fonts.ready.then(() => {
        initFooterAnimations();
      });

      // 視窗大小改變時重新整理 ScrollTrigger
      const handleResize = () => ScrollTrigger.refresh();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    } else {
      // 如果沒有 GSAP，確保元素可見
      const elementsToShow = footerRef.current?.querySelectorAll(
        '.svg-container, .text-grid, .main-title, .wavelength-label'
      );
      elementsToShow?.forEach(el => {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      });
    }
  }, []);

  return (
    <div ref={footerRef} className="footer-animation-section">
      {/* 背景漸層層 */}
      <div className="bg-gradients">
        <div className="bg-gradient bg-gradient-1"></div>
        <div className="bg-gradient bg-gradient-2"></div>
        <div className="bg-gradient bg-gradient-3"></div>
      </div>

      {/* Footer 動畫容器 */}
      <div className="footer-container">
        {/* SVG 漸層容器 */}
        <div className="svg-container">
          <svg
            className="spectrum-svg"
            viewBox="0 0 1567 584"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip)" filter="url(#blur)">
              <path d="M1219 584H1393V184H1219V584Z" fill="url(#grad0)" />
              <path d="M1045 584H1219V104H1045V584Z" fill="url(#grad1)" />
              <path d="M348 584H174L174 184H348L348 584Z" fill="url(#grad2)" />
              <path d="M522 584H348L348 104H522L522 584Z" fill="url(#grad3)" />
              <path d="M697 584H522L522 54H697L697 584Z" fill="url(#grad4)" />
              <path d="M870 584H1045V54H870V584Z" fill="url(#grad5)" />
              <path d="M870 584H697L697 0H870L870 584Z" fill="url(#grad6)" />
              <path
                d="M174 585H0.000183105L-3.75875e-06 295H174L174 585Z"
                fill="url(#grad7)"
              />
              <path d="M1393 584H1567V294H1393V584Z" fill="url(#grad8)" />
            </g>
            <defs>
              <filter
                id="blur"
                x="-30"
                y="-30"
                width="1627"
                height="644"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur" />
              </filter>
              
              {/* 灰階漸層定義 */}
              <linearGradient
                id="grad0"
                x1="1306"
                y1="584"
                x2="1306"
                y2="184"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1a1a1a" />
                <stop offset="0.182709" stopColor="#404040" />
                <stop offset="0.283673" stopColor="#666666" />
                <stop offset="0.413484" stopColor="#999999" />
                <stop offset="0.586565" stopColor="#cccccc" />
                <stop offset="0.682722" stopColor="#e5e5e5" />
                <stop offset="0.802892" stopColor="#f5f5f5" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="grad1"
                x1="1132"
                y1="584"
                x2="1132"
                y2="104"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1a1a1a" />
                <stop offset="0.182709" stopColor="#404040" />
                <stop offset="0.283673" stopColor="#666666" />
                <stop offset="0.413484" stopColor="#999999" />
                <stop offset="0.586565" stopColor="#cccccc" />
                <stop offset="0.682722" stopColor="#e5e5e5" />
                <stop offset="0.802892" stopColor="#f5f5f5" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="grad2"
                x1="261"
                y1="584"
                x2="261"
                y2="184"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1a1a1a" />
                <stop offset="0.182709" stopColor="#404040" />
                <stop offset="0.283673" stopColor="#666666" />
                <stop offset="0.413484" stopColor="#999999" />
                <stop offset="0.586565" stopColor="#cccccc" />
                <stop offset="0.682722" stopColor="#e5e5e5" />
                <stop offset="0.802892" stopColor="#f5f5f5" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="grad3"
                x1="435"
                y1="584"
                x2="435"
                y2="104"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1a1a1a" />
                <stop offset="0.182709" stopColor="#404040" />
                <stop offset="0.283673" stopColor="#666666" />
                <stop offset="0.413484" stopColor="#999999" />
                <stop offset="0.586565" stopColor="#cccccc" />
                <stop offset="0.682722" stopColor="#e5e5e5" />
                <stop offset="0.802892" stopColor="#f5f5f5" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="grad4"
                x1="609.501"
                y1="584"
                x2="609.501"
                y2="54"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1a1a1a" />
                <stop offset="0.182709" stopColor="#404040" />
                <stop offset="0.283673" stopColor="#666666" />
                <stop offset="0.413484" stopColor="#999999" />
                <stop offset="0.586565" stopColor="#cccccc" />
                <stop offset="0.682722" stopColor="#e5e5e5" />
                <stop offset="0.802892" stopColor="#f5f5f5" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="grad5"
                x1="957.5"
                y1="584"
                x2="957.5"
                y2="54"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1a1a1a" />
                <stop offset="0.182709" stopColor="#404040" />
                <stop offset="0.283673" stopColor="#666666" />
                <stop offset="0.413484" stopColor="#999999" />
                <stop offset="0.586565" stopColor="#cccccc" />
                <stop offset="0.682722" stopColor="#e5e5e5" />
                <stop offset="0.802892" stopColor="#f5f5f5" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="grad6"
                x1="783.501"
                y1="584"
                x2="783.501"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1a1a1a" />
                <stop offset="0.182709" stopColor="#404040" />
                <stop offset="0.283673" stopColor="#666666" />
                <stop offset="0.413484" stopColor="#999999" />
                <stop offset="0.586565" stopColor="#cccccc" />
                <stop offset="0.682722" stopColor="#e5e5e5" />
                <stop offset="0.802892" stopColor="#f5f5f5" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="grad7"
                x1="87.0003"
                y1="585"
                x2="87.0003"
                y2="295"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1a1a1a" />
                <stop offset="0.182709" stopColor="#404040" />
                <stop offset="0.283673" stopColor="#666666" />
                <stop offset="0.413484" stopColor="#999999" />
                <stop offset="0.586565" stopColor="#cccccc" />
                <stop offset="0.682722" stopColor="#e5e5e5" />
                <stop offset="0.802892" stopColor="#f5f5f5" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="grad8"
                x1="1480"
                y1="584"
                x2="1480"
                y2="294"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1a1a1a" />
                <stop offset="0.182709" stopColor="#404040" />
                <stop offset="0.283673" stopColor="#666666" />
                <stop offset="0.413484" stopColor="#999999" />
                <stop offset="0.586565" stopColor="#cccccc" />
                <stop offset="0.682722" stopColor="#e5e5e5" />
                <stop offset="0.802892" stopColor="#f5f5f5" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <clipPath id="clip">
                <rect width="1567" height="584" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>

        {/* 主標題 */}
        <div className="main-title split-text">
          探索無限可能<br />
          創造獨特體驗
        </div>

        {/* 文字網格 */}
        <div className="text-grid">
          <div className="text-column">
            <div className="wavelength-label level-1 split-text">
              創意<br />設計<br />創新
            </div>
          </div>
          <div className="text-column">
            <div className="wavelength-label level-2 split-text">
              視覺<br />美學<br />藝術
            </div>
          </div>
          <div className="text-column">
            <div className="wavelength-label level-3 split-text">
              技術<br />實現<br />開發
            </div>
          </div>
          <div className="text-column">
            <div className="wavelength-label level-4 split-text">
              用戶<br />體驗<br />互動
            </div>
          </div>
          <div className="text-column">
            <div className="wavelength-label level-5 split-text">
              未來<br />願景<br />夢想
            </div>
          </div>
          <div className="text-column">
            <div className="wavelength-label level-4 split-text">
              品質<br />細節<br />完美
            </div>
          </div>
          <div className="text-column">
            <div className="wavelength-label level-3 split-text">
              合作<br />團隊<br />共創
            </div>
          </div>
          <div className="text-column">
            <div className="wavelength-label level-2 split-text">
              學習<br />成長<br />進步
            </div>
          </div>
          <div className="text-column">
            <div className="wavelength-label level-1 split-text">
              持續<br />改進<br />優化
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}