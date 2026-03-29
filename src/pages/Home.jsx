import React from "react";
import "./Home.css";
import HorizontalScroller from "../components/sections/home-page/horizontal-sections/HorizontalScroller";
import { HeroSection, FieldSection, VisionSection } from "../components/sections/home-page/vertical-sections";
import { usePagePreloader } from "../hooks/usePagePreloader";

const PRELOAD_IMAGES = [
  // HeroSection carousel
  '/images/projects/formosa-font/cover.webp',
  '/images/projects/patterned-glass-notebook/01.webp',
  '/images/projects/foucault-book-binding/02.webp',
  '/images/projects/patterned-glass-notebook/03.webp',
  '/images/projects/formosa-font/04.webp',
  // FieldSection
  '/images/projects/patterned-glass-notebook/cover.webp',
  '/images/projects/patterned-glass-notebook/02.webp',
  '/images/projects/patterned-glass-notebook/04.webp',
  // LandscapeSection
  '/images/projects/foucault-book-binding/08.webp',
  '/images/projects/foucault-book-binding/cover.webp',
  // ApproachSection
  '/images/projects/foucault-book-binding/05.webp',
  '/images/projects/foucault-book-binding/07.webp',
];

export default function Home() {
  usePagePreloader(PRELOAD_IMAGES);
  return (
    <div className="home-container">
      <HeroSection />
      <FieldSection />
      <HorizontalScroller />
      <VisionSection />
    </div>
  );
}
