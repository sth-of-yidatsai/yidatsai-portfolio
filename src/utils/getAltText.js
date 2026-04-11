import alts from '../data/image-alts.json';

const VARIANT_RE = /-(?:800|1200|1600|2400|3200)(\.\w+)$/;

/**
 * Look up generated alt text for a project image.
 *
 * Accepts either:
 *   - Full URL path:  "/images/projects/formosa-font/01.webp"
 *   - Relative key:  "formosa-font/01.webp"
 *
 * @param {string} src
 * @param {string} [fallback='']
 * @param {string} [lang='en']  'en' or 'zh'
 * @returns {string}
 */
export function getAltText(src, fallback = '', lang = 'en') {
  if (!src) return fallback;
  const key = src.replace(/^\/images\/projects\//, '').replace(VARIANT_RE, '$1');
  const val = alts[key];
  if (!val) return fallback;
  // Support both old string format and new { en, zh } object format
  if (typeof val === 'string') return val || fallback;
  return val[lang] || val.en || fallback;
}
