import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'app') {
    return {
      plugins: [
        react(),
      ],
      server: {
        port: 3000,
      },
      publicDir: 'public/',
      build: {
        outDir: 'build',
      }
    }
  }
  return {
    plugins: [
      react(),
      dts({ tsconfigPath: 'tsconfig.lib.json' }),
    ],
    server: {
      port: 3000,
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src', 'lib', 'index.tsx'),
        name: 'ReactVnc',
        formats: ['es', 'umd'],
      },
      copyPublicDir: false,
    }
  }
});
