import { useEffect, useRef } from 'react';
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
  'carousel': CarouselBlock,
  'hero': HeroBlock,
  'text': TextBlock,
  'landscape': LandscapeBlock,
  'full-image': FullImageBlock,
  'image-left-text-right': ImageLeftTextRightBlock,
  'image-right-text-left': ImageRightTextLeftBlock,
  'image-grid': ImageGridBlock,
  'quote': QuoteBlock,
  'section-title': SectionTitleBlock,
  'spacer': SpacerBlock,
  'video': VideoBlock,
  'image-set-a': ImageSetABlock,
  'image-set-b': ImageSetBBlock,
  'image-set-c': ImageSetCBlock,
};

export default function BlockRenderer({ blocks, project }) {
  const containerRef = useRef(null);

  // Safety net: 圖片應已由 ProjectDetail 預載完畢（img.complete === true），
  // 此處只是保險—如有任何圖片仍未就緒，等它們全部載入後 refresh 一次。
  useEffect(() => {
    if (!blocks?.length) return;
    const container = containerRef.current;
    if (!container) return;

    const unloaded = Array.from(container.querySelectorAll('img')).filter(
      (img) => !img.complete
    );

    if (unloaded.length === 0) {
      ScrollTrigger.refresh();
      return;
    }

    let resolved = 0;
    const check = () => {
      if (++resolved >= unloaded.length) ScrollTrigger.refresh();
    };
    unloaded.forEach((img) => {
      img.addEventListener('load', check, { once: true });
      img.addEventListener('error', check, { once: true });
    });
    return () => {
      unloaded.forEach((img) => {
        img.removeEventListener('load', check);
        img.removeEventListener('error', check);
      });
    };
  }, [blocks]);

  if (!blocks?.length) return null;
  return (
    <div ref={containerRef} style={{ display: 'contents' }}>
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