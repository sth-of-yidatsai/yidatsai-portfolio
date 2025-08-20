import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useLoader } from "./use-loader/index.jsx";

/**
 * 可重用的文字動畫 Hook
 * @param {Object} options - 動畫選項
 * @param {number} options.delay - 動畫延遲時間 (毫秒)
 * @param {string} options.splitType - 分割類型: 'words' | 'sentences' | 'both'
 * @param {Object} options.wordAnimation - 單詞動畫配置
 * @param {Object} options.sentenceAnimation - 句子動畫配置
 * @param {number} options.threshold - 觸發動畫的可視區域閾值 (0-1)
 * @param {string} options.rootMargin - 擴展根邊界的邊距
 * @returns {Object} - 包含 textRef 和控制方法的對象
 */
export function useTextAnimation(options = {}) {
  const textRef = useRef(null);
  const animationRef = useRef(null);
  const observerRef = useRef(null);
  const isInitialized = useRef(false);
  const hasTriggered = useRef(false);
  const { loading } = useLoader();

  const defaultOptions = {
    delay: 300,
    splitType: "both", // 'words', 'sentences', 'both'
    threshold: 0.1, // 當 10% 的元素進入視窗時觸發
    rootMargin: "0px 0px -10% 0px", // 稍微提前觸發
    wordAnimation: {
      from: {
        opacity: 0,
        y: 60,
      },
      to: {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
        stagger: 0.1,
      },
    },
    sentenceAnimation: {
      from: {
        opacity: 0,
        y: 20,
      },
      to: {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.2,
      },
      offset: "-=0.3", // 相對於前一個動畫的偏移
    },
  };

  const config = { ...defaultOptions, ...options };

  // 手動分割文字為單詞
  const splitTextIntoWords = (element) => {
    const text = element.textContent;
    const words = text.split(" ");
    element.innerHTML = words
      .map((word) => `<span class="word-animate">${word}</span>`)
      .join(" ");
    return element.querySelectorAll(".word-animate");
  };

  // 手動分割文字為句子
  const splitTextIntoSentences = (element) => {
    const text = element.textContent;
    const sentences = text.split(/(?<=[.!?])\s+/);
    element.innerHTML = sentences
      .map((sentence) => `<span class="sentence-animate">${sentence}</span>`)
      .join(" ");
    return element.querySelectorAll(".sentence-animate");
  };

  // 執行動畫
  const animate = () => {
    const textElement = textRef.current;
    if (!textElement) return;

    const elements = textElement.querySelectorAll("[data-animate]");
    if (elements.length === 0) return;

    // 先標記動畫準備就緒，讓CSS顯示文字
    elements.forEach((element) => {
      element.classList.add("animation-ready");
    });

    const timeline = gsap.timeline({
      onComplete: () => {
        // 動畫完成後添加class
        elements.forEach((element) => {
          element.classList.add("animation-complete");
        });
      },
    });
    let hasWordAnimation = false;

    elements.forEach((element) => {
      const animationType = element.getAttribute("data-animate");

      if (
        animationType === "words" ||
        (animationType === "both" && config.splitType !== "sentences")
      ) {
        const words = splitTextIntoWords(element);

        // 設置初始狀態
        gsap.set(words, config.wordAnimation.from);

        // 添加到時間軸
        if (!hasWordAnimation) {
          timeline.to(words, config.wordAnimation.to);
          hasWordAnimation = true;
        } else {
          timeline.to(
            words,
            config.wordAnimation.to,
            config.sentenceAnimation.offset || 0
          );
        }
      }

      if (
        animationType === "sentences" ||
        (animationType === "both" && config.splitType !== "words")
      ) {
        const sentences = splitTextIntoSentences(element);

        // 設置初始狀態
        gsap.set(sentences, config.sentenceAnimation.from);

        // 添加到時間軸
        const offset = hasWordAnimation ? config.sentenceAnimation.offset : 0;
        timeline.to(sentences, config.sentenceAnimation.to, offset);
      }
    });

    animationRef.current = timeline;
  };

  // 重置動畫
  const reset = () => {
    if (animationRef.current) {
      animationRef.current.kill();
      animationRef.current = null;
    }

    const textElement = textRef.current;
    if (textElement) {
      // 恢復原始文字內容並移除動畫class
      const elements = textElement.querySelectorAll("[data-animate]");
      elements.forEach((element) => {
        const originalText = element.getAttribute("data-original-text");
        if (originalText) {
          element.textContent = originalText;
        }
        // 移除動畫相關的class
        element.classList.remove("animation-ready", "animation-complete");
      });
    }
  };

  // 手動觸發動畫
  const trigger = () => {
    if (hasTriggered.current) return;

    hasTriggered.current = true;
    const animationTimeout = setTimeout(() => {
      console.log("Starting text animation...");
      animate();
    }, config.delay);

    return () => {
      clearTimeout(animationTimeout);
    };
  };

  // 設置 Intersection Observer
  const setupObserver = () => {
    if (!textRef.current || observerRef.current) return;

    const options = {
      threshold: config.threshold,
      rootMargin: config.rootMargin,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          console.log("Text element entered viewport, triggering animation...");
          trigger();
          // 觸發後可以選擇停止觀察
          if (observerRef.current) {
            observerRef.current.unobserve(entry.target);
          }
        }
      });
    }, options);

    observerRef.current.observe(textRef.current);
  };

  // 清理 Observer
  const cleanupObserver = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  };

  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return;

    // 保存原始文字內容
    const elements = textElement.querySelectorAll("[data-animate]");
    elements.forEach((element) => {
      if (!element.getAttribute("data-original-text")) {
        element.setAttribute("data-original-text", element.textContent);
      }
    });

    isInitialized.current = true;
  }, []);

  // 當全域loading完成後設置觀察器
  useEffect(() => {
    if (!loading && isInitialized.current) {
      setupObserver();

      // 清理函數
      return () => {
        cleanupObserver();
      };
    }
  }, [loading, config.threshold, config.rootMargin]);

  // 重置時也要清理觀察器
  const resetWithCleanup = () => {
    cleanupObserver();
    hasTriggered.current = false;
    reset();
  };

  return {
    textRef,
    animate,
    reset: resetWithCleanup,
    trigger,
    setupObserver,
    cleanupObserver,
  };
}

export default useTextAnimation;
