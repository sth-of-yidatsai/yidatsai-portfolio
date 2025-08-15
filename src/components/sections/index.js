// 導出所有 section 組件
export { default as VisionSection } from "./VisionSection";
export { default as MissionSection } from "./MissionSection";
export { default as WorksSection } from "./WorksSection";
export { default as ProjectsSection } from "./ProjectsSection";

// 簡化的 Section 配置資料 - 只保留識別用的 id 和 title
export const sectionConfigs = [
  { id: "vision", title: "Vision" },
  { id: "mission", title: "Mission" },
  { id: "works", title: "Works" },
  { id: "projects", title: "Projects" },
];
