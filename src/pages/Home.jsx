import React from "react";
import "./Home.css";
import HorizontalScroller from "../components/HorizontalScroller";
import { CubeGallery } from "../components/sections/vertical-sections";

export default function Home() {
  return (
    <div className="home-container">
      <HorizontalScroller />
      <CubeGallery />
    </div>
  );
}
