#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * Pre-generate resolved foundation docs as a JSON file for the sandbox.
 *
 * The CLI docs API uses dynamic imports and filesystem operations that
 * can't run in a webpack/Next.js client bundle. This script resolves
 * token-refs at build time and writes a static JSON file.
 *
 * Run: node apps/sandbox/scripts/generate-foundation-docs.mjs
 */

import {writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {docs as docsApi} from '../../../packages/cli/api/docs/docs.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '../src/generated/foundationDocs.json');

const TOPICS = ['color', 'spacing', 'typography', 'elevation', 'shape', 'motion'];

async function main() {
  const result = {};
  for (const topic of TOPICS) {
    const res = await docsApi(topic);
    if (res.type === 'docs.detail') {
      result[topic] = res.data;
    }
  }
  writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
  const kb = (Buffer.byteLength(JSON.stringify(result)) / 1024).toFixed(1);
  console.log(`✓ Generated ${OUTPUT} (${TOPICS.length} topics, ${kb} KB)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
