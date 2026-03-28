import { memo } from "react";
import './blocks.css';

function SpacerBlock({ size = 'md' }) {
  const validSizes = ['sm', 'md', 'lg', 'xl'];
  const s = validSizes.includes(size) ? size : 'md';
  return <div className={`block block--spacer--${s}`} aria-hidden="true" />;
}
export default memo(SpacerBlock);
