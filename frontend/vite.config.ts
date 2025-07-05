import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');

  // 不再需要后端URL配置，直接使用nginx

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    base: './', // 重要：Electron需要相对路径
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    server: {
      port: 5173,
      host: '0.0.0.0', // 允许外部访问
      strictPort: true, // 端口被占用时不自动尝试下一个端口
      cors: true, // 启用CORS
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      watch: {
        usePolling: true, // Docker环境下启用轮询
        interval: 1000,   // 轮询间隔
      },
      // 移除代理配置，直接使用nginx
    },
  };
});