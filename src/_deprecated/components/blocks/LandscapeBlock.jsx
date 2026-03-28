import { memo } from "react";
import "./blocks.css";

function LandscapeBlock({ images = [], bg = "var(--gray-25)" }) {
  const [img1, img2, img3] = images;

  return (
    <section
      className="block block--image"
      data-scroll-type="landscape"
      style={{ background: bg }}
    >
      <div className="block--image__frame-wrap">
        <div className="block--image__frame">
          {img1 && (
            <img
              src={img1}
              alt=""
              className="block--image__frame-img"
            />
          )}
          {img2 && (
            <img
              src={img2}
              alt=""
              className="block--image__cover-img"
            />
          )}
          {img3 && (
            <img
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

export default memo(LandscapeBlock);
