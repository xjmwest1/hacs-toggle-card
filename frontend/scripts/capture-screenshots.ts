import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const frontendDir = resolve(__dirname, '..');
const outputDir = resolve(frontendDir, '../artifacts/screenshots');

const scenes = ['default-on', 'default-off', 'loading', 'unavailable'] as const;

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
    viewport: { width: 480, height: 320 },
  });

  for (const scene of scenes) {
    await page.goto(`${url}/?scene=${scene}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('toggle-row-card', { timeout: 10_000 });
    await page.waitForTimeout(300);

    const frame = page.locator('#screenshot-frame');
    await frame.screenshot({
      path: resolve(outputDir, `${scene}.png`),
    });

    console.log(`Captured ${scene}.png`);
  }

  await browser.close();
  await server.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
