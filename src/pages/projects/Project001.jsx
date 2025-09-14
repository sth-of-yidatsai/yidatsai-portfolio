import React from "react";
import { Link } from "react-router-dom";

export default function Project001({ project }) {
  // 保留 loader 傳入的 project，若外部未傳入則留後備保護
  const data = project || {
    title: "Project 001",
    year: "",
    projectImages: [],
    description: "",
  };

  return (
    <div style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link to="/projects">← 返回作品牆</Link>
      </div>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>{data.title}</h1>
        <div style={{ opacity: 0.6 }}>{data.year}</div>
      </header>

      {/* Hero 區塊：可置入自定動畫或版面 */}
      <section style={{ marginBottom: 48 }}>
        {data.projectImages?.[0] && (
          <img
            src={data.projectImages[0]}
            alt={`${data.title} hero`}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        )}
      </section>

      {/* 內容區塊：示意排版，可依實際需求改寫成全自定 UI */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 12px" }}>Concept</h2>
          <p>{data.description}</p>
        </div>
        <div>
          <h2 style={{ margin: "0 0 12px" }}>Specs</h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>
              Category:{" "}
              {Array.isArray(data.category)
                ? data.category.join(", ")
                : data.category || "-"}
            </li>
            <li>
              Tags: {Array.isArray(data.tags) ? data.tags.join(", ") : "-"}
            </li>
            <li>Year: {data.year || "-"}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
