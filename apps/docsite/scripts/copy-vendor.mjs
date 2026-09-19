#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Copies third-party browser assets into public/ so the playground can run
 * fully self-hosted (corpnet blocks external CDNs like jsdelivr / unpkg):
 *
 *   - monaco-editor/min/vs        -> public/monaco/vs   (Monaco AMD loader + workers)
 *   - typescript/lib/typescript.js -> public/vendor/typescript.js (in-browser TSX transpile + AST)
 *
 * Idempotent: skips files that already exist. Run as part of `generate`.
 */

import {createRequire} from 'node:module';
import {cpSync, copyFileSync, existsSync, mkdirSync, statSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

/**
 * Resolve a vendored dependency, returning null (with a warning) instead of
 * throwing when it isn't installed. A partial/offline install shouldn't abort
 * the whole `generate` chain — data generation already ran; only the
 * playground editor/preview degrade until a full install provides these.
 */
function tryResolve(spec) {
  try {
    return require.resolve(spec);
  } catch {
    console.warn(`vendor: '${spec}' not installed — skipping (run a full install to enable it)`);
    return null;
  }
}

// --- Monaco editor (min/vs) ---
const monacoPkg = tryResolve('monaco-editor/package.json');
const monacoDest = join(publicDir, 'monaco', 'vs');
if (!monacoPkg) {
  // skipped — warned above
} else if (existsSync(join(monacoDest, 'loader.js'))) {
  console.log('monaco: already present at public/monaco/vs — skipping');
} else {
  const monacoVs = join(dirname(monacoPkg), 'min', 'vs');
  mkdirSync(dirname(monacoDest), {recursive: true});
  cpSync(monacoVs, monacoDest, {recursive: true});
  console.log('monaco: copied min/vs -> public/monaco/vs');
}

// --- TypeScript (browser UMD) ---
const tsLib = tryResolve('typescript/lib/typescript.js');
const tsDest = join(publicDir, 'vendor', 'typescript.js');
if (!tsLib) {
  // skipped — warned above
} else if (existsSync(tsDest) && statSync(tsDest).size === statSync(tsLib).size) {
  console.log(
    'typescript: already present at public/vendor/typescript.js — skipping',
  );
} else {
  mkdirSync(dirname(tsDest), {recursive: true});
  copyFileSync(tsLib, tsDest);
  console.log('typescript: copied -> public/vendor/typescript.js');
}
