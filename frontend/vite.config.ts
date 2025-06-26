import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');

  // 获取后端服务地址
  const getBackendUrl = (): string => {
    // 优先检查是否有云端服务配置
    const cloudUrl = env.VITE_CLOUD_BACKEND_URL;
    if (cloudUrl) {
      console.log('Vite代理使用云端配置:', cloudUrl);
      return cloudUrl;
    }

    // 默认本地服务
    console.log('Vite代理使用默认本地配置: http://localhost:3000');
    return 'http://localhost:3000';
  };

  const backendUrl = getBackendUrl();

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
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/socket.io': {
          target: backendUrl,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});