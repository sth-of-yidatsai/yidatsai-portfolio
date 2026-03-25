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

  // Production fix: GSAP ScrollTrigger measures element positions in useLayoutEffect,
  // but images haven't loaded yet (height: auto → 0px). This causes pin spacers to be
  // miscalculated, making blocks overlap. Refresh after all images have loaded.
  useEffect(() => {
    if (!blocks?.length) return;

    const container = containerRef.current;
    if (!container) return;

    const imgs = Array.from(container.querySelectorAll('img'));
    const unloaded = imgs.filter(img => !img.complete);

    if (unloaded.length === 0) {
      ScrollTrigger.refresh();
      return;
    }

    let resolved = 0;
    const check = () => {
      resolved++;
      if (resolved >= unloaded.length) ScrollTrigger.refresh();
    };

    unloaded.forEach(img => {
      img.addEventListener('load', check, { once: true });
      img.addEventListener('error', check, { once: true });
    });

    return () => {
      unloaded.forEach(img => {
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