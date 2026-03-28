import { memo, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './TitleBlock.css';

gsap.registerPlugin(ScrollTrigger);

const FILL_COLOR  = 'var(--gray-50)';
const EMPTY_COLOR = 'var(--gray-500)';

function TitleBlock({ title = '', description = '' }) {
  const sectionRef  = useRef(null);
  const titleCharsRef = useRef([]);
  const descCharsRef  = useRef([]);

  useLayoutEffect(() => {
    const section    = sectionRef.current;
    const titleChars = titleCharsRef.current.filter(Boolean);
    const descChars  = descCharsRef.current.filter(Boolean);
    const allChars   = [...titleChars, ...descChars];
    if (!section || !allChars.length) return;

    allChars.forEach(c => { c.style.color = EMPTY_COLOR; });

    let ctx;
    const setup = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          pin:     true,
          start:   'top top',
          end:     `+=${window.innerHeight * 1.8}`,
          scrub:   0.6,
          onUpdate(self) {
            const filled = Math.round(self.progress * allChars.length);
            allChars.forEach((c, i) => {
              c.style.color = i < filled ? FILL_COLOR : EMPTY_COLOR;
            });
          },
        });
      }, section);
    };

    setup();
    window.addEventListener('resize', setup);
    return () => {
      window.removeEventListener('resize', setup);
      ctx?.revert();
    };
  }, []);

  return (
    <section className="block block--title" ref={sectionRef}>
      <div className="block--title__inner">
        <p className="block--title__label">Title</p>

        <h2 className="block--title__title">
          {[...title].map((char, i) => (
            <span
              key={i}
              className="block--title__char"
              ref={el => { titleCharsRef.current[i] = el; }}
            >
              {char}
            </span>
          ))}
        </h2>

        {description && (
          <p className="block--title__description">
            {[...description].map((char, i) => (
              <span
                key={i}
                className="block--title__char"
                ref={el => { descCharsRef.current[i] = el; }}
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

export default memo(TitleBlock);
