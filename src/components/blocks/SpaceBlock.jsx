import { memo } from "react";

function SpaceBlock({ space = "var(--space-xl)" }) {
  return <div aria-hidden="true" style={{ height: space }} />;
}

export default memo(SpaceBlock);
