import React from "react";
import "./Home.css";
import HorizontalScroller from "../components/HorizontalScroller";
import { CubeGallery } from "../components/sections/vertical-sections";
import VisionSection from "../components/sections/horizontal-sections/VisionSection";

export default function Home() {
  return (
    <div className="home-container">
      <HorizontalScroller />
      <CubeGallery />
      <VisionSection index={0} />
    </div>
  );
}
