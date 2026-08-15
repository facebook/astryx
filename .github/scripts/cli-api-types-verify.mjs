#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Verify the PUBLISHED `@astryxdesign/cli/api` and `/authoring` type surfaces.
 *
 * Both sets of declarations (`api/**\/*.d.mts`, `authoring/**\/*.d.mts`) are
 * generated from the JSDoc in their `.mjs` at `prepack` — they are NOT
 * committed. This test proves the surface a consumer actually installs is
 * correct, end to end:
 *
 *   1. `pnpm pack` the CLI (fires `prepack` → `sync:api-types`), producing the
 *      exact tarball that would be published.
 *   2. Extract it into a throwaway `node_modules/@astryxdesign/cli` and assert
 *      `api/index.d.mts` is present. `@astryxdesign/core` is linked as a sibling
 *      so the packed declarations' `../../../core/src` specifiers resolve just
 *      like a real install.
 *   3. Type-check a representative consumer import against the packed package
 *      with `skipLibCheck` OFF, so a stale, missing, malformed, or internal-
 *      `lib`-leaking surface fails here — before it can ship. The scenario's
 *      tsconfig extends the repo base so lib/target/@types/node are inherited.
 *
 * Usage: node .github/scripts/cli-api-types-verify.mjs
 */

import {execFileSync, spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CLI_DIR = path.join(ROOT, 'packages/cli');
const CORE_DIR = path.join(ROOT, 'packages/core');
// Scratch area inside the repo so the repo tsconfig (lib/target/@types/node) and
// the workspace's installed typescript are all inherited without any setup.
const VERIFY_DIR = path.join(CLI_DIR, '.api-verify');

function cleanup() {
  fs.rmSync(VERIFY_DIR, {recursive: true, force: true});
}
function fail(msg, detail) {
  console.error(`\u2717 ${msg}`);
  if (detail) console.error(detail);
  cleanup();
  process.exit(1);
}
process.on('exit', cleanup);

cleanup();
const nm = path.join(VERIFY_DIR, 'node_modules', '@astryxdesign');
fs.mkdirSync(nm, {recursive: true});

// 1. Pack (fires prepack → sync:api-types).
console.log('Packing @astryxdesign/cli (fires prepack \u2192 sync:api-types)...');
let packed;
try {
  const out = execFileSync('pnpm', ['pack', '--pack-destination', VERIFY_DIR], {
    cwd: CLI_DIR,
    encoding: 'utf8',
  });
  packed = out.trim().split('\n').pop().trim();
} catch (e) {
  fail('pnpm pack failed', e.stdout || e.message);
}
const tarball = path.isAbsolute(packed) ? packed : path.join(VERIFY_DIR, path.basename(packed));
if (!fs.existsSync(tarball)) fail(`packed tarball not found at ${tarball}`);

// 2. Extract into node_modules/@astryxdesign/cli; link core as a sibling.
const pkgDir = path.join(nm, 'cli');
fs.mkdirSync(pkgDir, {recursive: true});
execFileSync('tar', ['-xzf', tarball, '-C', pkgDir, '--strip-components=1']);
if (!fs.existsSync(path.join(pkgDir, 'api', 'index.d.mts'))) {
  fail('packaged tarball is missing api/index.d.mts \u2014 the ./api types did not ship');
}
console.log('\u2713 tarball ships api/index.d.mts');
// The authoring parser declarations are generated too, so the same "did it
// actually ship" question applies to them.
if (!fs.existsSync(path.join(pkgDir, 'authoring', 'doctypes', 'parse.d.mts'))) {
  fail(
    'packaged tarball is missing authoring/doctypes/parse.d.mts \u2014 the generated ./authoring types did not ship',
  );
}
console.log('\u2713 tarball ships the generated ./authoring declarations');
// The api declarations re-export from foundation (e.g. api/template re-exports
// the template adapter), so foundation's declarations have to ship too or those
// re-exports resolve to `any` for a strict consumer.
if (!fs.existsSync(path.join(pkgDir, 'foundation', 'discovery', 'template-adapter.d.mts'))) {
  fail(
    'packaged tarball is missing foundation/discovery/template-adapter.d.mts \u2014 the api declarations re-export from foundation, so its declarations must ship too',
  );
}
console.log('\u2713 tarball ships the generated foundation declarations');
fs.symlinkSync(CORE_DIR, path.join(nm, 'core'), 'dir');

// 3. Type-check a representative consumer against the packed types.
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

// ── ./authoring ─────────────────────────────────────────────────────────
// These declarations are generated from JSDoc too. The narrowing below is the
// regression test for a stale parseDoc return union: when three doc kinds were
// missing from it, \`doc.type === 'schema'\` was a no-overlap error and \`fields\`
// was inaccessible — while everything still compiled inside the repo.
import {
  parseDoc, parseComponent, parseHook, parseFunction, parseReference,
  parseTemplate, parseSchema, parseCommand, parseEnum,
} from '@astryxdesign/cli/authoring';
import type {SchemaDoc, CommandDoc, EnumDoc, FunctionDoc} from '@astryxdesign/cli/authoring';

function authoringSurface(raw: unknown) {
  const doc = parseDoc(raw);
  if (doc.type === 'schema') { const f = doc.fields; void f; }
  if (doc.type === 'command') { const su: string = doc.summary; void su; }
  if (doc.type === 'enum') { const m = doc.members; void m; }

  const schema: SchemaDoc = parseSchema(raw);
  const command: CommandDoc = parseCommand(raw);
  const enumDoc: EnumDoc = parseEnum(raw);
  const fn: FunctionDoc = parseFunction(raw);
  void [schema, command, enumDoc, fn];
  void [parseComponent, parseHook, parseReference, parseTemplate];
}
void authoringSurface;
export {};
`;
fs.writeFileSync(path.join(VERIFY_DIR, 'scenario.ts'), scenario);
fs.writeFileSync(
  path.join(VERIFY_DIR, 'tsconfig.json'),
  JSON.stringify(
    {
      // Inherit the repo's lib/target/@types/node. `bundler` resolution is the
      // modern default this package targets; skipLibCheck OFF so the packed
      // declarations are fully checked. `source` condition lets `@astryxdesign/core`
      // subpaths (e.g. /authoring) resolve from core's src without a build — the
      // `test` job doesn't build, and src/dist declare identical types (dist is
      // compiled from src). A published consumer resolves the same types via dist.
      extends: '../../../tsconfig.json',
      compilerOptions: {
        noEmit: true,
        skipLibCheck: false,
        module: 'esnext',
        moduleResolution: 'bundler',
        customConditions: ['source'],
        types: ['node'],
      },
      files: ['scenario.ts'],
    },
    null,
    2,
  ),
);

const tsc = path.join(ROOT, 'node_modules', '.bin', 'tsc');
const res = spawnSync(tsc, ['--project', path.join(VERIFY_DIR, 'tsconfig.json')], {
  cwd: ROOT,
  encoding: 'utf8',
});
if (res.error) fail('failed to run tsc', String(res.error));
const output = `${res.stdout || ''}\n${res.stderr || ''}`;
const errors = output.split('\n').filter(line => /error TS/.test(line));
// Fail closed: a non-zero exit with no parseable diagnostics still means the
// packaged surface did not cleanly type-check.
if (res.status !== 0 && errors.length === 0) {
  fail('tsc exited non-zero while checking the packaged ./api surface', output.trim());
}
if (errors.length > 0) {
  fail('a consumer of the packaged @astryxdesign/cli/api does not type-check', errors.join('\n'));
}

console.log(
  '\u2713 packaged @astryxdesign/cli/api + /authoring type-check for a strict consumer',
);
console.log('\nAll published type-surface checks passed.');
