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

import {createRequire} from 'module';
import {cpSync, copyFileSync, existsSync, mkdirSync, statSync} from 'fs';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// --- Monaco editor (min/vs) ---
const monacoPkg = require.resolve('monaco-editor/package.json');
const monacoVs = join(dirname(monacoPkg), 'min', 'vs');
const monacoDest = join(publicDir, 'monaco', 'vs');
if (existsSync(join(monacoDest, 'loader.js'))) {
  console.log('monaco: already present at public/monaco/vs — skipping');
} else {
  mkdirSync(dirname(monacoDest), {recursive: true});
  cpSync(monacoVs, monacoDest, {recursive: true});
  console.log('monaco: copied min/vs -> public/monaco/vs');
}

// --- TypeScript (browser UMD) ---
const tsLib = require.resolve('typescript/lib/typescript.js');
const tsDest = join(publicDir, 'vendor', 'typescript.js');
if (existsSync(tsDest) && statSync(tsDest).size === statSync(tsLib).size) {
  console.log(
    'typescript: already present at public/vendor/typescript.js — skipping',
  );
} else {
  mkdirSync(dirname(tsDest), {recursive: true});
  copyFileSync(tsLib, tsDest);
  console.log('typescript: copied -> public/vendor/typescript.js');
}
