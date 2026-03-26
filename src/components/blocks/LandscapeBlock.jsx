import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./blocks.css";

gsap.registerPlugin(ScrollTrigger);

const ASPECT = 21 / 9;

export default function LandscapeBlock({ images = [], bg = "var(--gray-25)" }) {
  const [img1, img2, img3] = images;

  const sectionRef = useRef(null);
  const frameWrapRef = useRef(null);
  const img2Ref = useRef(null);
  const img3Ref = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const frameWrap = frameWrapRef.current;
    const img2El = img2Ref.current;
    const img3El = img3Ref.current;
    if (!section || !frameWrap) return;

    let ctx;
    const setup = () => {
      ctx?.revert();

      const vw = section.offsetWidth;
      const vh = window.innerHeight;

      const frameW = vw * 0.62;
      const frameH = frameW / ASPECT;
      const finalScale = Math.max(vw / frameW, vh / frameH) * 1.02;

      // frame 一開始即全尺寸
      gsap.set(frameWrap, { width: frameW, height: frameH, scale: 1 });

      // img2 / img3：從中心縮放入場
      if (img2El)
        gsap.set(img2El, { scale: 0, transformOrigin: "center center" });
      if (img3El)
        gsap.set(img3El, { scale: 0, transformOrigin: "center center" });

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            pin: true,
            anticipatePin: 1,
            start: "top top",
            end: `+=${vh * 1.8}`,
            scrub: true,
            onEnter()     { section.classList.add('is-pinned'); },
            onLeave()     { section.classList.remove('is-pinned'); },
            onEnterBack() { section.classList.add('is-pinned'); },
            onLeaveBack() { section.classList.remove('is-pinned'); },
          },
        });

        // Phase 1：img2 從中心縮放至填滿圖片框（同 LandscapeSection）
        if (img2El) {
          tl.to(img2El, { scale: 1, ease: "none", duration: 0.8 });
        }

        // Phase 2：img3 從中心縮放入場
        if (img3El) {
          tl.to(img3El, { scale: 1, ease: "none", duration: 0.8 }, ">");
        }

        // Phase 3：frame 整體放大至全屏
        tl.to(
          frameWrap,
          { scale: finalScale, ease: "none", duration: 0.85 },
          ">",
        );
      }, section);
    };

    setup();
    window.addEventListener("resize", setup);
    return () => {
      window.removeEventListener("resize", setup);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      className="block block--image"
      ref={sectionRef}
      style={{ background: bg }}
    >
      <div className="block--image__frame-wrap" ref={frameWrapRef}>
        <div className="block--image__frame">
          {/* img1：底圖，靜態 */}
          {img1 && (
            <img
              src={img1}
              alt=""
              className="block--image__frame-img"
            />
          )}

          {/* img2：Phase 1 縮放至填滿圖片框 */}
          {img2 && (
            <img
              ref={img2Ref}
              src={img2}
              alt=""
              className="block--image__cover-img"
            />
          )}

          {/* img3：Phase 2 縮放入場，Phase 3 隨 frame 全屏 */}
          {img3 && (
            <img
              ref={img3Ref}
              src={img3}
              alt=""
              className="block--image__cover-img"
            />
          )}
        </div>
      </div>
    </section>
  );
}
