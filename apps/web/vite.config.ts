import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const apiProxyTarget = process.env.VITE_PROXY_API_TARGET ?? 'http://localhost:3001';

/** Docker bind mounts (esp. on Windows) don't emit native fs events; HMR also needs a public host. */
const inDockerDev =
  process.env.CHOKIDAR_USEPOLLING === 'true' || process.env.VITE_DOCKER === 'true';

const hmrHost = process.env.VITE_HMR_HOST ?? 'localhost';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    watch: inDockerDev
      ? {
          usePolling: true,
          interval: 1000,
        }
      : undefined,
    hmr: inDockerDev
      ? {
          host: hmrHost,
          clientPort: 5173,
        }
      : undefined,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
