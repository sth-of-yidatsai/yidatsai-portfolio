
/**
 * Given a WebP image path, returns a srcset string with 800w, 1200w, 1600w, 2400w, 3200w variants
 * plus the original at its actual pixel width (from imageWidths.json manifest) if > 3200px.
 * SVG paths and null/undefined values return null (no srcset).
 *
 * Example:
 *   buildSrcSet('/images/projects/formosa-font/01.webp')
 *   => '...01-800.webp 800w, ...01-1200.webp 1200w, ...01-1600.webp 1600w, ...01.webp 3840w'
 */
export function buildSrcSet(src) {
  if (!src || src.endsWith('.svg')) return null;
  const dot = src.lastIndexOf('.');
  const base = src.slice(0, dot);
  const ext = src.slice(dot);
  return [
    `${base}-800${ext} 800w`,
    `${base}-1200${ext} 1200w`,
    `${base}-1600${ext} 1600w`,
    `${base}-2400${ext} 2400w`,
    `${base}-3200${ext} 3200w`,
  ].filter(Boolean).join(', ');
}

/**
 * Picks the appropriate responsive variant for preloading based on the
 * current device's viewport width × DPR. SVG paths are returned as-is.
 *
 * Used in PRELOAD_IMAGES arrays on project detail pages so the preloader
 * fetches the same size the browser will actually use via srcset.
 */
export function pickResponsiveSrc(src) {
  if (!src || src.endsWith('.svg')) return src;
  const needed = window.innerWidth * (window.devicePixelRatio || 1);
  const dot = src.lastIndexOf('.');
  const base = src.slice(0, dot);
  const ext = src.slice(dot);
  if (needed <= 900)  return `${base}-800${ext}`;
  if (needed <= 1400) return `${base}-1200${ext}`;
  if (needed <= 1800) return `${base}-1600${ext}`;
  if (needed <= 2600) return `${base}-2400${ext}`;
  if (needed <= 3400) return `${base}-3200${ext}`;
  return src;
}
