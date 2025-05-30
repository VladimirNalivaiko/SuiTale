import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    })
  ],
  root: '.',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'esnext',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  server: {
    port: 3000,
    open: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    fs: {
      allow: ['..', '../..', '../../node_modules']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: ['buffer', 'dataloader'],
    exclude: ['@mysten/walrus', '@mysten/walrus-wasm'],
    esbuildOptions: {
      target: 'esnext',
    },
    force: true
  },
  define: {
    global: 'globalThis',
    'import.meta.env.VITE_CONTRACT_ADDRESS_TESTNET': JSON.stringify('0xfe8abd8663a9387f9cbce8db9391a7f3b1b3cd226607b88e253c5c9256ff0e78'),
    'import.meta.env.VITE_SUI_NETWORK': JSON.stringify('testnet'),
  },
  worker: {
    format: 'es',
  },
  assetsInclude: ['**/*.wasm'],
  esbuild: {
    target: 'esnext'
  },
  preview: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  }
}); 