import './BilingTitle.css';

/**
 * BilingTitle — renders an English title with an optional Chinese subtitle.
 *
 * In EN mode (zh = null): renders only the English title.
 * In ZH mode (zh = string): renders EN title + Chinese subtitle below.
 *
 * Props:
 *   en        {string}  required — the English title
 *   zh        {string|null}  optional — Chinese subtitle; pass null to render EN-only
 *   as        {string}  heading tag: 'h1'|'h2'|'h3' etc. default 'h2'
 *   className {string}  forwarded to the heading element
 */
export default function BilingTitle({ en: enText, zh = null, as: Tag = 'h2', className = '' }) {
  if (!zh) {
    return <Tag className={className}>{enText}</Tag>;
  }

  return (
    <Tag className={`biling-title ${className}`.trim()}>
      <span className="biling-en">{enText}</span>
      <span className="biling-zh" lang="zh-TW">{zh}</span>
    </Tag>
  );
}
