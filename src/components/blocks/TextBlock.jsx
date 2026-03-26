import { memo, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './blocks.css';

gsap.registerPlugin(ScrollTrigger);

function TextBlock({
  label     = '',
  text      = '',
  content   = '',                    // backward compat
  bg        = 'transparent',
  color     = 'var(--gray-600)',
  fillColor = 'var(--gray-900)',
  align,
}) {
  const body    = text || content;
  const chars   = [...body];

  const sectionRef = useRef(null);
  const charsRef   = useRef([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const charEls = charsRef.current.filter(Boolean);
    if (!section || !charEls.length) return;

    charEls.forEach(c => { c.style.color = color; });

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
              const filled = Math.round(self.progress * charEls.length);
              if (filled === lastFilled) return;
              if (filled > lastFilled) {
                for (let i = lastFilled; i < filled; i++) charEls[i].style.color = fillColor;
              } else {
                for (let i = filled; i < lastFilled; i++) charEls[i].style.color = color;
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
      className={`block block--text block--text--sticky${align === 'center' ? ' block--text--center' : ''}`}
      ref={sectionRef}
      style={{ background: bg }}
    >
      <div className="block--text__inner">
        {label && <p className="block--text__label">{label}</p>}
        <p className="block--text__content">
          {chars.map((char, i) => (
            <span
              key={i}
              className="block--text__char"
              ref={el => { charsRef.current[i] = el; }}
            >
              {char}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

export default memo(TextBlock);
