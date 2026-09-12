import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const source = resolve(repoRoot, 'frontend/dist/toggle-row-card.js');
const targetDir = resolve(repoRoot, 'dist');
const target = resolve(targetDir, 'hacs-toggle-card.js');

mkdirSync(targetDir, { recursive: true });

try {
  statSync(source);
} catch {
  console.error('Build output missing. Run `cd frontend && npm run build` first.');
  process.exit(1);
}

copyFileSync(source, target);
console.info(`Copied ${source} -> ${target}`);
