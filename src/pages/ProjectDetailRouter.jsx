import React, { Suspense } from 'react';
import { useLoaderData } from 'react-router-dom';
import ProjectDetail from './ProjectDetail.jsx';

// 以 id 對應各專案的獨立頁面（可持續擴充）
const projectPages = {
  'project-001': React.lazy(() => import('./projects/Project001.jsx')),
  // 'project-002': React.lazy(() => import('./projects/Project002.jsx')),
  // 'project-003': React.lazy(() => import('./projects/Project003.jsx')),
};

export default function ProjectDetailRouter() {
  const project = useLoaderData();
  const Page = projectPages[project?.id];

  if (!Page) {
    // 未定義獨立頁時，回退預設版面
    return <ProjectDetail />;
  }

  return (
    <Suspense fallback={<div style={{ padding: '100px 24px' }}>Loading…</div>}>
      <Page project={project} />
    </Suspense>
  );
}


