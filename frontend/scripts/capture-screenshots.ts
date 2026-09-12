import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const frontendDir = resolve(__dirname, '..');
const outputDir = resolve(frontendDir, '../artifacts/screenshots');

const scenes = [
  { id: 'default-on', selector: 'toggle-row-card' },
  { id: 'default-off', selector: 'toggle-row-card' },
  { id: 'loading', selector: 'toggle-row-card' },
  { id: 'unavailable', selector: 'toggle-row-card' },
  { id: 'row-with-buttons', selector: 'toggle-row-card' },
  { id: 'row-disabled', selector: 'toggle-row-card' },
  { id: 'row-disabled-entity-on', selector: 'toggle-row-card' },
  { id: 'multi-row', selector: 'toggle-row-card' },
  { id: 'dark-theme', selector: 'toggle-row-card' },
  { id: 'editor', selector: 'toggle-row-card-editor' },
] as const;

async function main(): Promise<void> {
  mkdirSync(outputDir, { recursive: true });

  const server = await createServer({
    configFile: resolve(frontendDir, 'vite.config.ts'),
    server: {
      port: 5173,
      host: '127.0.0.1',
    },
  });

  await server.listen();
  const port = server.config.server.port ?? 5173;
  const url = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 480, height: sceneViewportHeight('default-on') },
  });

  for (const scene of scenes) {
    await page.setViewportSize({ width: 480, height: sceneViewportHeight(scene.id) });
    await page.goto(`${url}/?scene=${scene.id}`, { waitUntil: 'networkidle' });
    await page.waitForSelector(scene.selector, { timeout: 10_000 });
    await page.waitForTimeout(300);

    const frame = page.locator('#screenshot-frame');
    await frame.screenshot({
      path: resolve(outputDir, `${scene.id}.png`),
    });

    console.log(`Captured ${scene.id}.png`);
  }

  await browser.close();
  await server.close();
}

function sceneViewportHeight(sceneId: string): number {
  if (sceneId === 'multi-row') {
    return 420;
  }
  if (sceneId === 'editor') {
    return 860;
  }
  return 320;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
