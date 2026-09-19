#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Repo check: the CLI's structural conventions, from CONTRIBUTING >
 * "Working on the astryx CLI".
 *
 * These are invariants about which files exist *next to each other*, which is
 * precisely what typechecking and unit tests cannot see — every individual file
 * is valid, the set is incomplete.
 *
 * 1. Every doc-type ships a complete trio, and re-exports its parser from the
 *    authoring barrel:
 *      type.ts          the authored shape
 *      parse.mjs        the sealed parser (the CLI's load boundary)
 *      <kind>.doc.mjs   the doc-type documenting itself
 *    The parser's `.d.mts` declaration is deliberately NOT checked here: it is
 *    generated from the `.mjs` JSDoc by scripts/sync-api-types.mjs, so it can
 *    neither go missing nor drift. (Both failure modes shipped once while those
 *    declarations were hand-written — a missing file surfaced as TS7016 at pack
 *    time, and a stale parseDoc union silently dropped three doc kinds.)
 *
 * 2. Every api/<name>/ leaf carries its colocated contract and proof:
 *      *.type.mjs   the Options + { type, data } response typedefs, or a
 *                   published index.ts for a barrel that re-exports them
 *      *.doc.mjs    the FunctionDoc
 *      *.test.mjs   coverage (may be nested, e.g. api/theme/build/build.test.mjs)
 *
 * Deliberately NOT checked here: command <-> CommandDoc pairing. That is not a
 * filename convention — subcommand docs (layout-expand, theme-add, ...) live
 * inside their group's handler and `manifest` registers in index.mjs — and the
 * drift harness already validates it semantically against the live manifest,
 * which is strictly stronger than matching filenames.
 *
 * Usage: node scripts/check-cli-structure.mjs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLI = path.join(REPO_ROOT, 'packages/cli');
const DOCTYPES = path.join(CLI, 'authoring/doctypes');
const API = path.join(CLI, 'api');

/** `base/` holds the shared leaf types (SlotDoc, ExampleDoc, ...) that other
 *  doc-types compose. It is not a doc kind: nothing parses a "base doc". */
const DOCTYPE_EXEMPT = new Set(['base']);

/** @param {string} dir @returns {string[]} */
const dirsIn = dir =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory())
    : [];

/** Recursively collect file names under a directory. @param {string} dir @returns {string[]} */
function walk(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.isDirectory()) out.push(...walk(path.join(dir, entry.name)));
    else out.push(entry.name);
  }
  return out;
}

/** @type {string[]} */
const errors = [];
let doctypeCount = 0;
let apiCount = 0;

// ── 1. doc-type quartets ────────────────────────────────────────────────
const authoringIndexTypes = fs.readFileSync(path.join(CLI, 'authoring/index.d.ts'), 'utf8');
const authoringIndexImpl = fs.readFileSync(path.join(CLI, 'authoring/index.mjs'), 'utf8');
/**
 * parseDoc's own `@returns {...}` union — the source the emitted declaration
 * derives from. Scoped to the JSDoc block immediately above `export function
 * parseDoc`: the file also carries a `@typedef` line per kind, so matching the
 * whole file would find every kind name and never fail.
 */
const parseSrc = fs.readFileSync(path.join(DOCTYPES, 'parse.mjs'), 'utf8');
const parseDocJsdoc = parseSrc.slice(0, parseSrc.indexOf('export function parseDoc'));
const returnsMatches = parseDocJsdoc.match(/@returns\s*\{[^}]*\}/g) ?? [];
const aggregateParserReturns = returnsMatches[returnsMatches.length - 1] ?? '';
if (!aggregateParserReturns) {
  errors.push('could not find a @returns union on parseDoc in authoring/doctypes/parse.mjs');
}

for (const kind of dirsIn(DOCTYPES)) {
  if (DOCTYPE_EXEMPT.has(kind)) continue;
  doctypeCount++;
  const dir = path.join(DOCTYPES, kind);

  for (const required of ['type.ts', 'parse.mjs', `${kind}.doc.mjs`]) {
    if (!fs.existsSync(path.join(dir, required))) {
      errors.push(
        `doc-type "${kind}" is missing authoring/doctypes/${kind}/${required}`,
      );
    }
  }

  // A parser nobody re-exports is unreachable from @astryxdesign/cli/authoring.
  const spec = `./doctypes/${kind}/parse.mjs`;
  if (!authoringIndexTypes.includes(spec)) {
    errors.push(`doc-type "${kind}" parser is not re-exported from authoring/index.d.ts`);
  }
  if (!authoringIndexImpl.includes(spec)) {
    errors.push(`doc-type "${kind}" parser is not re-exported from authoring/index.mjs`);
  }

  // parseDoc's own `@returns` is what the generated declaration derives its
  // return union from, so a kind missing there is silently unnarrowable for
  // consumers (`type === 'schema'` reads as a no-overlap comparison). Checking
  // the JSDoc catches it at the source rather than in the emitted artifact.
  const docType = `${kind[0].toUpperCase()}${kind.slice(1)}Doc`;
  if (!aggregateParserReturns.includes(docType)) {
    errors.push(
      `doc-type "${kind}" is missing from the @returns union of authoring/doctypes/parse.mjs (expected ${docType})`,
    );
  }
}

// ── 2. api/<name>/ leaves ───────────────────────────────────────────────
for (const name of dirsIn(API)) {
  apiCount++;
  const dir = path.join(API, name);
  const files = walk(dir);
  const topLevel = fs.readdirSync(dir);

  if (!files.some(f => f.endsWith('.doc.mjs'))) {
    errors.push(`api/${name}/ is missing a FunctionDoc (*.doc.mjs)`);
  }
  // Types ship as colocated JSDoc typedefs, or — for a barrel that only
  // re-exports other leaves' types (api/json) — as the published index.ts that
  // package.json's "exports" points at.
  if (!files.some(f => f.endsWith('.type.mjs')) && !topLevel.includes('index.ts')) {
    errors.push(
      `api/${name}/ is missing response typedefs (*.type.mjs, or a published index.ts)`,
    );
  }
  if (!files.some(f => f.endsWith('.test.mjs'))) {
    errors.push(`api/${name}/ is missing a test (*.test.mjs)`);
  }
}

// If a directory is moved or renamed, the loops above simply iterate nothing and
// this would report a cheerful "0 checked". A check that passes when its subject
// disappears is worse than no check, so require having found something real.
if (doctypeCount === 0) {
  errors.push(
    `found no doc-type folders under ${path.relative(REPO_ROOT, DOCTYPES)} — has the directory moved? Update this check.`,
  );
}
if (apiCount === 0) {
  errors.push(
    `found no api/<name>/ folders under ${path.relative(REPO_ROOT, API)} — has the directory moved? Update this check.`,
  );
}

if (errors.length > 0) {
  console.error('❌ CLI structure violations:\n');
  for (const e of errors) console.error(`  ${e}`);
  console.error(
    `\n${errors.length} error(s). See CONTRIBUTING > "Working on the astryx CLI".`,
  );
  process.exit(1);
}

console.log(
  `✅ ${doctypeCount} doc-type(s) + ${apiCount} api folder(s) checked — CLI structure is intact.`,
);
