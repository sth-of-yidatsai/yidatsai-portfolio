import React from "react";
import "./Home.css";
import HorizontalScroller from "../components/sections/homePage/horizontal-sections/HorizontalScroller";
import { HeroSection, FieldSection, VisionSection } from "../components/sections/homePage/vertical-sections";

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
