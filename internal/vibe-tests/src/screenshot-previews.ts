#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Screenshot pre-built preview HTML files using Playwright
 * @input Pre-built preview HTML files from build-previews.ts
 * @output PNG screenshots at multiple viewport/theme combos
 * @position internal/vibe-tests/src/screenshot-previews.ts
 *
 * Unlike screenshot.ts (which runs a Vite dev server), this script
 * works with pre-built self-contained HTML files. Designed to run in
 * GitHub Actions where Playwright is installed but Astryx source isn't needed
 * for rendering.
 *
 * Usage:
 *   tsx src/screenshot-previews.ts --iterations 8734233a,d4ff8c2c
 *   tsx src/screenshot-previews.ts --iterations 8734233a --prompts tc-4,tc-7
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as http from 'node:http';
import type {chromium as PlaywrightChromium, Page} from 'playwright';
import {getResultsDir, ensureDir, writeJson} from './utils.js';

const VIEWPORTS = {
  desktop: {width: 1280, height: 800},
  mobile: {width: 375, height: 812},
};

const THEMES = ['light', 'dark'] as const;

function parseArgs(): {iterations: string[]; prompts?: string[]} {
  const args = process.argv.slice(2);
  let iterations: string[] = [];
  let prompts: string[] | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iterations' && args[i + 1]) {
      iterations = args[++i].split(',');
    } else if (args[i] === '--prompts' && args[i + 1]) {
      prompts = args[++i].split(',');
    }
  }

  if (iterations.length === 0) {
    console.error(
      'Usage: tsx src/screenshot-previews.ts --iterations <id1,id2,...> [--prompts <p1,p2,...>]',
    );
    process.exit(1);
  }

  return {iterations, prompts};
}

/**
 * Serve a directory of static files on a random port.
 * Returns the base URL and a close function.
 */
function serveStatic(
  dir: string,
): Promise<{url: string; close: () => Promise<void>}> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url || '/');
      const filePath = path.join(dir, urlPath);

      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentTypes: Record<string, string> = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.json': 'application/json',
      };

      const content = fs.readFileSync(filePath);
      res.writeHead(200, {'Content-Type': contentTypes[ext] || 'text/plain'});
      res.end(content);
    });

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('Failed to get server address'));
        return;
      }
      resolve({
        url: `http://127.0.0.1:${addr.port}`,
        close: () =>
          new Promise<void>(r => {
            server.close(() => r());
          }),
      });
    });

    server.on('error', reject);
  });
}

/**
 * Apply a color-scheme to the page for dark mode screenshots.
 * For self-contained HTML previews, we inject prefers-color-scheme
 * emulation via Playwright's CDP.
 */
async function setTheme(page: Page, theme: 'light' | 'dark') {
  await page.emulateMedia({colorScheme: theme});
}

async function main() {
  const {iterations, prompts} = parseArgs();
  const resultsDir = getResultsDir();

  // Import playwright
  let chromium: typeof PlaywrightChromium;
  try {
    const pw = await import('playwright');
    chromium = pw.chromium;
  } catch {
    console.error(
      'Playwright is not installed. Run:\n' +
        '  npx playwright install chromium --with-deps\n',
    );
    process.exit(1);
  }

  const browser = await chromium.launch();
  let totalScreenshots = 0;

  try {
    for (const iterationId of iterations) {
      const iterDir = path.join(resultsDir, iterationId);
      const previewsDir = path.join(iterDir, 'previews');
      const screenshotsDir = path.join(iterDir, 'screenshots');

      if (!fs.existsSync(previewsDir)) {
        console.error(`  ⚠ No previews directory for ${iterationId}, skipping`);
        continue;
      }

      // Read the preview manifest to find all HTML files
      const manifestPath = path.join(previewsDir, 'manifest.json');
      const previewFiles: Array<{
        promptId: string;
        target: string;
        path: string;
      }> = [];

      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        for (const [promptId, targets] of Object.entries(manifest)) {
          if (prompts && !prompts.includes(promptId)) {
            continue;
          }
          for (const [target, relPath] of Object.entries(
            targets as Record<string, string>,
          )) {
            const fullPath = path.join(iterDir, relPath);
            if (fs.existsSync(fullPath)) {
              previewFiles.push({promptId, target, path: fullPath});
            }
          }
        }
      } else {
        // No manifest — scan for HTML files directly
        const scanDir = (dir: string) => {
          if (!fs.existsSync(dir)) {
            return;
          }
          for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
            if (entry.isDirectory()) {
              scanDir(path.join(dir, entry.name));
            } else if (entry.name.endsWith('.html')) {
              const promptId = path.basename(
                path.dirname(path.join(dir, entry.name)),
              );
              const target = path.basename(entry.name, '.html');
              previewFiles.push({
                promptId,
                target,
                path: path.join(dir, entry.name),
              });
            }
          }
        };
        scanDir(previewsDir);
      }

      if (previewFiles.length === 0) {
        console.error(`  ⚠ No preview HTML files found for ${iterationId}`);
        continue;
      }

      // Serve the previews directory
      const server = await serveStatic(path.dirname(previewsDir));
      ensureDir(screenshotsDir);

      console.log(
        `\n📸 Screenshotting ${previewFiles.length} preview(s) for ${iterationId}...\n`,
      );

      const screenshotManifest: Record<
        string,
        Record<string, Record<string, Record<string, string>>>
      > = {};

      for (const preview of previewFiles) {
        // Compute the URL relative to the served directory
        const relPath = path.relative(path.dirname(previewsDir), preview.path);

        for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
          for (const theme of THEMES) {
            const page = await browser.newPage({viewport});
            await setTheme(page, theme);

            const url = `${server.url}/${relPath}`;
            try {
              await page.goto(url, {
                waitUntil: 'networkidle',
                timeout: 30000,
              });
            } catch {
              // Fallback: wait for load instead of networkidle
              // (some pages have long-lived connections)
              await page.goto(url, {waitUntil: 'load', timeout: 15000});
            }

            // Wait for fonts and rendering
            await page.waitForTimeout(1000);

            const filename = `${preview.promptId}-${preview.target}-${viewportName}-${theme}.png`;
            const screenshotPath = path.join(screenshotsDir, filename);
            await page.screenshot({path: screenshotPath, fullPage: true});
            await page.close();

            // Track in manifest
            if (!screenshotManifest[preview.promptId]) {
              screenshotManifest[preview.promptId] = {};
            }
            if (!screenshotManifest[preview.promptId][preview.target]) {
              screenshotManifest[preview.promptId][preview.target] = {};
            }
            if (
              !screenshotManifest[preview.promptId][preview.target][
                viewportName
              ]
            ) {
              screenshotManifest[preview.promptId][preview.target][
                viewportName
              ] = {};
            }
            screenshotManifest[preview.promptId][preview.target][viewportName][
              theme
            ] = filename;

            totalScreenshots++;
            console.log(`  ✓ ${filename}`);
          }
        }
      }

      // Write screenshot manifest
      writeJson(path.join(screenshotsDir, 'manifest.json'), screenshotManifest);

      await server.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`\n✅ Captured ${totalScreenshots} screenshot(s)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
