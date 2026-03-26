import { memo, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './blocks.css';

gsap.registerPlugin(ScrollTrigger);

function SectionTitleBlock({
  project = {},
  bg        = 'var(--gray-900)',
  color     = 'var(--gray-600)',   // 填色前（暗）
  fillColor = 'var(--gray-50)',    // 填色後（亮）
}) {
  const { title = '', description = '' } = project;

  const sectionRef = useRef(null);
  const charsRef   = useRef([]);

  const titleChars       = [...title];
  const descChars        = [...description];
  const descOffset       = titleChars.length;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const chars   = charsRef.current.filter(Boolean);
    if (!section || !chars.length) return;

    chars.forEach(c => { c.style.color = color; });

    let ctx;
    const setup = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          pin:          true,
          anticipatePin: 1,
          start:        'top top',
          end:          `+=${window.innerHeight * 1.8}`,
          scrub:        true,
          // Only update the chars that actually change state (O(delta) not O(N))
          onUpdate: (() => {
            let lastFilled = 0;
            return (self) => {
              const filled = Math.round(self.progress * chars.length);
              if (filled === lastFilled) return;
              if (filled > lastFilled) {
                for (let i = lastFilled; i < filled; i++) chars[i].style.color = fillColor;
              } else {
                for (let i = filled; i < lastFilled; i++) chars[i].style.color = color;
              }
              lastFilled = filled;
            };
          })(),
        });
      }, section);
    };

    setup();
    window.addEventListener('resize', setup);
    return () => {
      window.removeEventListener('resize', setup);
      ctx?.revert();
    };
  }, [color, fillColor]);

  return (
    <section
      className="block block--section-title block--section-title--sticky"
      ref={sectionRef}
      style={{ background: bg }}
    >
      <div className="block--section-title__inner">

        <p className="block--section-title__label">Title</p>

        <h2 className="block--section-title__title">
          {titleChars.map((char, i) => (
            <span
              key={i}
              className="block--section-title__char"
              ref={el => { charsRef.current[i] = el; }}
            >
              {char}
            </span>
          ))}
        </h2>

        {description && (
          <p className="block--section-title__subtitle">
            {descChars.map((char, i) => (
              <span
                key={i}
                className="block--section-title__char"
                ref={el => { charsRef.current[descOffset + i] = el; }}
              >
                {char}
              </span>
            ))}
          </p>
        )}

      </div>
    </section>
  );
}

export default memo(SectionTitleBlock);
