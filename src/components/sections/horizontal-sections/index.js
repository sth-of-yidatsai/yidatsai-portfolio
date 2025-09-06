// 導出所有 section 組件
export { default as HeroSection } from "./HeroSection";
export { default as VisionSection } from "./VisionSection";
export { default as ProjectsSection } from "./ProjectsSection";
export { default as MissionSection } from "./MissionSection";
export { default as PracticesSection } from "../vertical-sections/PracticesSection";

// 簡化的 Section 配置資料 - 調整順序：Hero => Practices => Projects
export const sectionConfigs = [
  { id: "hero", title: "Hero" },
  { id: "practices", title: "Practices" },
  { id: "projects", title: "Projects" },
];
