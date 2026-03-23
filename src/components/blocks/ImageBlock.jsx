import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useImageParallax } from '../../hooks/useImageParallax';
import './blocks.css';

gsap.registerPlugin(ScrollTrigger);

const RATIO_MAP = {
  '3:4':  3 / 4,
  '4:3':  4 / 3,
  '1:1':  1,
  '21:9': 21 / 9,
};

export default function ImageBlock({ src, alt, bg = 'var(--gray-25)', ratio = '4:3' }) {
  const sectionRef = useRef(null);
  const imgWrapRef = useRef(null);
  const [isInSection, setIsInSection] = useState(false);
  const { scrollClass } = useImageParallax({ inStickySection: isInSection });

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const imgWrap = imgWrapRef.current;
    if (!section || !imgWrap) return;

    let ctx;
    const setup = () => {
      ctx?.revert();

      // getBoundingClientRect 取精確渲染尺寸
      const rect = section.getBoundingClientRect();
      const vw = rect.width;
      const vh = rect.height;
      const ar = RATIO_MAP[ratio] ?? (4 / 3);

      // 初始尺寸：最多佔 72% viewport，維持比例
      const maxW = vw * 0.72;
      const maxH = vh * 0.72;
      let initW, initH;
      if (maxW / maxH > ar) {
        initH = maxH;
        initW = maxH * ar;
      } else {
        initW = maxW;
        initH = maxW / ar;
      }

      // inset:0 + margin:auto 讓瀏覽器負責置中，GSAP 只控制 width/height
      gsap.set(imgWrap, { width: initW, height: initH });

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            pin:     true,
            start:   'top top',
            end:     `+=${vh * 1.0}`,
            scrub:   0.6,
            onEnter()     { setIsInSection(true);  },
            onLeave()     { setIsInSection(false); },
            onEnterBack() { setIsInSection(true);  },
            onLeaveBack() { setIsInSection(false); },
          },
        });

        tl.to(imgWrap, {
          width:  '100%',
          height: '100%',
          ease:   'none',
          duration: 1,
        });
      }, section);
    };

    setup();
    window.addEventListener('resize', setup);
    return () => {
      window.removeEventListener('resize', setup);
      ctx?.revert();
    };
  }, [ratio]);

  return (
    <section
      className="block block--image"
      ref={sectionRef}
      style={{ background: bg }}
    >
      <div className="block--image__wrap" ref={imgWrapRef}>
        <img
          className={['block--image__img', scrollClass].filter(Boolean).join(' ')}
          src={src}
          alt={alt || ''}
        />
      </div>
    </section>
  );
}
