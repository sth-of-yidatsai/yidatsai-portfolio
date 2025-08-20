import React from "react";
import "./MarqueeText.css";

export default function MarqueeText({
  textColor = "var(--color-light)",
  lineColor = "var(--color-bg)",
  className = "",
}) {
  // 統一的跑馬燈文字內容
  const items = [
    "GRAPHIC",
    "UIUX",
    "3DART",
    "TYPOGRAPHY",
    "EDITORIAL",
    "MOTION",
  ];
  const yearText = "©2025";
  const duplicatedItems = [...items, ...items];

  return (
    <div className={`brand-info ${className}`}>
      <div className="brand-line" style={{ background: lineColor }} />
      <div className="brand-text">
        <span className="work-categories">
          <div className="marquee-text-inner">
            <div
              className="marquee-content"
              style={{
                "--text-color": textColor,
                "--animation-duration": "30s",
              }}
            >
              {duplicatedItems.map((item, index) => (
                <span key={index} className="marquee-item">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </span>
        <span className="brand-year">{yearText}</span>
      </div>
    </div>
  );
}
