import React from "react";
import BioSection from "../components/sections/about-page/BioSection";
import TrajectorySection from "../components/sections/about-page/TrajectorySection";
import CapabilitiesSection from "../components/sections/about-page/CapabilitiesSection";
import "./About.css";
import { usePagePreloader } from "../hooks/usePagePreloader";

const PRELOAD_IMAGES = [
  '/images/about/01.webp',
  '/images/about/02.webp',
  '/images/about/03.webp',
  '/images/about/04.webp',
  '/images/about/05.webp',
];

export default function About() {
  usePagePreloader(PRELOAD_IMAGES);
  return (
    <main className="about-page">
      <BioSection />
      <TrajectorySection />
      <CapabilitiesSection />
    </main>
  );
}
