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
 * 3. Every CLI command and CommandDoc sits where cli-surface INV6 puts it:
 *      clients/cli/commands/<name>.mjs   (or <name>/index.mjs for a group)
 *      clients/cli/commands/<name>.doc.mjs
 *      clients/cli/commands/<parent>-<child>.doc.mjs   for each subcommand
 *    Top-level commands come from clients/cli/index.mjs (its `commands`
 *    registry and any literal `.command()` call there); subcommands come from
 *    each CommandDoc's `subcommands`. The docs drift harness holds those docs
 *    equal to the live CLI (args, options, subcommands); this check owns where
 *    the files are.
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

/**
 * Every `*.doc.mjs` under `dir`, group folders included, as `/`-separated paths
 * relative to `dir`, sorted.
 * @param {string} dir
 * @returns {string[]}
 */
function docFilesUnder(dir) {
  /** @type {string[]} */
  const out = [];
  const entries = fs
    .readdirSync(dir, {withFileTypes: true})
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (entry.isDirectory()) {
      for (const file of docFilesUnder(path.join(dir, entry.name))) {
        out.push(`${entry.name}/${file}`);
      }
    } else if (entry.name.endsWith('.doc.mjs')) {
      out.push(entry.name);
    }
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

// ── 3. command files and CommandDocs ────────────────────────────────────
/**
 * Layout gaps that predate this section. Each entry is the exact violation it
 * forgives, so moving the command to its INV6 path makes the entry stale and
 * fails the check until the entry is deleted. Do not add entries.
 */
export const KNOWN_LAYOUT_GAPS = new Set([
  'command "manifest" is registered in clients/cli/index.mjs, not in its own clients/cli/commands/manifest.mjs',
  'command "postinstall" is registered in clients/cli/index.mjs, not in its own clients/cli/commands/postinstall.mjs',
  'command "postinstall" has no CommandDoc at clients/cli/commands/postinstall.doc.mjs',
  'command "theme" is registered from clients/cli/commands/build-theme.mjs, not clients/cli/commands/theme.mjs or clients/cli/commands/theme/index.mjs',
]);

/**
 * Check INV6 (docs/architecture/cli-surface.md) for the CLI rooted at
 * `cliRoot`: every registered command's file and CommandDoc, every
 * subcommand's CommandDoc, and no CommandDoc anywhere else.
 *
 * @param {string} cliRoot the `packages/cli` directory
 * @returns {Promise<{errors: string[], commands: number}>}
 */
export async function checkCommandLayout(cliRoot) {
  const {default: ts} = await import('typescript');
  const {pathToFileURL} = await import('node:url');
  const COMMANDS = 'clients/cli/commands';
  const INDEX = 'clients/cli/index.mjs';
  /** @type {string[]} */
  const errors = [];

  const indexFile = path.join(cliRoot, INDEX);
  const source = ts.createSourceFile(
    indexFile,
    fs.readFileSync(indexFile, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  /** @type {{name: string, file: string | null}[]} */
  const registered = [];
  let registryFound = false;
  /** @param {import('typescript').Node} node */
  const visit = node => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'commands' &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      registryFound = true;
      for (const entry of node.initializer.elements) {
        if (!ts.isObjectLiteralExpression(entry)) continue;
        /** @param {string} key */
        const field = key => {
          const prop = entry.properties.find(
            p => ts.isPropertyAssignment(p) && p.name.getText(source) === key,
          );
          return prop &&
            ts.isPropertyAssignment(prop) &&
            ts.isStringLiteralLike(prop.initializer)
            ? prop.initializer.text
            : null;
        };
        const name = field('name');
        const file = field('path');
        if (name && file) registered.push({name, file});
      }
    }
    // A command registered by hand, e.g. `program.command('manifest')`.
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'command' &&
      node.arguments.length > 0 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      registered.push({name: node.arguments[0].text.split(' ')[0], file: null});
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (!registryFound) {
    errors.push(
      `found no \`commands\` registry in ${INDEX} — has it moved? Update this check.`,
    );
  }

  /** @type {Set<string>} */
  const expectedDocs = new Set();
  let commands = 0;
  /** @param {string} name */
  const checkDoc = async name => {
    const docPath = `${COMMANDS}/${name.replaceAll(' ', '-')}.doc.mjs`;
    expectedDocs.add(docPath);
    const docFile = path.join(cliRoot, docPath);
    if (!fs.existsSync(docFile)) {
      errors.push(`command "${name}" has no CommandDoc at ${docPath}`);
      return;
    }
    const mod = await import(pathToFileURL(docFile).href);
    const doc = mod.doc ?? mod.docs ?? mod.default;
    if (doc?.name !== name) {
      errors.push(`${docPath} documents "${doc?.name}", not "${name}"`);
      return;
    }
    commands++;
    for (const child of doc.subcommands ?? [])
      await checkDoc(`${name} ${child}`);
  };

  for (const {name, file} of registered) {
    const flat = `${COMMANDS}/${name}.mjs`;
    const group = `${COMMANDS}/${name}/index.mjs`;
    if (file === null) {
      errors.push(
        `command "${name}" is registered in ${INDEX}, not in its own ${flat}`,
      );
    } else {
      const actual = path.posix.join('clients/cli', file);
      if (actual !== flat && actual !== group) {
        errors.push(
          `command "${name}" is registered from ${actual}, not ${flat} or ${group}`,
        );
      } else if (!fs.existsSync(path.join(cliRoot, actual))) {
        errors.push(
          `command "${name}" is registered from ${actual}, which does not exist`,
        );
      }
    }
    await checkDoc(name);
  }

  for (const file of docFilesUnder(path.join(cliRoot, COMMANDS))) {
    const docPath = `${COMMANDS}/${file}`;
    if (!expectedDocs.has(docPath)) {
      errors.push(`${docPath} is not the CommandDoc of any registered command`);
    }
  }

  return {errors, commands};
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

// Run as a script; stay importable for the tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const layout = await checkCommandLayout(CLI);
  for (const e of layout.errors) {
    if (!KNOWN_LAYOUT_GAPS.has(e)) errors.push(e);
  }
  for (const gap of KNOWN_LAYOUT_GAPS) {
    if (!layout.errors.includes(gap)) {
      errors.push(
        `known layout gap no longer occurs; delete it from KNOWN_LAYOUT_GAPS: ${gap}`,
      );
    }
  }
  if (layout.commands === 0) {
    errors.push(
      'found no CommandDocs under packages/cli/clients/cli/commands — has the directory moved? Update this check.',
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
    `✅ ${doctypeCount} doc-type(s) + ${apiCount} api folder(s) + ${layout.commands} command(s) checked — CLI structure is intact.`,
  );
}
