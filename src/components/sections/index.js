// 導出所有 section 組件
export { default as HeroSection } from "./HeroSection";
export { default as VisionSection } from "./VisionSection";
export { default as ProjectsSection } from "./ProjectsSection";

// 簡化的 Section 配置資料 - 調整順序：Hero => Vision => Projects
export const sectionConfigs = [
  { id: "hero", title: "Hero" },
  { id: "vision", title: "Vision" },
  { id: "projects", title: "Projects" },
];
