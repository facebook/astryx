// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @input The canonical Vanilla Astryx demo, templates, and CLI CDN pin.
 * @output Deterministic, committed HTML files that open directly from a clone.
 * @position Build helper for the shareable no-build Vanilla Astryx demo.
 */

import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {
  ASTRYX_VANILLA_CDN_PLACEHOLDER,
  ASTRYX_VANILLA_CDN_REF,
  astryxVanillaCdnBase,
} from '../../cli/api/template/html/html.mjs';

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const outputDir = path.join(packageRoot, 'demo/pinned');
const templateNames = [
  'dashboard',
  'detail-page',
  'form-two-column',
  'table-filter',
];

function renderDocument(source, {isIndex = false} = {}) {
  if (!source.includes(ASTRYX_VANILLA_CDN_PLACEHOLDER)) {
    throw new Error('Vanilla HTML source is missing its CDN placeholder');
  }

  let rendered = source.replaceAll(
    ASTRYX_VANILLA_CDN_PLACEHOLDER,
    astryxVanillaCdnBase(ASTRYX_VANILLA_CDN_REF),
  );
  if (isIndex) {
    for (const name of templateNames) {
      const sourceLink = `../templates/${name}.html`;
      if (!rendered.includes(sourceLink)) {
        throw new Error(`Demo index is missing ${sourceLink}`);
      }
      rendered = rendered.replaceAll(sourceLink, `./${name}.html`);
    }
  }
  return rendered;
}

async function expectedDocuments() {
  const indexSource = await readFile(
    path.join(packageRoot, 'demo/index.html'),
    'utf8',
  );
  const templates = await Promise.all(
    templateNames.map(async name => ({
      name: `${name}.html`,
      source: await readFile(
        path.join(packageRoot, `templates/${name}.html`),
        'utf8',
      ),
    })),
  );

  return [
    {name: 'index.html', content: renderDocument(indexSource, {isIndex: true})},
    ...templates.map(({name, source}) => ({
      name,
      content: renderDocument(source),
    })),
  ];
}

async function renderPinnedDemo() {
  const documents = await expectedDocuments();
  const check = process.argv.includes('--check');
  const stale = [];

  if (!check) await mkdir(outputDir, {recursive: true});
  for (const {name, content} of documents) {
    const outputPath = path.join(outputDir, name);
    if (check) {
      const current = await readFile(outputPath, 'utf8').catch(() => null);
      if (current !== content) stale.push(name);
    } else {
      await writeFile(outputPath, content);
    }
  }

  if (stale.length > 0) {
    throw new Error(
      `Pinned demo is stale (${stale.join(', ')}); run pnpm -F @astryxdesign/vanilla demo`,
    );
  }

  const action = check ? 'Verified' : 'Rendered';
  console.log(
    `${action} ${documents.length} pinned demo files at ${ASTRYX_VANILLA_CDN_REF}.`,
  );
  console.log(`Open ${pathToFileURL(path.join(outputDir, 'index.html')).href}`);
}

renderPinnedDemo().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
