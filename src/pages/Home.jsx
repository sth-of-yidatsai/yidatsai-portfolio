import React from "react";
import "./Home.css";
import HorizontalScroller from "../components/HorizontalScroller";
import CubeGallery from "../components/sections/vertical-sections/CubeGallery";
import HeroSection from "../components/sections/vertical-sections/HeroSection";
import { VisionSection } from "../components/sections/horizontal-sections";

export default function Home() {
  return (
    <div className="home-container">
      <HeroSection />
      <HorizontalScroller />
      <CubeGallery />
      <VisionSection />
    </div>
  );
}
