import React, { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BioSection from "../components/sections/about-page/BioSection";
import TrajectorySection from "../components/sections/about-page/TrajectorySection";
import CapabilitiesSection from "../components/sections/about-page/CapabilitiesSection";
import "./About.css";
import { usePagePreloader } from "../hooks/usePagePreloader";
import { useTranslation } from "../hooks/useTranslation";

gsap.registerPlugin(ScrollTrigger);

const PRELOAD_IMAGES = [
  '/images/about/01.webp',
  '/images/about/02.webp',
  '/images/about/03.webp',
  '/images/about/04.webp',
  '/images/about/05.webp',
];

export default function About() {
  usePagePreloader(PRELOAD_IMAGES);
  const { t } = useTranslation();

  // ScrollTriggers are created while body.overflow='hidden' (loader active).
  // Once the loader hides and overflow is restored, the true scrollable height
  // is available — refresh here so all pin spacer positions are correct.
  useEffect(() => {
    const onLoaderHidden = () => ScrollTrigger.refresh();
    window.addEventListener('loader:hidden', onLoaderHidden);
    return () => window.removeEventListener('loader:hidden', onLoaderHidden);
  }, []);

  return (
    <main className="about-page">
      <h1 className="sr-only">{t('seo.h1.about')}</h1>
      <BioSection />
      <TrajectorySection />
      <CapabilitiesSection />
    </main>
  );
}
