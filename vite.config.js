import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 你的 Express 后端地址
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist', // 构建输出目录，server.js 会读取这个目录
    emptyOutDir: true,
  }
})