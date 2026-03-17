import React from "react";
import "./Home.css";
import HorizontalScroller from "../components/sections/home-page/horizontal-sections/HorizontalScroller";
import { HeroSection, FieldSection, VisionSection } from "../components/sections/home-page/vertical-sections";

export default function Home() {
  return (
    <div className="home-container">
      <HeroSection />
      <FieldSection />
      <HorizontalScroller />
      <VisionSection />
    </div>
  );
}
