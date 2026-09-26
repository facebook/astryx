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
 * 1. Every doc-type ships a complete trio, re-exports its public type from the
 *    doc vocabulary, and re-exports its parser from the authoring barrel:
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

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const CLI = path.join(REPO_ROOT, 'packages/cli');
const DOCTYPES = path.join(CLI, 'authoring/doctypes');
const API = path.join(CLI, 'api');

/** `base/` holds the shared leaf types (SlotDoc, ExampleDoc, ...) that other
 *  doc-types compose. It is not a doc kind: nothing parses a "base doc". */
const DOCTYPE_EXEMPT = new Set(['base']);

/** @param {string} dir @returns {string[]} */
const dirsIn = dir =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter(f => fs.statSync(path.join(dir, f)).isDirectory())
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
const authoringIndexTypes = fs.readFileSync(
  path.join(CLI, 'authoring/index.d.ts'),
  'utf8',
);
const docTypeExports = fs.readFileSync(path.join(DOCTYPES, 'types.ts'), 'utf8');
const authoringIndexImpl = fs.readFileSync(
  path.join(CLI, 'authoring/index.mjs'),
  'utf8',
);
/**
 * parseDoc's own `@returns {...}` union — the source the emitted declaration
 * derives from. Scoped to the JSDoc block immediately above `export function
 * parseDoc`: the file also carries a `@typedef` line per kind, so matching the
 * whole file would find every kind name and never fail.
 */
const parseSrc = fs.readFileSync(path.join(DOCTYPES, 'parse.mjs'), 'utf8');
const parseDocJsdoc = parseSrc.slice(
  0,
  parseSrc.indexOf('export function parseDoc'),
);
const returnsMatches = parseDocJsdoc.match(/@returns\s*\{[^}]*\}/g) ?? [];
const aggregateParserReturns = returnsMatches[returnsMatches.length - 1] ?? '';
if (!aggregateParserReturns) {
  errors.push(
    'could not find a @returns union on parseDoc in authoring/doctypes/parse.mjs',
  );
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

  const typeSpec = `./${kind}/type`;
  if (!docTypeExports.includes(typeSpec)) {
    errors.push(
      `doc-type "${kind}" type is not re-exported from authoring/doctypes/types.ts`,
    );
  }

  // A parser nobody re-exports is unreachable from @astryxdesign/cli/authoring.
  const spec = `./doctypes/${kind}/parse.mjs`;
  if (!authoringIndexTypes.includes(spec)) {
    errors.push(
      `doc-type "${kind}" parser is not re-exported from authoring/index.d.ts`,
    );
  }
  if (!authoringIndexImpl.includes(spec)) {
    errors.push(
      `doc-type "${kind}" parser is not re-exported from authoring/index.mjs`,
    );
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
  if (
    !files.some(f => f.endsWith('.type.mjs')) &&
    !topLevel.includes('index.ts')
  ) {
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

// ── 3. INV22 + INV21: environment imports ───────────────────────────
//
// Handlers (INV22) and non-adapter API modules (INV21) must not import
// filesystem, network, subprocess, Project, or discovery modules. Those
// belong in the API's _adapter.mjs and underscore-prefixed helpers.
//
// Each entry is an allowed set of ban categories for a file that predates
// these checks. An entry that becomes stale — the file no longer imports
// that category — MUST fail so the allowlist can only shrink.

/** Recursively collect .mjs files, excluding tests and docs.
 *  @param {string} dir @returns {string[]} full paths */
function walkScopedMjs(dir) {
  /** @type {string[]} */
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkScopedMjs(full));
    } else if (
      entry.name.endsWith('.mjs') &&
      !entry.name.endsWith('.test.mjs') &&
      !entry.name.endsWith('.doc.mjs')
    ) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Extract import/re-export module specifiers from a source file.
 * Catches both static (`import X from '…'`, `export {X} from '…'`) and
 * runtime dynamic (`await import('…')`) imports.  JSDoc type-only imports
 * (`{import('…')}`) are excluded so they do not produce false positives.
 * @param {string} filePath
 * @returns {string[]}
 */
function importSources(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  /** @type {string[]} */
  const out = [];
  // Static imports and re-exports
  for (const m of src.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) {
    out.push(m[1]);
  }
  // Runtime dynamic imports — but not JSDoc type-only `{import('…')}`
  for (const m of src.matchAll(/(?<!\{)\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    out.push(m[1]);
  }
  return out;
}

/**
 * Classify a module specifier into a ban category, or null if allowed.
 * @param {string} spec
 * @returns {'fs'|'child_process'|'net'|'project'|'discovery'|null}
 */
function banCategory(spec) {
  if (spec === 'node:fs' || spec === 'node:fs/promises') return 'fs';
  if (spec === 'node:child_process') return 'child_process';
  if (spec === 'node:net' || spec === 'node:http' || spec === 'node:https') return 'net';
  if (spec.includes('foundation/config/project')) return 'project';
  if (spec.includes('foundation/discovery/')) return 'discovery';
  return null;
}

/**
 * Scan files for banned environment imports and enforce the known-gap
 * allowlist.  A new violation in an allowlisted file fails, and a stale
 * entry (the file no longer imports that category) also fails.
 *
 * @param {string} label  invariant name for error messages
 * @param {string[]} files  full paths to scan
 * @param {string} baseDir  base for relative paths in the allowlist
 * @param {Map<string, Set<string>>} knownGaps  relative-path → allowed categories
 * @returns {number} files checked
 */
function checkEnvironmentImports(label, files, baseDir, knownGaps) {
  let checked = 0;
  for (const filePath of files) {
    checked++;
    const rel = path.relative(baseDir, filePath);
    const sources = importSources(filePath);
    /** @type {Set<string>} */
    const found = new Set();
    for (const s of sources) {
      const cat = banCategory(s);
      if (cat) found.add(cat);
    }

    const allowed = knownGaps.get(rel);
    if (allowed) {
      for (const cat of found) {
        if (!allowed.has(cat)) {
          errors.push(
            `${label}: ${rel} has a new environment import (${cat}) not in the known-gap allowlist`,
          );
        }
      }
      for (const cat of allowed) {
        if (!found.has(cat)) {
          errors.push(
            `${label}: ${rel} no longer imports ${cat} — remove it from the ${label} allowlist so the list can only shrink`,
          );
        }
      }
    } else if (found.size > 0) {
      errors.push(
        `${label}: ${rel} imports ${[...found].join(', ')} — environment access belongs in the adapter (architecture:cli-surface)`,
      );
    }
  }
  return checked;
}

// --- INV22: command handlers ---
const HANDLER_DIR = path.join(CLI, 'clients/cli/commands');
/** @type {Map<string, Set<string>>} known gaps recorded in AST-042;
 *  remove an entry when the file is fixed; do not add entries */
const INV22_KNOWN_GAPS = new Map([
  ['build-theme.mjs', new Set(['fs', 'child_process', 'project'])],
  ['component/index.mjs', new Set(['project', 'discovery'])],
  ['discover.mjs', new Set(['project'])],
  ['ensure-core-built.mjs', new Set(['fs', 'child_process'])],
  ['hook/index.mjs', new Set(['discovery'])],
  // remove with the layout command
  ['layout.mjs', new Set(['fs'])],
  ['search.mjs', new Set(['project'])],
  ['template.mjs', new Set(['fs', 'project'])],
]);
const handlerFiles = walkScopedMjs(HANDLER_DIR);
const inv22Count = checkEnvironmentImports(
  'INV22', handlerFiles, HANDLER_DIR, INV22_KNOWN_GAPS,
);

// --- INV21: API non-adapter modules ---
//
// INV21 says environment access happens in "the subject's adapter:
// `_adapter.mjs` and any underscore-prefixed helper that only it imports."
// The exemption is computed from the import graph: a `_*.mjs` file is exempt
// when every file that runtime-imports it is itself exempt (adapters, or
// helpers that only adapters import). A helper imported by a leaf is not
// exempt and must appear in the allowlist.

/** Collect all non-test, non-doc .mjs files under a directory.
 *  @param {string} dir @returns {string[]} */
function allMjsFiles(dir) {
  /** @type {string[]} */
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...allMjsFiles(full));
    else if (entry.name.endsWith('.mjs') && !entry.name.endsWith('.test.mjs') && !entry.name.endsWith('.doc.mjs')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Compute the set of underscore-prefixed API files that are exempt per INV21:
 * adapters plus helpers whose every runtime importer is itself exempt.
 * @returns {Set<string>} full paths of exempt files
 */
function computeAdapterExemptions() {
  const allApiFiles = allMjsFiles(API);

  // Identify all underscore-prefixed files under api/
  /** @type {Set<string>} */
  const underscoreFiles = new Set();
  for (const f of allApiFiles) {
    if (path.basename(f).startsWith('_')) underscoreFiles.add(f);
  }

  // Build reverse import graph: for each underscore file, who imports it?
  // Only consider runtime imports within packages/cli (non-test, non-doc).
  const allCliFiles = allMjsFiles(CLI);
  /** @type {Map<string, Set<string>>} target → set of importers */
  const importedBy = new Map();
  for (const uf of underscoreFiles) importedBy.set(uf, new Set());

  for (const srcFile of allCliFiles) {
    const sources = importSources(srcFile);
    const srcDir = path.dirname(srcFile);
    for (const spec of sources) {
      if (!spec.startsWith('.')) continue;
      const resolved = path.resolve(srcDir, spec);
      // The spec might omit the extension or resolve to a directory index;
      // since underscore files are always spelled with `.mjs`, a direct
      // resolve is enough.
      if (underscoreFiles.has(resolved) && resolved !== srcFile) {
        importedBy.get(resolved)?.add(srcFile);
      }
    }
  }

  // Seed: _adapter.mjs files are unconditionally exempt.
  /** @type {Set<string>} */
  const exempt = new Set();
  for (const uf of underscoreFiles) {
    if (path.basename(uf) === '_adapter.mjs') exempt.add(uf);
  }

  // Fixed-point: a helper is exempt if every importer is exempt.
  let changed = true;
  while (changed) {
    changed = false;
    for (const uf of underscoreFiles) {
      if (exempt.has(uf)) continue;
      const importers = importedBy.get(uf);
      if (!importers || importers.size === 0) continue;
      let allExempt = true;
      for (const imp of importers) {
        if (!exempt.has(imp)) { allExempt = false; break; }
      }
      if (allExempt) {
        exempt.add(uf);
        changed = true;
      }
    }
  }

  return exempt;
}

const adapterExemptions = computeAdapterExemptions();

/** @param {string} filePath @returns {boolean} */
function isApiExempt(filePath) {
  if (adapterExemptions.has(filePath)) return true;
  const bn = path.basename(filePath);
  if (bn.endsWith('.type.mjs')) return true;
  const rel = path.relative(API, filePath);
  return rel === 'index.mjs' || rel === 'error.mjs' || rel === 'logger.mjs';
}

const apiScopedFiles = walkScopedMjs(API).filter(f => !isApiExempt(f));

/** @type {Map<string, Set<string>>} known gaps recorded in AST-042;
 *  remove an entry when the file is fixed; do not add entries */
const INV21_KNOWN_GAPS = new Map([
  ['component/detail/showcase/showcase.mjs', new Set(['fs'])],
  ['component/detail/source/source.mjs', new Set(['fs'])],
  ['component/list/list.mjs', new Set(['discovery'])],
  ['docs/detail/section/section.mjs', new Set(['discovery'])],
  ['doctor/doctor.mjs', new Set(['fs', 'project', 'discovery'])],
  ['gap-report/gap-report.mjs', new Set(['child_process', 'discovery', 'project'])],
  ['hook/list/list.mjs', new Set(['discovery'])],
  ['init/run/run.mjs', new Set(['fs'])],
  ['integration/add-contribution.mjs', new Set(['discovery', 'fs'])],
  ['integration/add-helpers.mjs', new Set(['fs'])],
  ['integration/add-theme.mjs', new Set(['fs', 'discovery'])],
  ['integration/authoring-checks.mjs', new Set(['discovery'])],
  ['integration/pack-check.mjs', new Set(['fs', 'child_process', 'discovery'])],
  ['integration/validate-integration.mjs', new Set(['fs'])],
  // remove with the layout command
  ['layout/expand/expand.mjs', new Set(['fs'])],
  ['search/search.mjs', new Set(['discovery'])],
  // imported by a leaf (copy), not only by the adapter
  ['swizzle/_github.mjs', new Set(['child_process'])],
  ['swizzle/copy/copy.mjs', new Set(['fs', 'project', 'discovery'])],
  ['template/cdn/cdn.mjs', new Set(['fs'])],
  ['template/copy/copy.mjs', new Set(['fs', 'discovery'])],
  ['template/list/list.mjs', new Set(['discovery'])],
  ['template/show/show.mjs', new Set(['fs', 'discovery'])],
  ['template/skeleton/skeleton.mjs', new Set(['fs', 'discovery'])],
  ['template/template.mjs', new Set(['discovery'])],
  ['theme/add/add.mjs', new Set(['fs'])],
  ['theme/build/build.mjs', new Set(['fs', 'discovery'])],
  ['theme/palette/generate/generate.mjs', new Set(['fs'])],
  ['theme/targets/targets.mjs', new Set(['discovery'])],
  ['theme/template/template.mjs', new Set(['fs'])],
  ['upgrade/registry/registry.mjs', new Set(['fs'])],
]);
const inv21Count = checkEnvironmentImports(
  'INV21', apiScopedFiles, API, INV21_KNOWN_GAPS,
);

// ── 3b. INV23: text-layout patterns ─────────────────────────────────
//
// Handlers must use the formatter kit (section, text, list, record,
// records, code) rather than .padEnd(), .padStart(), .repeat(), or
// new Block() to build text columns.

/** @type {{re: RegExp, kind: string}[]} */
const TEXT_LAYOUT_PATTERNS = [
  {re: /\.padEnd\s*\(/g, kind: 'padEnd'},
  {re: /\.padStart\s*\(/g, kind: 'padStart'},
  {re: /\.repeat\s*\(/g, kind: 'repeat'},
  {re: /new\s+Block\s*\(/g, kind: 'new Block'},
];

/** @type {Map<string, Set<string>>} known gaps recorded in AST-042;
 *  remove an entry when the file is fixed; do not add entries */
const INV23_KNOWN_GAPS = new Map([
  ['build-theme.mjs', new Set(['padEnd'])],
  ['docs.mjs', new Set(['padEnd', 'repeat'])],
]);

let inv23Count = 0;
for (const filePath of handlerFiles) {
  inv23Count++;
  const rel = path.relative(HANDLER_DIR, filePath);
  const src = fs.readFileSync(filePath, 'utf8');
  /** @type {Set<string>} */
  const found = new Set();
  for (const {re, kind} of TEXT_LAYOUT_PATTERNS) {
    re.lastIndex = 0;
    if (re.test(src)) found.add(kind);
  }

  const allowed = INV23_KNOWN_GAPS.get(rel);
  if (allowed) {
    for (const kind of found) {
      if (!allowed.has(kind)) {
        errors.push(
          `INV23: ${rel} has a new text-layout call (${kind}) not in the known-gap allowlist`,
        );
      }
    }
    for (const kind of allowed) {
      if (!found.has(kind)) {
        errors.push(
          `INV23: ${rel} no longer uses ${kind} — remove it from the INV23 allowlist so the list can only shrink`,
        );
      }
    }
  } else if (found.size > 0) {
    errors.push(
      `INV23: ${rel} uses ${[...found].join(', ')} — use the formatter kit: section(), text(), list(), record(), records(), code()`,
    );
  }
}

// ── 4. FR1: CommandDoc fn → api/index.mjs export ────────────────────
//
// Every executable command's CommandDoc names in `fn` the API function it
// calls. That function must be exported from api/index.mjs, the public
// programmatic surface.

const apiIndexSrc = fs.readFileSync(path.join(API, 'index.mjs'), 'utf8');

/** Extract named function exports from api/index.mjs (skip type re-exports). */
const apiExports = new Set();
for (const m of apiIndexSrc.matchAll(/export\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)) {
  if (m[2].endsWith('.type.mjs')) continue;
  for (const part of m[1].split(',')) {
    const trimmed = part.trim();
    // 'x as y' → exported name is y; 'x' → x
    const segments = trimmed.split(/\s+/);
    const name = segments[segments.length - 1];
    if (name && /^\w+$/.test(name)) apiExports.add(name);
  }
}

/** @type {Set<string>} known FR1 gaps: fn values not yet exported.
 *  Remove an entry when the function is exported; do not add entries. */
const FR1_KNOWN_GAPS = new Set(['themeTemplate']);

let fr1Count = 0;

/** Walk CommandDoc files and check fn values.
 *  @param {string} dir */
function checkCommandDocFn(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkCommandDocFn(full);
      continue;
    }
    if (!entry.name.endsWith('.doc.mjs')) continue;
    const src = fs.readFileSync(full, 'utf8');
    const fnMatch = src.match(/fn:\s*['"](\w+)['"]/);
    if (!fnMatch) continue; // group-only CommandDoc (no fn field)
    fr1Count++;
    const fn = fnMatch[1];
    if (!apiExports.has(fn) && !FR1_KNOWN_GAPS.has(fn)) {
      errors.push(
        `FR1: CommandDoc ${path.relative(CLI, full)} names fn '${fn}' which is not exported from api/index.mjs`,
      );
    }
  }
}
checkCommandDocFn(path.join(CLI, 'clients/cli/commands'));

// Stale FR1 entries
for (const fn of FR1_KNOWN_GAPS) {
  if (apiExports.has(fn)) {
    errors.push(
      `FR1: '${fn}' is now exported from api/index.mjs — remove it from FR1_KNOWN_GAPS so the list can only shrink`,
    );
  }
}

// ── 5. FR2: api/index.mjs export → FunctionDoc ─────────────────────
//
// Every function exported from the public API must have a FunctionDoc
// under api/ whose `name` field matches.

const FR2_EXEMPT = new Set(['AstryxError', 'logger']);

/** Collect `name` values from all FunctionDoc files under api/. */
const docNames = new Set();
/** @param {string} dir */
function collectDocNames(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectDocNames(full);
      continue;
    }
    if (!entry.name.endsWith('.doc.mjs')) continue;
    const src = fs.readFileSync(full, 'utf8');
    const nameMatch = src.match(/name:\s*['"](\w+)['"]/);
    if (nameMatch) docNames.add(nameMatch[1]);
  }
}
collectDocNames(API);

let fr2Count = 0;
for (const name of apiExports) {
  if (FR2_EXEMPT.has(name)) continue;
  fr2Count++;
  if (!docNames.has(name)) {
    errors.push(
      `FR2: api/index.mjs exports '${name}' but no FunctionDoc under api/ has name: '${name}'`,
    );
  }
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
  [
    `✅ CLI structure is intact:`,
    `   ${doctypeCount} doc-type(s), ${apiCount} api folder(s),`,
    `   ${inv22Count} handler(s) checked for INV22, ${inv21Count} api module(s) for INV21,`,
    `   ${inv23Count} handler(s) checked for INV23,`,
    `   ${fr1Count} CommandDoc fn(s) checked for FR1, ${fr2Count} api export(s) for FR2.`,
  ].join('\n'),
);
