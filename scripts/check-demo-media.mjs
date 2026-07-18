#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Source check: Thumbnail block examples must use CORS-safe demo media.
 *
 * Thumbnail's remove-button overlay uses useImageMode, which FETCHES the image
 * (`fetch(src, {mode: 'cors'})` -> createImageBitmap -> OffscreenCanvas
 * getImageData) to sample pixels for APCA contrast. Any cross-origin URL
 * without `Access-Control-Allow-Origin` cannot be fetched/sampled, so contrast
 * detection fails silently and logs CORS errors in hosted previews. These
 * image-backed examples must therefore use a self-contained, same-origin,
 * samplable source — a `data:` URI — rather than ANY remote `http(s)://` URL.
 *
 * (Other blocks self-host demo media under `/template-assets/*`, which is
 * same-origin and CORS-safe; Thumbnail examples go one step further and inline
 * a `data:` URI so the sample works with zero network dependency at all.)
 *
 * Usage: node scripts/check-demo-media.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const THUMBNAIL_BLOCK_DIR = path.resolve(
  __dirname,
  '../packages/cli/templates/blocks/components/Thumbnail',
);

// Any remote http(s) src cannot be guaranteed CORS-sampleable by useImageMode.
// Thumbnail image-backed examples must inline a same-origin `data:` URI.
const REMOTE_MEDIA_RE = /(?:src=|src:)\s*['"`]?\s*(https?:\/\/[^\s'"`)]+)/g;

const errors = [];
let checked = 0;

const files = fs.existsSync(THUMBNAIL_BLOCK_DIR)
  ? fs.readdirSync(THUMBNAIL_BLOCK_DIR).filter(f => f.endsWith('.tsx'))
  : [];

for (const file of files) {
  const full = path.join(THUMBNAIL_BLOCK_DIR, file);
  const source = fs.readFileSync(full, 'utf-8');

  // Only the examples that actually render an image-backed Thumbnail drive the
  // useImageMode sampling path; skip examples with no image src.
  if (!source.includes('src=') && !source.includes('src:')) continue;
  checked++;

  const remote = [...source.matchAll(REMOTE_MEDIA_RE)].map(m => m[1]);
  if (remote.length > 0) {
    errors.push({
      file,
      issue: `references remote media (${remote[0]}) — useImageMode cannot guarantee CORS-sampling it for the remove-button overlay`,
    });
  }
}

if (errors.length > 0) {
  console.error('❌ Thumbnail demo-media errors:\n');
  for (const {file, issue} of errors) {
    console.error(`  ${file}: ${issue}`);
  }
  console.error(
    `\n${errors.length} error(s). Fix: use a same-origin, samplable data: URI for image-backed Thumbnail examples.`,
  );
  process.exit(1);
}

console.log(
  `✅ ${checked} image-backed Thumbnail example(s) checked — all use CORS-safe demo media.`,
);
