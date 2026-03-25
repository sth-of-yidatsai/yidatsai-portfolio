import { Link, useLoaderData } from 'react-router-dom';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import BlockRenderer from '../components/blocks/BlockRenderer';
import { useLoader } from '../hooks/use-loader/index.jsx';
import './ProjectDetail.css';

/**
 * 從 blocks 陣列中提取所有需要預載的圖片 URL（排除外部 embed）
 */
function collectBlockImages(blocks) {
  const urls = [];
  for (const block of blocks) {
    // hero / quote / image-left / image-right
    if (block.image) urls.push(block.image);
    // full-image
    if (block.src && !/^(https?:)?\/\//.test(block.src)) urls.push(block.src);
    // video poster
    if (block.poster) urls.push(block.poster);
    // carousel / landscape / image-grid / image-set-a/b/c
    if (Array.isArray(block.images)) {
      block.images.forEach((img) => {
        const url = typeof img === 'string' ? img : img?.src;
        if (url) urls.push(url);
      });
    }
  }
  return [...new Set(urls.filter(Boolean))];
}

function preloadImages(urls) {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = img.onerror = resolve;
          img.src = url;
        })
    )
  );
}

export default function ProjectDetail() {
  const project = useLoaderData();
  const { waitForContent, signalContentReady } = useLoader();

  // blocksReady: 圖片預載完成後才為 true，BlockRenderer 才會 mount
  // — 保證 GSAP useLayoutEffect 執行時圖片尺寸已確定，pin spacer 計算正確
  const [blocksReady, setBlocksReady] = useState(false);

  // 用 ref 避免 waitForContent / signalContentReady 在 cleanup 中重複呼叫
  const signaledRef = useRef(false);

  // useLayoutEffect 同步執行（早於 useEffect），在 LoaderProvider 的
  // location useEffect 之前就先持有 gate，確保 Loader 不會提前關閉
  useLayoutEffect(() => {
    if (!project.blocks?.length) return;

    signaledRef.current = false;
    waitForContent();

    // cleanup：元件卸載時若圖片尚未載完，釋放 gate 避免 Loader 卡住
    return () => {
      if (!signaledRef.current) {
        signaledRef.current = true;
        signalContentReady();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!project.blocks?.length) {
      setBlocksReady(true);
      return;
    }

    const urls = collectBlockImages(project.blocks);
    let cancelled = false;

    const done = () => {
      if (cancelled || signaledRef.current) return;
      cancelled = true;
      signaledRef.current = true;
      setBlocksReady(true);
      signalContentReady();
    };

    // 最多等 10 秒，避免慢速網路下 Loader 永遠不關
    const timeout = setTimeout(done, 10_000);

    preloadImages(urls).then(done);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [project]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Blocks 版型 ──────────────────────────────────────────────────────
  if (project.blocks) {
    return (
      <main className="project-detail project-detail--blocks">
        {blocksReady && (
          <BlockRenderer blocks={project.blocks} project={project} />
        )}
      </main>
    );
  }

  // ── Fallback：無 blocks，列出圖片清單 ────────────────────────────────
  return (
    <main className="project-detail project-detail--fallback">
      <div className="project-detail__back">
        <Link to="/projects">← Back</Link>
      </div>
      <h1 className="project-detail__title">{project.title}</h1>
      <p className="project-detail__year">{project.year}</p>
      {project.description && (
        <p className="project-detail__desc">{project.description}</p>
      )}
      <div className="project-detail__images">
        {project.images?.map((filename, idx) => (
          <img
            key={idx}
            src={`/images/projects/${project.id}/${filename}`}
            alt={`${project.title} ${idx + 1}`}
          />
        ))}
      </div>
    </main>
  );
}
