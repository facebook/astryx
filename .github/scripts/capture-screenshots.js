#!/usr/bin/env node

/**
 * @description Captures screenshots of component stories using Playwright
 * @input --storybook-dir <path> --output-dir <path> --components <comma-separated>
 * @output PNG screenshots in output directory with manifest
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const storybookDir = getArg('storybook-dir') || 'apps/storybook/dist';
const outputDir = getArg('output-dir') || 'screenshots';
const componentsArg = getArg('components') || '';
const components = componentsArg.split(',').filter(Boolean);

// Simple static file server with proper MIME types
function createServer(dir, port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(dir, req.url === '/' ? 'index.html' : req.url);

      // Handle query strings
      filePath = filePath.split('?')[0];

      const ext = path.extname(filePath);
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.cjs': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
      };

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });

    server.listen(port, () => {
      console.log(`Storybook server running on http://localhost:${port}`);
      resolve(server);
    });
  });
}

// Get stories from storybook
async function getStories(storybookPath) {
  const storiesJsonPath = path.join(storybookPath, 'index.json');

  try {
    const content = fs.readFileSync(storiesJsonPath, 'utf8');
    const data = JSON.parse(content);
    return data.entries || data.stories || {};
  } catch (e) {
    console.error('Could not read stories index:', e.message);
    return {};
  }
}

async function captureScreenshots() {
  console.log('Starting screenshot capture...');
  console.log(`Components to capture: ${components.length > 0 ? components.join(', ') : 'all'}`);

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  const storybookPath = path.resolve(process.cwd(), storybookDir);

  if (!fs.existsSync(storybookPath)) {
    console.error(`Storybook build not found at ${storybookPath}`);
    fs.writeFileSync(path.join(outputDir, 'screenshots.json'), JSON.stringify({
      error: 'Storybook not built',
      screenshots: [],
    }));
    return;
  }

  // Start server
  const port = 6006;
  const server = await createServer(storybookPath, port);

  // Get stories
  const stories = await getStories(storybookPath);
  const storyIds = Object.keys(stories);

  console.log(`Found ${storyIds.length} stories`);

  // Filter stories for relevant components - exclude docs pages
  const relevantStories = storyIds.filter(id => {
    // Skip docs pages - they often have rendering issues
    if (id.endsWith('--docs')) return false;

    if (components.length === 0) return true;
    const story = stories[id];
    const title = story.title || '';
    return components.some(comp =>
      title.toLowerCase().includes(comp.toLowerCase()) ||
      id.toLowerCase().includes(comp.toLowerCase())
    );
  });

  console.log(`Capturing ${relevantStories.length} relevant stories`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 800, height: 600 },
    deviceScaleFactor: 2, // Retina quality
  });

  const screenshots = [];

  for (const storyId of relevantStories) {
    const story = stories[storyId];
    const page = await context.newPage();

    try {
      // Navigate to story in iframe mode
      const url = `http://localhost:${port}/iframe.html?id=${storyId}&viewMode=story`;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for Storybook to render the story
      await page.waitForSelector('#storybook-root', { timeout: 10000 });

      // Wait for styles to be injected (StyleX runtime injection)
      await page.waitForTimeout(1000);

      // Wait for any fonts to load
      await page.evaluate(() => document.fonts.ready);

      // Additional wait for any CSS transitions/animations
      await page.waitForTimeout(500);

      // Take screenshot of just the story root, with padding
      const storyRoot = await page.$('#storybook-root');

      const filename = `${storyId.replace(/[^a-z0-9]/gi, '-')}.png`;
      const filepath = path.join(outputDir, filename);

      if (storyRoot) {
        await storyRoot.screenshot({ path: filepath });
      } else {
        // Fallback to full page
        await page.screenshot({ path: filepath, fullPage: false });
      }

      screenshots.push({
        storyId,
        title: story.title,
        name: story.name,
        filename,
      });

      console.log(`[ok] Captured: ${story.title} / ${story.name}`);
    } catch (e) {
      console.error(`[fail] Failed: ${storyId} - ${e.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  // Write manifest
  fs.writeFileSync(
    path.join(outputDir, 'screenshots.json'),
    JSON.stringify({
      screenshots,
      capturedAt: new Date().toISOString()
    }, null, 2)
  );

  console.log(`\nCaptured ${screenshots.length} screenshots`);
}

captureScreenshots().catch(e => {
  console.error('Screenshot capture failed:', e);
  process.exit(1);
});
