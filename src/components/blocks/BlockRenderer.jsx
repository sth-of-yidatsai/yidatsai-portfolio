import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CarouselBlock from './CarouselBlock';
import HeroBlock from './HeroBlock';
import TextBlock from './TextBlock';
import LandscapeBlock from './LandscapeBlock';
import FullImageBlock from './FullImageBlock';
import ImageLeftTextRightBlock from './ImageLeftTextRightBlock';
import ImageRightTextLeftBlock from './ImageRightTextLeftBlock';
import ImageGridBlock from './ImageGridBlock';
import QuoteBlock from './QuoteBlock';
import SectionTitleBlock from './SectionTitleBlock';
import SpacerBlock from './SpacerBlock';
import VideoBlock from './VideoBlock';
import ImageSetABlock from './ImageSetABlock';
import ImageSetBBlock from './ImageSetBBlock';
import ImageSetCBlock from './ImageSetCBlock';

gsap.registerPlugin(ScrollTrigger);

const BLOCK_MAP = {
  'carousel':              CarouselBlock,
  'hero':                  HeroBlock,
  'text':                  TextBlock,
  'landscape':             LandscapeBlock,
  'full-image':            FullImageBlock,
  'image-left-text-right': ImageLeftTextRightBlock,
  'image-right-text-left': ImageRightTextLeftBlock,
  'image-grid':            ImageGridBlock,
  'quote':                 QuoteBlock,
  'section-title':         SectionTitleBlock,
  'spacer':                SpacerBlock,
  'video':                 VideoBlock,
  'image-set-a':           ImageSetABlock,
  'image-set-b':           ImageSetBBlock,
  'image-set-c':           ImageSetCBlock,
};

// ── 字元填色動畫（SectionTitle / Text 共用）────────────────────────────
function setupCharFill(section, charSelector, scrollEnd) {
  const chars = [...section.querySelectorAll(charSelector)];
  if (!chars.length) return;
  const color     = section.dataset.color     || 'var(--gray-600)';
  const fillColor = section.dataset.fillColor || 'var(--gray-50)';
  chars.forEach(c => { c.style.color = color; });
  let lastFilled = 0;
  ScrollTrigger.create({
    trigger:      section,
    pin:          true,
    anticipatePin: 1,
    start:        'top top',
    end:          `+=${scrollEnd}`,
    scrub:        true,
    onUpdate: (self) => {
      const filled = Math.round(self.progress * chars.length);
      if (filled === lastFilled) return;
      if (filled > lastFilled) {
        for (let i = lastFilled; i < filled; i++)  chars[i].style.color = fillColor;
      } else {
        for (let i = filled; i < lastFilled; i++)  chars[i].style.color = color;
      }
      lastFilled = filled;
    },
  });
}

// ── Carousel：opacity 交叉淡入 ────────────────────────────────────────
function setupCarousel(section, vh) {
  const slides = [...section.querySelectorAll('.block--carousel__slide')];
  if (!slides.length) return;
  const [img1, img2, img3] = slides;

  gsap.set(img1, { opacity: 1 });
  if (img2) gsap.set(img2, { opacity: 0 });
  if (img3) gsap.set(img3, { opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger:      section,
      pin:          true,
      anticipatePin: 1,
      start:        'top top',
      end:          `+=${vh * 2}`,
      scrub:        true,
      onEnter()     { gsap.set(slides, { willChange: 'opacity' }); },
      onLeave()     { gsap.set(slides, { willChange: 'auto' }); },
      onEnterBack() { gsap.set(slides, { willChange: 'opacity' }); },
      onLeaveBack() { gsap.set(slides, { willChange: 'auto' }); },
    },
  });
  tl.to(img1, { opacity: 0, ease: 'none', duration: 0.5 }, 0);
  if (img2) tl.to(img2, { opacity: 1, ease: 'none', duration: 0.5 }, 0);
  if (img2) tl.to(img2, { opacity: 0, ease: 'none', duration: 0.5 }, 0.5);
  if (img3) tl.to(img3, { opacity: 1, ease: 'none', duration: 0.5 }, 0.5);
}

// ── Landscape：3 階段 scale 展開 ──────────────────────────────────────
const LANDSCAPE_ASPECT = 21 / 9;

function setupLandscape(section, vh) {
  const frameWrap = section.querySelector('.block--image__frame-wrap');
  if (!frameWrap) return;
  const [img2, img3] = [...section.querySelectorAll('.block--image__cover-img')];

  const vw       = section.offsetWidth;
  const frameW   = vw * 0.62;
  const frameH   = frameW / LANDSCAPE_ASPECT;
  const finalScale = Math.max(vw / frameW, vh / frameH) * 1.02;

  gsap.set(frameWrap, { width: frameW, height: frameH, scale: 1 });
  if (img2) gsap.set(img2, { scale: 0, transformOrigin: 'center center' });
  if (img3) gsap.set(img3, { scale: 0, transformOrigin: 'center center' });

  const animEls = [frameWrap, img2, img3].filter(Boolean);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger:      section,
      pin:          true,
      anticipatePin: 1,
      start:        'top top',
      end:          `+=${vh * 1.8}`,
      scrub:        true,
      onEnter()     { section.classList.add('is-pinned');    gsap.set(animEls, { willChange: 'transform' }); },
      onLeave()     { section.classList.remove('is-pinned'); gsap.set(animEls, { willChange: 'auto' }); },
      onEnterBack() { section.classList.add('is-pinned');    gsap.set(animEls, { willChange: 'transform' }); },
      onLeaveBack() { section.classList.remove('is-pinned'); gsap.set(animEls, { willChange: 'auto' }); },
    },
  });
  if (img2) tl.to(img2, { scale: 1, ease: 'none', duration: 0.8 });
  if (img3) tl.to(img3, { scale: 1, ease: 'none', duration: 0.8 }, '>');
  tl.to(frameWrap, { scale: finalScale, ease: 'none', duration: 0.85 }, '>');
}

// ── 統一初始化（單一 gsap.context）──────────────────────────────────
function setupAll(container) {
  const vh  = window.innerHeight;
  const ctx = gsap.context(() => {
    container.querySelectorAll('[data-scroll-type="section-title"]').forEach(el =>
      setupCharFill(el, '.block--section-title__char', vh * 1.8)
    );
    container.querySelectorAll('[data-scroll-type="text"]').forEach(el =>
      setupCharFill(el, '.block--text__char', vh * 1.8)
    );
    container.querySelectorAll('[data-scroll-type="carousel"]').forEach(el =>
      setupCarousel(el, vh)
    );
    container.querySelectorAll('[data-scroll-type="landscape"]').forEach(el =>
      setupLandscape(el, vh)
    );
  }, container);
  return ctx;
}

// ── BlockRenderer ────────────────────────────────────────────────────
export default function BlockRenderer({ blocks, project }) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (!blocks?.length || !containerRef.current) return;
    const container = containerRef.current;

    // 單一 context 涵蓋所有動畫，確保 ScrollTrigger 全部量測完畢後一次初始化
    let ctx = setupAll(container);

    // 單一 resize handler，debounce 後統一 rebuild
    let resizeRaf;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        ctx.revert();
        ctx = setupAll(container);
      });
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(resizeRaf);
      ctx.revert();
    };
  }, [blocks]);

  if (!blocks?.length) return null;
  return (
    <div ref={containerRef}>
      {blocks.map((block, i) => {
        const Block = BLOCK_MAP[block.type];
        if (!Block) {
          console.warn(`[BlockRenderer] Unknown block type: "${block.type}"`);
          return null;
        }
        return <Block key={i} project={project} {...block} />;
      })}
    </div>
  );
}
