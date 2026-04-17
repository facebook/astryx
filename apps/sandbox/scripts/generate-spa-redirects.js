#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports, no-undef */

/**
 * Generates index.html files for every known route so that direct URL
 * access works on static hosts like GitHub Pages (which don't support
 * SPA fallback routing per-subdirectory).
 *
 * Each generated file is a copy of the root index.html — the SPA
 * boots and React Router picks up the correct route from the URL.
 */

const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

const staticRoutes = [
  'templates',
  'components-patterns',
  'tools',
  'pages/example',
  'pages/navigation',
  'pages/mega-menu',
  'pages/topnav-menu',
  'pages/table-overview',
  'pages/polymorphic-link',
  'pages/media-mode',
  'pages/theme-editor',
  'pages/docsite',
  'pages/doc-home',
  'pages/doc-docs',
  'pages/doc-discover',
  'pages/documentation',
  'pages/example-cards',
  'pages/showcase-components',
  'pages/showcase-header',
  'pages/dictation-lab',
  'pages/codeblock-perf',
  'pages/shell-lab',
];

// Template routes from generated registries
let templateRoutes = [];
try {
  const templateRegistry = path.resolve(
    __dirname, '..', 'src', 'generated', 'templateRegistry.ts'
  );
  const content = fs.readFileSync(templateRegistry, 'utf-8');
  const slugs = [...content.matchAll(/slug:\s*"([^"]+)"/g)].map(m => m[1]);
  templateRoutes.push(...slugs.map(s => `templates/${s}`));
} catch (e) {
  console.warn('Could not read templateRegistry:', e.message);
}

try {
  const blockRegistry = path.resolve(
    __dirname, '..', 'src', 'generated', 'blockRegistry.ts'
  );
  const content = fs.readFileSync(blockRegistry, 'utf-8');
  const slugs = [...content.matchAll(/slug:\s*"([^"]+)"/g)].map(m => m[1]);
  templateRoutes.push(...slugs.map(s => `templates/${s}`));
} catch (e) {
  console.warn('Could not read blockRegistry:', e.message);
}

const allRoutes = [...staticRoutes, ...templateRoutes];

let count = 0;
for (const route of allRoutes) {
  const dir = path.join(distDir, route);
  const file = path.join(dir, 'index.html');
  if (!fs.existsSync(file)) {
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(file, indexHtml);
    count++;
  }
}

console.log(`Generated ${count} SPA route files in dist/`);
