import { createReadStream, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(__dirname, '../..');
const bundlePath = resolve(repoRoot, 'dist/hacs-toggle-card.js');
const smokePagePath = resolve(__dirname, 'release-smoke-bundle.html');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

function verifyBundle(): void {
  const bundle = readFileSync(bundlePath, 'utf8');

  if (!bundle.includes('toggle-row-card')) {
    throw new Error('Release bundle does not register toggle-row-card');
  }

  if (bundle.length < 1000) {
    throw new Error('Release bundle looks too small to be valid');
  }
}

async function startStaticServer(): Promise<{ url: string; close: () => Promise<void> }> {
  const server = createServer((request, response) => {
    const pathname = request.url?.split('?')[0] ?? '/';

    if (pathname === '/' || pathname === '/smoke.html') {
      response.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
      createReadStream(smokePagePath).pipe(response);
      return;
    }

    if (pathname === '/hacs-toggle-card.js') {
      response.writeHead(200, { 'Content-Type': MIME_TYPES['.js'] });
      createReadStream(bundlePath).pipe(response);
      return;
    }

    response.writeHead(404);
    response.end('Not found');
  });

  await new Promise<void>((resolvePromise, reject) => {
    server.listen(0, '127.0.0.1', () => resolvePromise());
    server.on('error', reject);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to start release smoke server');
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolvePromise, reject) => {
        server.close((error) => (error ? reject(error) : resolvePromise()));
      }),
  };
}

async function main(): Promise<void> {
  statSync(bundlePath);
  verifyBundle();

  const { url, close } = await startStaticServer();
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({
      viewport: { width: 480, height: 320 },
    });

    await page.goto(`${url}/smoke.html`, { waitUntil: 'networkidle' });
    await page.waitForSelector('toggle-row-card', { timeout: 10_000 });

    const customCardRegistered = await page.evaluate(() => {
      const cards = (window as Window & { customCards?: Array<{ type: string }> })
        .customCards;
      return cards?.some((card) => card.type === 'toggle-row-card') ?? false;
    });

    if (!customCardRegistered) {
      throw new Error('toggle-row-card is not registered in window.customCards');
    }

    const elementRegistered = await page.evaluate(
      () => customElements.get('toggle-row-card') !== undefined,
    );

    if (!elementRegistered) {
      throw new Error('toggle-row-card custom element is not defined');
    }

    const rowCount = await page.locator('toggle-row').count();
    if (rowCount !== 1) {
      throw new Error(`Expected 1 toggle-row, found ${rowCount}`);
    }

    const toggleCount = await page.locator('row-toggle').count();
    if (toggleCount !== 1) {
      throw new Error(`Expected 1 row-toggle, found ${toggleCount}`);
    }

    const title = await page.locator('.row-title').textContent();
    if (title?.trim() !== 'Porch Light') {
      throw new Error(`Unexpected row title: ${title}`);
    }

    console.info('Release smoke checks passed.');
  } finally {
    await browser.close();
    await close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
