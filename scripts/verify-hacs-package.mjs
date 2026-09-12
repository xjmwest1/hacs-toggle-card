import { readFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const requiredPaths = [
  'hacs.json',
  'dist/hacs-toggle-card.js',
  'brand/icon.png',
  'README.md',
];

const errors = [];

for (const relativePath of requiredPaths) {
  const absolutePath = resolve(repoRoot, relativePath);
  try {
    statSync(absolutePath);
  } catch {
    errors.push(`Missing required file: ${relativePath}`);
  }
}

try {
  const hacs = JSON.parse(readFileSync(resolve(repoRoot, 'hacs.json'), 'utf8'));
  if (!hacs.name) {
    errors.push('hacs.json must include a name');
  }
  if (hacs.filename !== 'hacs-toggle-card.js') {
    errors.push('hacs.json filename must be hacs-toggle-card.js for this repository');
  }
} catch (error) {
  errors.push(`Invalid hacs.json: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const bundle = readFileSync(resolve(repoRoot, 'dist/hacs-toggle-card.js'), 'utf8');
  if (!bundle.includes('toggle-row-card')) {
    errors.push('dist/hacs-toggle-card.js does not register toggle-row-card');
  }
  if (bundle.length < 1000) {
    errors.push('dist/hacs-toggle-card.js looks too small to be a valid bundle');
  }
} catch {
  // Missing bundle already reported above.
}

if (errors.length) {
  console.error('HACS package verification failed:');
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.info('HACS package verification passed.');
