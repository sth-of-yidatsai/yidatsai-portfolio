import React from "react";
import styles from "./assets/loader.module.scss";

/**
 * 預設載入器組件
 */
export function Loader({ show = false }) {
  return (
    <div
      className={`${styles["loader-bg"]} ${
        show ? styles["loader-bg--show"] : styles["loader-bg--hide"]
      }`}
    >
      <div className={styles["loader-container"]}>
        <div className={styles["loader-dots"]}>
          <span className={styles["dot"]}></span>
          <span className={styles["dot"]}></span>
          <span className={styles["dot"]}></span>
        </div>
        <div className={styles["loader-text"]}>載入中...</div>
      </div>
    </div>
  );
}

/**
 * 簡約載入器組件
 */
export function SimpleLoader({ show = false }) {
  return (
    <div
      className={`${styles["simple-loader-bg"]} ${
        show
          ? styles["simple-loader-bg--show"]
          : styles["simple-loader-bg--hide"]
      }`}
    >
      <div className={styles["simple-spinner"]}></div>
    </div>
  );
}

/**
 * 文字動畫專用載入器
 */
export function TextAnimationLoader({ show = false }) {
  return (
    <div
      className={`${styles["text-loader-bg"]} ${
        show ? styles["text-loader-bg--show"] : styles["text-loader-bg--hide"]
      }`}
    >
      <div className={styles["text-loader-container"]}>
        <div className={styles["text-loader-dots"]}>
          <span className={styles["text-dot"]}></span>
          <span className={styles["text-dot"]}></span>
          <span className={styles["text-dot"]}></span>
        </div>
      </div>
    </div>
  );
}
