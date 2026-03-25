// ScrollDetection 已移至 Context singleton，避免多個元件各自掛載 wheel listener。
// 保留此檔案供向下相容，所有 import 來源不需修改。
export { useScrollDetection } from "../contexts/ScrollDetectionContext";
