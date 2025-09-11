// 導出所有水平 section 組件
export { default as OverviewSection } from "./OverviewSection";
export { default as ProjectsSection } from "./ProjectsSection";
export { default as MissionSection } from "./MissionSection";

// 簡化的水平 Section 配置資料
export const sectionConfigs = [
  { id: "overview", title: "Overview" },
  { id: "mission", title: "Mission" },
  { id: "projects", title: "Projects" },
];
