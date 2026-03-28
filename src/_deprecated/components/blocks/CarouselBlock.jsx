import { memo } from "react";
import "./blocks.css";

function CarouselBlock({ images = [] }) {
  const [img1, img2, img3] = images;

  return (
    <section
      className="block block--carousel"
      data-scroll-type="carousel"
    >
      <div className="block--carousel__slides">
        {img1 && (
          <img
            src={img1}
            alt=""
            className="block--carousel__slide"
          />
        )}
        {img2 && (
          <img
            src={img2}
            alt=""
            className="block--carousel__slide"
          />
        )}
        {img3 && (
          <img
            src={img3}
            alt=""
            className="block--carousel__slide"
          />
        )}
      </div>
    </section>
  );
}

export default memo(CarouselBlock);
