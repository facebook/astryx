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
 * 1. Every doc-type ships a complete quartet:
 *      type.ts          the authored shape
 *      parse.mjs        the sealed parser (the CLI's load boundary)
 *      parse.d.mts      the parser's declaration
 *      <kind>.doc.mjs   the doc-type documenting itself
 *    The declaration is not optional: `authoring/index.d.ts` re-exports each
 *    parser, so a missing parse.d.mts makes a strict consumer of the published
 *    package resolve it as `any`. That shipped once and only surfaced at pack
 *    time in CI (TS7016) — long after local typechecks passed clean, because
 *    they run with checkJs and never exercise the packed ./api type surface.
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
const aggregateParseDecl = fs.readFileSync(
  path.join(DOCTYPES, 'parse.d.mts'),
  'utf8',
);

for (const kind of dirsIn(DOCTYPES)) {
  if (DOCTYPE_EXEMPT.has(kind)) continue;
  doctypeCount++;
  const dir = path.join(DOCTYPES, kind);

  for (const required of ['type.ts', 'parse.mjs', 'parse.d.mts', `${kind}.doc.mjs`]) {
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

  // The aggregate parseDoc declaration shadows its implementation for published
  // consumers, so a kind missing from that union is silently unnarrowable —
  // `type === 'schema'` reads as a no-overlap comparison and `fields` is
  // inaccessible. Existence of parse.d.mts is not enough; it must cover the kind.
  const docType = `${kind[0].toUpperCase()}${kind.slice(1)}Doc`;
  if (!aggregateParseDecl.includes(docType)) {
    errors.push(
      `doc-type "${kind}" is missing from the parseDoc return union in authoring/doctypes/parse.d.mts (expected ${docType})`,
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
