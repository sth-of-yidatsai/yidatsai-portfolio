import React from "react";
import BioSection from "../components/sections/About-page/BioSection";
import TrajectorySection from "../components/sections/About-page/TrajectorySection";
import CapabilitiesSection from "../components/sections/About-page/CapabilitiesSection";
import "./About.css";

export default function About() {
  return (
    <main className="about-page">
      <BioSection />
      <TrajectorySection />
      <CapabilitiesSection />
    </main>
  );
}
