import widths from '../data/imageWidths.json';

/**
 * Given a WebP image path, returns a srcset string with 800w, 1200w, 1600w variants
 * plus the original at its actual pixel width (from imageWidths.json manifest).
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
  const originalWidth = widths[src];
  return [
    `${base}-800${ext} 800w`,
    `${base}-1200${ext} 1200w`,
    `${base}-1600${ext} 1600w`,
    originalWidth ? `${src} ${originalWidth}w` : null,
  ].filter(Boolean).join(', ');
}
