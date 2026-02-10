import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://qnhd.twt.edu.cn',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err) => console.log('[Proxy Error]', err.message))
          proxy.on('proxyReq', (proxyReq, req) => console.log('[Proxy]', req.method, req.url))
        },
      },
      '/qnhdpic': {
        target: 'https://qnhdpic.twt.edu.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/qnhdpic/, ''),
      },
      '/qnhd-static': {
        target: 'https://qnhd.twt.edu.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/qnhd-static/, ''),
      },
      '/pic-api': {
        target: 'https://qnhdpic.twt.edu.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/pic-api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
