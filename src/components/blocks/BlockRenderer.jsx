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
};

export default function BlockRenderer({ blocks, project }) {
  if (!blocks?.length) return null;
  return (
    <>
      {blocks.map((block, i) => {
        const Block = BLOCK_MAP[block.type];
        if (!Block) {
          console.warn(`[BlockRenderer] Unknown block type: "${block.type}"`);
          return null;
        }
        return <Block key={i} project={project} {...block} />;
      })}
    </>
  );
}