#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Verify the PUBLISHED `@astryxdesign/cli/api` type surface.
 *
 * The `./api` declarations (`api/**\/*.d.mts`) are generated from the JSDoc in
 * `api/**\/*.mjs` at `prepack` — they are NOT committed. This test proves the
 * surface a consumer actually installs is correct, by exercising the real
 * publish path end to end:
 *
 *   1. `pnpm pack` the CLI (fires `prepack` → `sync:api-types`), producing the
 *      exact tarball that would be published.
 *   2. Extract it and assert `api/index.d.mts` is present.
 *   3. Type-check a representative consumer import against the packed package
 *      under `strict` + `skipLibCheck:false`, so a stale, missing, malformed,
 *      or internal-leaking surface fails here — before it can ship.
 *
 * Usage: node .github/scripts/cli-api-types-verify.mjs
 */

import {execFileSync, spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CLI_DIR = path.join(ROOT, 'packages/cli');
const CORE_DIR = path.join(ROOT, 'packages/core');

function fail(msg, detail) {
  console.error(`\u2717 ${msg}`);
  if (detail) console.error(detail);
  process.exit(1);
}

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-api-verify-'));
process.on('exit', () => fs.rmSync(work, {recursive: true, force: true}));

// 1. Pack the CLI — this fires `prepack` (sync:api-types), so the tarball
//    carries a freshly generated ./api surface.
console.log('Packing @astryxdesign/cli (fires prepack → sync:api-types)...');
let packed;
try {
  const out = execFileSync('pnpm', ['pack', '--pack-destination', work], {
    cwd: CLI_DIR,
    encoding: 'utf8',
  });
  packed = out.trim().split('\n').pop().trim();
} catch (e) {
  fail('pnpm pack failed', e.stdout || e.message);
}
const tarball = path.isAbsolute(packed) ? packed : path.join(work, path.basename(packed));
if (!fs.existsSync(tarball)) fail(`packed tarball not found at ${tarball}`);

// 2. Extract into a fake consumer's node_modules and assert the entry exists.
const consumer = path.join(work, 'consumer');
const pkgDir = path.join(consumer, 'node_modules', '@astryxdesign', 'cli');
fs.mkdirSync(pkgDir, {recursive: true});
execFileSync('tar', ['-xzf', tarball, '-C', pkgDir, '--strip-components=1']);

const entry = path.join(pkgDir, 'api', 'index.d.mts');
if (!fs.existsSync(entry)) {
  fail('packaged tarball is missing api/index.d.mts — the ./api types did not ship');
}
console.log('\u2713 tarball ships api/index.d.mts');

// Link @astryxdesign/core (a peer the ./api types reference) so resolution is real.
fs.symlinkSync(CORE_DIR, path.join(consumer, 'node_modules', '@astryxdesign', 'core'), 'dir');
// node types + a minimal undici stub so @types/node resolves.
fs.mkdirSync(path.join(consumer, 'node_modules', '@types'), {recursive: true});
fs.symlinkSync(
  path.join(ROOT, 'node_modules', '@types', 'node'),
  path.join(consumer, 'node_modules', '@types', 'node'),
  'dir',
);
fs.mkdirSync(path.join(consumer, 'node_modules', 'undici-types'), {recursive: true});
fs.writeFileSync(path.join(consumer, 'node_modules', 'undici-types', 'index.d.ts'), 'export {}\n');
fs.writeFileSync(
  path.join(consumer, 'node_modules', 'undici-types', 'package.json'),
  '{"name":"undici-types","version":"0.0.0","types":"index.d.ts"}',
);
fs.writeFileSync(
  path.join(consumer, 'package.json'),
  '{"name":"consumer","version":"1.0.0","type":"module","private":true}',
);

// 3. Type-check a representative consumer import against the packed types.
const scenario = `
import {
  component, docs, blog, discover, template, hook, search, build, swizzle,
  upgrade, init, doctor, layoutExpand, layoutCheck, layoutGrammar,
  themeBuild, themeAdd, themeList, listThemes,
  validateIntegration, summarizeIssues, logger, AstryxError,
} from '@astryxdesign/cli/api';
import type {
  ComponentOptions, SearchOptions, UpgradeOptions,
  ComponentDetailResponse, SearchResponse, UpgradeRunResponse, Logger,
} from '@astryxdesign/cli/api';

async function main() {
  const r = await component('Button');
  if (r.type === 'component.detail') { const n: string = r.data.name; void n; }
  const s: SearchOptions = { limit: 5, type: 'component' };
  const l: Logger = logger; l.setSilent(false); l.log('x');
  void ({} as ComponentOptions); void ({} as UpgradeOptions);
  void ({} as ComponentDetailResponse); void ({} as SearchResponse); void ({} as UpgradeRunResponse);
  void [docs, blog, discover, template, hook, search, build, swizzle, upgrade, init,
    doctor, layoutExpand, layoutCheck, layoutGrammar, themeBuild, themeAdd, themeList,
    listThemes, validateIntegration, summarizeIssues, AstryxError, s];
}
void main;
export {};
`;
fs.writeFileSync(path.join(consumer, 'scenario.ts'), scenario);
fs.writeFileSync(
  path.join(consumer, 'tsconfig.json'),
  JSON.stringify(
    {
      // `bundler` resolution is the modern default (Vite/Next/tsup/etc.) and the
      // baseline this package targets. `skipLibCheck:false` forces TS to fully
      // check inside the packaged declarations, so a stale, missing, malformed,
      // or internal-`lib`-leaking surface fails here.
      compilerOptions: {
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        target: 'es2022',
        types: ['node'],
      },
      files: ['scenario.ts'],
    },
    null,
    2,
  ),
);

const tsc = path.join(ROOT, 'node_modules', '.bin', 'tsc');
const res = spawnSync(tsc, ['--project', 'tsconfig.json'], {cwd: consumer, encoding: 'utf8'});
// Ignore harness-only noise from the minimal undici stub / @types/node globals.
const errors = (res.stdout || '')
  .split('\n')
  .filter(line => /error TS/.test(line))
  .filter(line => !/undici-types|@types\/node/.test(line));

if (errors.length > 0) {
  fail(
    'a consumer of the packaged @astryxdesign/cli/api does not type-check',
    errors.join('\n'),
  );
}

console.log('\u2713 packaged @astryxdesign/cli/api type-checks for a strict consumer');
console.log('\nAll ./api type-surface checks passed.');
