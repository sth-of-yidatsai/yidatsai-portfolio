/**
 * Resolves a bilingual prop to a plain string.
 *
 * Usage in JSX:
 *   text="Plain string"                   → always that string
 *   text={{ en: "Hello", zh: "你好" }}    → picks by language
 *
 * @param {string | { en?: string, zh?: string } | null | undefined} value
 * @param {'en' | 'zh'} language
 * @returns {string | undefined}
 */
export function pickLang(value, language) {
  if (!value) return value;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return language === 'zh' ? (value.zh ?? value.en) : (value.en ?? value.zh);
  }
  return value;
}
