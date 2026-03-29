import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLoader } from "./use-loader/index.jsx";

gsap.registerPlugin(ScrollTrigger);

/**
 * 在頁面 mount 時持有 LoaderProvider 的 content gate，
 * 等所有圖片下載並 GPU decode 完畢後才釋放，
 * 確保 loader 關閉時頁面已完全就緒、捲動零卡頓。
 *
 * @param {string[]} imageUrls - 需要預載的圖片 URL 陣列
 */
export function usePagePreloader(imageUrls = [], timeoutMs = 10_000) {
  const { waitForContent, signalContentReady } = useLoader();
  const signaledRef = useRef(false);

  useEffect(() => {
    if (!imageUrls.length) return;

    signaledRef.current = false;
    waitForContent(); // 持有 gate → loader 不關閉

    const done = () => {
      if (signaledRef.current) return;
      signaledRef.current = true;
      // 圖片尺寸確定後重算 GSAP pin spacer，避免 TitleBlock 等固定動畫位置錯誤
      ScrollTrigger.refresh();
      signalContentReady(); // 釋放 gate → loader 可關閉
    };

    // 10 秒 failsafe：慢速網路不會讓 loader 永遠卡住
    const timeout = setTimeout(done, timeoutMs);

    Promise.all([
      // decode() 等到 GPU-ready 像素層完成，消除捲動時主執行緒解碼造成的掉幀
      ...imageUrls.map((url) => {
        const img = new Image();
        img.src = url;
        return img.decode().catch(() => {});
      }),
      // 等字型載入完成，避免字型 reflow 讓 TitleBlock pin spacer 計算錯誤
      document.fonts.ready,
    ]).then(done);

    return () => {
      clearTimeout(timeout);
      // 元件提前卸載時釋放 gate，避免 loader 卡死
      if (!signaledRef.current) {
        signaledRef.current = true;
        signalContentReady();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
