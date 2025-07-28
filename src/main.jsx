// src/main.jsx
import { inject } from '@vercel/analytics';
inject();
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // ← Tailwind 有効化

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
