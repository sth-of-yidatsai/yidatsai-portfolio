import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ padding: '100px 24px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: 12 }}>404 找不到頁面</h1>
      <p style={{ marginBottom: 24 }}>您要找的頁面不存在或已被移動。</p>
      <Link to="/">回到首頁</Link>
    </div>
  );
}


