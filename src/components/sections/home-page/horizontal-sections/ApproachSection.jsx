import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ApproachSection.css";
import { buildSrcSet } from "../../../../utils/imgSrcSet";

gsap.registerPlugin(ScrollTrigger);

// ── 圖片配置 ── 統一管理，方便置換
const approachConfig = {
  leftImage:  "/images/projects/foucault-book-binding/05.webp",
  rightImage: "/images/projects/foucault-book-binding/07.webp",
};

export default function ApproachSection({ index, pinContainerRef }) {
  const leftSrc  = approachConfig.leftImage;
  const rightSrc = approachConfig.rightImage;

  const leftFrameRef  = useRef(null);
  const leftImgRef    = useRef(null);
  const rightFrameRef = useRef(null);
  const rightImgRef   = useRef(null);

  useEffect(() => {
    if (!pinContainerRef) return;

    const horizontalST = ScrollTrigger.getById("horizontal-scroll");
    if (!horizontalST?.animation) return;

    const imgs = [
      { frame: leftFrameRef.current,  img: leftImgRef.current },
      { frame: rightFrameRef.current, img: rightImgRef.current },
    ];

    const ctx = gsap.context(() => {
      imgs.forEach(({ frame, img }) => {
        if (!frame || !img) return;

        // Vertical: yPercent 0 → -5 as hs-container scrolls into view
        gsap.to(img, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: pinContainerRef.current,
            start: "top bottom",
            end:   "top top",
            scrub: true,
          },
        });

        // Horizontal: xPercent +8 → -8 as ApproachSection traverses the viewport
        gsap.fromTo(
          img,
          { xPercent: 6 },
          {
            xPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              containerAnimation: horizontalST.animation,
              start: "left right",
              end:   "right left",
              scrub: true,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, [pinContainerRef]);

  return (
    <section className={`as-section hs-section hs-section-${index}`}>

      {/* ── Left Panel ── */}
      <div className="as-left">
        <div className="as-left-content">

          {/* Small 1:1 image */}
          <div className="as-small-image">
            <div ref={leftFrameRef} className="as-image-frame">
              <div className="as-image-wrapper">
                <img
                  ref={leftImgRef}
                  src={leftSrc}
                  srcSet={buildSrcSet(leftSrc)}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  alt="Design approach"
                  className="as-image"
                />
              </div>
            </div>
          </div>

          {/* Text block */}
          <div className="as-text-block">
            <h2 className="as-title">Design Approach</h2>
            <span className="as-rule" />
            <p className="as-body">
              Each project begins with an idea and evolves
              <br />through structure, material and detail.
            </p>
            <p className="as-body">
              By balancing aesthetics and logic,
              <br />the design forms a clear and meaningful
              <br />experience.
            </p>
          </div>

        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="as-right">

        {/* Full-bleed background image */}
        <div ref={rightFrameRef} className="as-right-image-frame">
          <div className="as-right-image-wrapper">
            <img
              ref={rightImgRef}
              src={rightSrc}
              srcSet={buildSrcSet(rightSrc)}
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="Design work"
              className="as-right-image"
            />
          </div>
        </div>


      </div>

    </section>
  );
}
