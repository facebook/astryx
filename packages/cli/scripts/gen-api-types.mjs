// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Generate the public `./api` type surface from the JSDoc source of truth.
 *
 * Functions own their types: each api leaf's `@returns` + colocated
 * `.type.mjs` typedefs ARE the contract. This script runs `tsc`
 * (allowJs + checkJs + declaration + emitDeclarationOnly) over the api sources
 * into a throwaway temp dir, then copies just the emitted api declaration tree
 * (the `.d.mts` files) back alongside the sources (so their relative imports and
 * shared `types` declarations resolve). `api/index.d.mts` is the entry that
 * `package.json` exports["./api"].types points at.
 *
 * Run `pnpm gen:api-types`; the CI guard (`check:api-types-current`) re-runs this
 * and fails if the committed declarations are stale.
 *
 * @position packages/cli/scripts — build tooling; not shipped runtime
 */

import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const CLI_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = '/tmp/astryx-dts-build';
const EMITTED_API = path.join(TMP, 'packages', 'cli', 'api');
const DEST_API = path.join(CLI_ROOT, 'api');

/**
 * Recursively copy every emitted declaration from `src` to `dest`, preserving
 * structure.
 * @param {string} src
 * @param {string} dest
 */
function copyDts(src, dest) {
  for (const entry of fs.readdirSync(src, {withFileTypes: true})) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDts(s, d);
    } else if (entry.name.endsWith('.d.mts')) {
      fs.mkdirSync(dest, {recursive: true});
      fs.copyFileSync(s, d);
    }
  }
}

fs.rmSync(TMP, {recursive: true, force: true});
execFileSync('pnpm', ['exec', 'tsc', '--project', 'tsconfig.api-dts.json'], {
  cwd: CLI_ROOT,
  stdio: 'inherit',
});
if (!fs.existsSync(EMITTED_API)) {
  throw new Error(`Expected emitted declarations at ${EMITTED_API} — tsc produced nothing.`);
}
copyDts(EMITTED_API, DEST_API);
fs.rmSync(TMP, {recursive: true, force: true});
console.log('Generated api declarations from JSDoc source of truth.');
