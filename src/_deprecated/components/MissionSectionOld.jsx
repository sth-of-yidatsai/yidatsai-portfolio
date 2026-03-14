import React from "react";
import "./MissionSection.css";

export default function MissionSection({ index }) {
  return (
    <div className={`hs-section mission-section hs-section-${index}`}></div>
  );
}
