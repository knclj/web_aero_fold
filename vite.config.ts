import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        // Fail fast instead of silently moving to the next free port.
        // Silently moving to 3001 collides with the API server port, which makes
        // Vite proxy /api to itself and exhausts ephemeral ports (EADDRNOTAVAIL).
        strictPort: true,
        host: '0.0.0.0',
        // Uploaded images and SQLite files change often; don't reload the app for them.
        watch: {
          ignored: ['**/server/uploads/**', '**/server/data/**', '**/.chrome-profile/**'],
        },
        proxy: {
          '/api': {
            target: 'http://127.0.0.1:3001',
            changeOrigin: true,
          },
          '/uploads': {
            target: 'http://127.0.0.1:3001',
            changeOrigin: true,
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
