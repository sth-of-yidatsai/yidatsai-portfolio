import React from "react";
import "./Home.css";
import HorizontalScroller from "../components/sections/home-page/horizontal-sections/HorizontalScroller";
import { HeroSection, FieldSection, VisionSection } from "../components/sections/home-page/vertical-sections";
import { usePagePreloader } from "../hooks/usePagePreloader";
import { useTranslation } from "../hooks/useTranslation";

const PRELOAD_IMAGES = [
  // HeroSection carousel
  '/images/projects/foucault-book-binding/03.webp',
  '/images/projects/formosa-font/15.webp',
  '/images/projects/patterned-glass-notebook/08.webp',
  '/images/projects/formosa-font/13.webp',
  '/images/projects/foucault-book-binding/01.webp',
  // FieldSection
  '/images/projects/foucault-book-binding/08.webp',
  '/images/projects/patterned-glass-notebook/16.webp',
  '/images/projects/patterned-glass-notebook/12.webp',
  '/images/projects/patterned-glass-notebook/05.webp',
  // LandscapeSection
  '/images/projects/foucault-book-binding/09.webp',
  // ApproachSection
  '/images/projects/foucault-book-binding/06.webp',
  '/images/projects/foucault-book-binding/20.webp',
];

export default function Home() {
  usePagePreloader(PRELOAD_IMAGES);
  const { t } = useTranslation();
  return (
    <div className="home-container">
      <h1 className="sr-only">{t('seo.h1.home')}</h1>
      <HeroSection />
      <FieldSection />
      <HorizontalScroller />
      <VisionSection />
    </div>
  );
}
