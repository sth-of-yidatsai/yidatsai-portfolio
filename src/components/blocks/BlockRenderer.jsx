import { useLayoutEffect } from 'react';
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
  // ── 在首次 paint 前修正所有 pin spacer 位置 ──────────────────────────
  //
  // 問題：各 block 的 GSAP useLayoutEffect 依序執行，每個 block 在初始化時
  //      都會插入 pin spacer，導致後續 block 量測到的位置被前面的 spacer 偏移。
  //      結果是 pin 的 start/end 全部計算錯誤，捲動時產生跳動。
  //
  // 修正：React 保證父元件的 useLayoutEffect 在所有子元件之後執行。
  //      在這裡呼叫 ScrollTrigger.refresh() 時，所有 block 已完成初始化
  //      且 pin spacer 已全部插入，refresh 重新量測正確位置。
  //      因為仍在 useLayoutEffect（首次 paint 之前），不觸發 CLS。
  useLayoutEffect(() => {
    if (!blocks?.length) return;
    ScrollTrigger.refresh();
  }, [blocks]);

  if (!blocks?.length) return null;
  return (
    <div style={{ display: 'contents' }}>
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