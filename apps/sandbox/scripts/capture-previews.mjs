#!/usr/bin/env node
/**
 * Capture preview screenshots for all sandbox pages.
 *
 * Usage:
 *   # Start the sandbox dev server first:
 *   yarn workspace @xds/sandbox dev
 *
 *   # Then run this script:
 *   node apps/sandbox/scripts/capture-previews.mjs [--base-url http://localhost:3000]
 *
 * The script navigates to each page registered in sandboxPages.ts,
 * waits for it to load, and saves a 16:10 screenshot to public/previews/.
 *
 * Requirements: npx playwright install chromium
 */

import {chromium} from 'playwright';
import {mkdir} from 'fs/promises';
import {fileURLToPath} from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const previewDir = path.resolve(__dirname, '../public/previews');

// Extract page slugs from href paths — covers all registered pages automatically.
// We import the built sandboxPages at runtime via a dynamic import workaround,
// but since it's a TS file we just hardcode the hrefs here and derive slugs.
// To keep this in sync, the list below should match sandboxPages.ts.
const pages = [
  // Components & Patterns
  {slug: 'example-cards', href: '/pages/example-cards/'},
  {slug: 'toast-playground', href: '/pages/toast-playground/'},
  {slug: 'table-overview', href: '/pages/table-overview/'},
  {slug: 'navigation', href: '/pages/navigation/'},
  {slug: 'topnav-menu', href: '/pages/topnav-menu/'},
  {slug: 'mega-menu', href: '/pages/mega-menu/'},
  {slug: 'polymorphic-link', href: '/pages/polymorphic-link/'},
  {slug: 'shell-lab', href: '/pages/shell-lab/'},
  {slug: 'example', href: '/pages/example/'},
  // Templates
  {slug: 'template-dashboard', href: '/pages/template-dashboard/'},
  {slug: 'template-login', href: '/pages/template-login/'},
  {slug: 'template-settings', href: '/pages/template-settings/'},
  {slug: 'template-data-table', href: '/pages/template-data-table/'},
  // Tools
  {slug: 'theme-editor', href: '/pages/theme-editor/'},
];

const baseUrl = process.argv.includes('--base-url')
  ? process.argv[process.argv.indexOf('--base-url') + 1]
  : 'http://localhost:3000';

async function main() {
  await mkdir(previewDir, {recursive: true});

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: {width: 1280, height: 800},
    deviceScaleFactor: 2,
  });

  console.log(`Capturing previews from ${baseUrl}...\n`);

  for (const page of pages) {
    const url = `${baseUrl}${page.href}`;
    const tab = await context.newPage();

    try {
      await tab.goto(url, {waitUntil: 'networkidle'});
      await tab.waitForTimeout(500);

      const outPath = path.join(previewDir, `${page.slug}.png`);
      await tab.screenshot({
        path: outPath,
        clip: {x: 0, y: 0, width: 1280, height: 800},
      });
      console.log(`  ✓ ${page.slug}.png`);
    } catch (err) {
      console.log(`  ✗ ${page.slug} — ${err.message}`);
    }

    await tab.close();
  }

  await browser.close();
  console.log(`\nDone. Screenshots saved to ${previewDir}`);
}

main().catch(console.error);
