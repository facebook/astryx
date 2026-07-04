#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Playwright screenshot pipeline for vibe test results
 *
 * Captures screenshots of generated components at multiple viewport/theme combos.
 *
 * Usage:
 *   tsx src/screenshot.ts --iteration <id>
 *   tsx src/screenshot.ts --iteration <id> --prompt <promptId>
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type {chromium as PlaywrightChromium} from 'playwright';
import {getResultsDir, readJson, ensureDir} from './utils.js';

const VIEWPORTS = {
  desktop: {width: 1280, height: 800},
  mobile: {width: 375, height: 812},
};
const THEMES = ['light', 'dark'] as const;
const APP_DIR = path.join(import.meta.dirname, '..', 'app');
const PREVIEW_PATH = path.join(APP_DIR, 'src', 'preview.tsx');

function parseArgs(): {iteration: string; prompt?: string} {
  const args = process.argv.slice(2);
  let iteration = '';
  let prompt: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iteration' && args[i + 1]) {
      iteration = args[i + 1];
      i++;
    } else if (args[i] === '--prompt' && args[i + 1]) {
      prompt = args[i + 1];
      i++;
    }
  }

  if (!iteration) {
    console.error(
      'Usage: tsx src/screenshot.ts --iteration <id> [--prompt <promptId>]',
    );
    process.exit(1);
  }

  return {iteration, prompt};
}

function generatePreviewCode(
  componentPath: string,
  target: 'astryx' | 'baseline' | 'astryx-tailwind',
): string {
  const relPath = path.relative(path.join(APP_DIR, 'src'), componentPath);
  const importPath = relPath.replace(/\.tsx$/, '').replace(/\\/g, '/');

  if (target === 'astryx' || target === 'astryx-tailwind') {
    // Astryx+Tailwind uses the same Astryx wrapper but also imports Tailwind CSS
    const tailwindImport =
      target === 'astryx-tailwind' ? `\nimport '../tailwind.css';` : '';
    return `
import React from 'react';
import Component from '${importPath}';${tailwindImport}
import AstryxWrapper from './astryx-wrapper';

export default function Preview({ theme }: { theme: string }) {
  return (
    <AstryxWrapper theme={theme}>
      <Component />
    </AstryxWrapper>
  );
}
`;
  }

  return `
import React from 'react';
import Component from '${importPath}';
import BaselineWrapper from './baseline-wrapper';

export default function Preview({ theme }: { theme: string }) {
  return (
    <BaselineWrapper theme={theme}>
      <Component />
    </BaselineWrapper>
  );
}
`;
}

async function main() {
  const {iteration, prompt: singlePrompt} = parseArgs();
  const resultsDir = getResultsDir();
  const iterDir = path.join(resultsDir, iteration);
  const codeDir = path.join(iterDir, 'results');
  const manifestPath = path.join(iterDir, 'manifest.json');
  const screenshotsDir = path.join(iterDir, 'screenshots');

  if (!fs.existsSync(manifestPath)) {
    console.error(`No manifest.json found at ${manifestPath}`);
    process.exit(1);
  }

  const manifest = readJson<{
    config: {target: string};
    prompts: Array<{id: string; category: string}>;
  }>(manifestPath);

  const target = manifest.config.target as
    | 'astryx'
    | 'baseline'
    | 'astryx-tailwind';

  // Determine which prompts to screenshot
  let promptIds = manifest.prompts.map(p => p.id);
  if (singlePrompt) {
    promptIds = promptIds.filter(id => id === singlePrompt);
    if (promptIds.length === 0) {
      console.error(`Prompt "${singlePrompt}" not found in manifest`);
      process.exit(1);
    }
  }

  // Filter to prompts with result files
  promptIds = promptIds.filter(id =>
    fs.existsSync(path.join(codeDir, `${id}.tsx`)),
  );

  if (promptIds.length === 0) {
    console.error('No result .tsx files found for specified prompts');
    process.exit(1);
  }

  // Try to import playwright
  let chromium: typeof PlaywrightChromium;
  try {
    const pw = await import('playwright');
    chromium = pw.chromium;
  } catch {
    console.error(
      'Playwright is not installed. Install it with:\n' +
        '  npm install -D playwright\n' +
        '  npx playwright install chromium\n',
    );
    process.exit(1);
  }

  // Save original preview.tsx
  const originalPreview = fs.existsSync(PREVIEW_PATH)
    ? fs.readFileSync(PREVIEW_PATH, 'utf-8')
    : null;

  ensureDir(screenshotsDir);

  // Start Vite dev server
  // Use the preview config for astryx-tailwind (includes PostCSS/Tailwind),
  // default config for other targets
  const configFile =
    target === 'astryx-tailwind'
      ? path.join(APP_DIR, 'vite.config.preview.ts')
      : undefined;

  const {createServer} = await import('vite');
  const server = await createServer({
    root: APP_DIR,
    configFile,
    server: {port: 5174, strictPort: true},
    logLevel: 'silent',
  });
  await server.listen();
  const serverUrl = 'http://localhost:5174';

  console.log(
    `📸 Capturing screenshots for ${promptIds.length} components...\n`,
  );

  const browser = await chromium.launch();

  try {
    for (const promptId of promptIds) {
      const componentPath = path.join(codeDir, `${promptId}.tsx`);
      const previewCode = generatePreviewCode(componentPath, target);
      fs.writeFileSync(PREVIEW_PATH, previewCode);

      // Wait for HMR to pick up the change
      await new Promise(resolve => setTimeout(resolve, 1000));

      for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
        for (const theme of THEMES) {
          const page = await browser.newPage({viewport});
          const url = `${serverUrl}?theme=${theme}`;
          await page.goto(url, {waitUntil: 'networkidle'});

          // Wait a bit for rendering
          await page.waitForTimeout(500);

          const filename = `${promptId}-${viewportName}-${theme}.png`;
          const screenshotPath = path.join(screenshotsDir, filename);
          await page.screenshot({path: screenshotPath, fullPage: true});
          await page.close();

          console.log(`  ✓ ${filename}`);
        }
      }
    }
  } finally {
    await browser.close();
    await server.close();

    // Restore original preview.tsx
    if (originalPreview !== null) {
      fs.writeFileSync(PREVIEW_PATH, originalPreview);
    } else {
      // Write the default placeholder back
      fs.writeFileSync(
        PREVIEW_PATH,
        `export default function Preview({ theme }: { theme: string }) {\n  return <div>No component loaded.</div>;\n}\n`,
      );
    }
  }

  console.log(`\n✅ Screenshots saved to: ${screenshotsDir}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
