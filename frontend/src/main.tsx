import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './components/AppRouter';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import './i18n'; // 初始化 i18n
import './index.css';
import './styles/auth.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  </ErrorBoundary>
);