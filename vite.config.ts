import { defineConfig, loadEnv } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE_URL || '';

  // Extract origin from the configured API base (e.g. https://kspmas.ksyun.com/v1 → https://kspmas.ksyun.com)
  let proxyTarget = 'http://localhost:1234'; // placeholder when not configured
  try {
    if (apiBase) proxyTarget = new URL(apiBase).origin;
  } catch { /* ignore invalid URL */ }

  return {
    root: 'ai-context',
    plugins: [preact()],
    base: './',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild'
    },
    resolve: {
      alias: { '@': '/ai-context/src' }
    },
    server: {
      proxy: {
        '/api-proxy': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-proxy/, ''),
        }
      }
    },
    preview: {
      proxy: {
        '/api-proxy': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-proxy/, ''),
        }
      }
    }
  };
});
