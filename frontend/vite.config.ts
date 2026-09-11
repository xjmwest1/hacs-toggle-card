import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const rootDir = __dirname;
const cardEntry = resolve(rootDir, 'src/toggle-row-card.ts');

export default defineConfig(({ command }) => {
  const isServe = command === 'serve';

  return {
    ...(isServe
      ? {
          root: resolve(rootDir, 'playground'),
          resolve: {
            alias: {
              '@src': resolve(rootDir, 'src'),
              '@fixtures': resolve(rootDir, 'fixtures'),
            },
          },
        }
      : {
          build: {
            lib: {
              entry: cardEntry,
              name: 'ToggleRowCard',
              fileName: 'toggle-row-card',
              formats: ['es'],
            },
            outDir: resolve(rootDir, 'dist'),
            emptyOutDir: true,
            rollupOptions: {
              output: {
                inlineDynamicImports: true,
              },
            },
            sourcemap: true,
          },
        }),
  };
});
