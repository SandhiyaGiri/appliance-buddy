import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const resolvePkgDir = (pkg: string) => path.dirname(require.resolve(`${pkg}/package.json`, { paths: [__dirname] }));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Ensure a single React instance is used across the monorepo
      react: resolvePkgDir('react'),
      'react-dom': resolvePkgDir('react-dom'),
      'react/jsx-runtime': path.join(resolvePkgDir('react'), 'jsx-runtime.js'),
    },
  },
  build: {
    // Prevent multiple React copies in the bundle
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('react') || id.includes('@tanstack/react-query')) {
            return 'vendor-react';
          }

          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'vendor-ui';
          }

          if (id.includes('date-fns')) {
            return 'vendor-date';
          }

          return 'vendor';
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'react-router-dom',
    ],
    dedupe: ['react', 'react-dom']
  }
}));
