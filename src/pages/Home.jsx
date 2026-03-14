import React from "react";
import "./Home.css";
import HorizontalScroller from "../components/HorizontalScroller";
import { HeroSection, FieldSection, VisionSection } from "../components/sections/vertical-sections";

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
