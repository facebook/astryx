#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Generates apps/sandbox/src/generated/xle-registry.json
 *
 * The XLE/XLO layout language validates against @astryxdesign/core .doc.mjs
 * metadata, which the CLI reads from disk (Node-only). The browser Layout DSL
 * page can't do that, so we build the registry here at deploy time and ship it
 * as plain JSON. Runs in the sandbox `generate` chain so new components/blocks
 * are picked up automatically.
 *
 * Run: node scripts/generate-xle-registry.mjs
 */

import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REPO = resolve(ROOT, '../..');
const OUT = resolve(ROOT, 'src/generated/xle-registry.json');

const {buildRegistry, serializeRegistry} = await import(
  resolve(REPO, 'packages/cli/src/lib/xle/registry.mjs')
);
const {discoverTemplates} = await import(
  resolve(REPO, 'packages/cli/src/api/template.mjs')
);

const registry = await buildRegistry({cwd: REPO});

let blocks = [];
try {
  const all = await discoverTemplates(REPO);
  blocks = all
    .filter(t => t.type === 'block')
    .map(b => ({
      dirName: b.dirName,
      description: b.description || '',
      category: b.category || '',
    }));
} catch {
  // blocks are optional — {hint} just won't resolve in the page
}

const payload = {
  generated: 'scripts/generate-xle-registry.mjs',
  registry: serializeRegistry(registry),
  blocks,
};

mkdirSync(dirname(OUT), {recursive: true});
writeFileSync(OUT, JSON.stringify(payload));
console.log(
  `✓ xle-registry.json: ${payload.registry.components.length} components, ` +
    `${payload.registry.aliases.length} aliases, ${blocks.length} blocks`,
);
