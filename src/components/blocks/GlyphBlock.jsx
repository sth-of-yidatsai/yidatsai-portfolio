import { memo, useEffect, useState } from 'react';
import './GlyphBlock.css';

// Printable ASCII: ! (0x21) → ~ (0x7E), 94 chars
const DEFAULT_CHARS = Array.from({ length: 94 }, (_, i) =>
  String.fromCodePoint(0x21 + i)
);

const COLS = 14;

function GlyphBlock({ fonts = [], chars, title = 'Glyph Map' }) {
  const [ready, setReady] = useState(false);
  const glyphChars = chars ?? DEFAULT_CHARS;

  useEffect(() => {
    if (!fonts.length) return;
    let cancelled = false;
    const faces = fonts.map(f => new FontFace(f.name, `url(${f.url})`));

    Promise.all(faces.map(f => f.load()))
      .then(loaded => {
        if (cancelled) return;
        loaded.forEach(f => document.fonts.add(f));
        setReady(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      faces.forEach(f => {
        try { document.fonts.delete(f); } catch (_) {}
      });
    };
  // fonts is defined outside the component (module-level constant) → stable ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="block block--glyph">
      <div className="block--glyph__inner">
        {title && (
          <div className="block--glyph__header">
            <p className="block--glyph__header-label">Font Name</p>
            <p className="block--glyph__header-title">{title}</p>
          </div>
        )}

        {fonts.map(font => (
          <div key={font.name} className="block--glyph__font-group">
            {fonts.length > 1 && (
              <p className="block--glyph__font-name">{font.name}</p>
            )}
            <div
              className="block--glyph__grid"
              style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.3s' }}
              aria-label={`${font.name} glyph map`}
            >
              {glyphChars.map((char, i) => (
                <div key={i} className="block--glyph__cell">
                  <span className="block--glyph__label">{char}</span>
                  <span
                    className="block--glyph__char"
                    style={{ fontFamily: `"${font.name}", serif` }}
                  >
                    {char}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(GlyphBlock);
