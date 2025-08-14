import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HorizontalScroller.css';
import projects from '../data/projects.json';

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalScroller() {
  const containerRef = useRef(null);

  // 準備面板資料（重複一次以獲得較長的水平滾動距離）
  const panels = useMemo(() => {
    const items = projects.map((p) => ({
      src: p.projectImages?.[0],
      title: p.title,
    }));
    return [...items, ...items];
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(container);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          pin: true,
          scrub: 1,
          end: () => container.scrollWidth - document.documentElement.clientWidth,
        },
        defaults: { ease: 'none', duration: 1 },
      });

      tl.to(q('.hs-parallax'), { x: 300 })
        .to(q('.hs-panel'), {
          x: () => -(container.scrollWidth - document.documentElement.clientWidth),
        }, 0)
        .from(q('.secondAn'), {
          opacity: 0,
          scale: 0.5,
          duration: 0.2,
          stagger: { amount: 0.8 },
        }, 0);

      gsap.from(q('.firstAn'), {
        duration: 1,
        opacity: 0,
        scale: 0.5,
        scrollTrigger: {
          trigger: container,
          start: 'top 90%',
          end: 'bottom 10%',
          toggleActions: 'play none none reverse',
        },
      });

      // 圖片載入後刷新尺寸
      const imgs = Array.from(container.querySelectorAll('img'));
      const onImgLoad = () => ScrollTrigger.refresh();
      imgs.forEach((img) => {
        if (img.complete) return;
        img.addEventListener('load', onImgLoad);
      });

      // 下一個 frame 也嘗試刷新一次
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }

      return () => {
        imgs.forEach((img) => img.removeEventListener('load', onImgLoad));
      };
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="hs-section hs-portfolio" aria-label="Portfolio Horizontal Gallery">
      <h2 className="hs-portfolio_title hs-text-stroke hs-parallax">Portfolio</h2>
      {panels.map((item, index) => {
        const animClass = index < 2 ? 'firstAn' : 'secondAn';
        return (
          <div className="hs-panel" key={`panel-${index}`}>
            <div className="hs-panel_item">
              <img
                className={`hs-panel_img ${animClass}`}
                src={item.src}
                alt={item.title || 'work image'}
                loading="lazy"
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}


