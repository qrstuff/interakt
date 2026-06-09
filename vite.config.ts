import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Interakt',
      formats: ['es', 'umd'],
      fileName: (format) => `interakt.${format === 'es' ? 'es.js' : 'umd.cjs'}`
    },
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        exports: 'named'
      }
    }
  }
});
