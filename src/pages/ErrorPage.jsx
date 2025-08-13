import React from 'react';
import { isRouteErrorResponse, useRouteError, Link } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();

  let title = '發生錯誤';
  let message = '抱歉，載入資料時發生問題。';
  let statusText = '';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data || message;
    statusText = error.statusText || '';
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div style={{ padding: '100px 24px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: 12 }}>{title}</h1>
      {statusText && <p style={{ marginBottom: 8 }}>{statusText}</p>}
      <p style={{ marginBottom: 24 }}>{message}</p>
      <Link to="/">回到首頁</Link>
    </div>
  );
}


