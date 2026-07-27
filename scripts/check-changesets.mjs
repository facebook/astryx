#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * CI gate for XDS changesets — `node scripts/check-changesets.mjs`.
 *
 * Enforces the conventions the release process depends on:
 *   1. 0.x semver coupling: while every publishable package is < 1.0.0, the
 *      bump must match the category. A [breaking] changeset must be `minor`
 *      (0.x.y -> 0.(x+1).0, the breaking tier under caret ranges); every other
 *      category must be `patch`. `major` is rejected (it would jump to 1.0.0).
 *   2. Every changeset body must carry a recognized [category] tag.
 *   3. Every changeset body must credit at least one @contributor.
 *   4. Frontmatter packages must be real, publishable, non-ignored packages.
 *
 * Exits 1 with a readable report on any violation. config.json and README.md
 * are skipped.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {expandWorkspaceDirs} from './lib/workspace-globs.mjs';

const require = createRequire(import.meta.url);
const {parseEntry} = require('./changeset-entry-format.cjs');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CS_DIR = path.join(ROOT, '.changeset');

function readConfig() {
  return JSON.parse(fs.readFileSync(path.join(CS_DIR, 'config.json'), 'utf8'));
}

function discoverPackages() {
  const pkgs = [];
  for (const dir of expandWorkspaceDirs(ROOT)) {
    const pj = path.join(dir, 'package.json');
    if (!fs.existsSync(pj)) continue;
    const p = JSON.parse(fs.readFileSync(pj, 'utf8'));
    if (p.name)
      pkgs.push({name: p.name, private: !!p.private, version: p.version});
  }
  return pkgs;
}

function parseFrontmatter(contents) {
  const m = /^\s*---([^]*?)\n\s*---(\s*(?:\n|$)[^]*)/.exec(contents);
  if (!m) return null;
  const releases = {};
  for (const line of m[1].split('\n')) {
    const mm = /^\s*['"]?([^'":]+)['"]?\s*:\s*(\w+)\s*$/.exec(line);
    if (mm) releases[mm[1].trim()] = mm[2].trim();
  }
  return {releases, summary: m[2].trim()};
}

const SKIP = new Set(['config.json', 'README.md']);
function isChangesetFile(name) {
  return name.endsWith('.md') && !SKIP.has(name);
}

/**
 * Validate one changeset's contents against the conventions. Pure and
 * side-effect-free so it can be unit-tested without the filesystem.
 *
 * @param {string} file       display name (for messages)
 * @param {string} contents   raw changeset markdown
 * @param {object} ctx        {pre1, pubNames:Set, allNames:Set}
 * @returns {string[]}        list of human-readable problems (empty = valid)
 */
function validateChangeset(file, contents, ctx) {
  const {pre1, pubNames, allNames} = ctx;
  const problems = [];

  const fm = parseFrontmatter(contents);
  if (!fm) {
    problems.push(`${file}: missing or invalid frontmatter`);
    return problems;
  }
  if (Object.keys(fm.releases).length === 0)
    problems.push(`${file}: frontmatter lists no packages`);

  // Parse the body first: while 0.x the required bump is derived from the
  // [category] — [breaking] -> minor, everything else -> patch.
  const parsed = parseEntry(fm.summary);
  const expected = parsed.category === 'breaking' ? 'minor' : 'patch';

  for (const [name, type] of Object.entries(fm.releases)) {
    if (!allNames.has(name)) {
      problems.push(`${file}: unknown package "${name}"`);
    } else if (!pubNames.has(name)) {
      problems.push(
        `${file}: "${name}" is private/ignored and cannot be released`,
      );
    }
    if (!['major', 'minor', 'patch', 'none'].includes(type)) {
      problems.push(`${file}: "${name}" has invalid bump "${type}"`);
    } else if (pre1 && type === 'major') {
      problems.push(
        `${file}: "${name}" declares "major" — repo is 0.x, which has no major ` +
          `bump (it would jump to 1.0.0). Use [breaking] (minor) instead.`,
      );
    } else if (
      pre1 &&
      parsed.category &&
      type !== 'none' &&
      type !== expected
    ) {
      // Coupling: while 0.x, the bump must match the category both ways.
      problems.push(
        expected === 'minor'
          ? `${file}: "${name}" is a [breaking] change but declares "${type}" — ` +
              `breaking changes bump the minor while 0.x (0.x.y -> 0.(x+1).0). Use "minor".`
          : `${file}: "${name}" declares "minor" but the category is [${parsed.category}] — ` +
              `only [breaking] changes bump the minor while 0.x. Use "patch", ` +
              `or change the category to [breaking] if this is a breaking change.`,
      );
    }
  }

  if (!parsed.category) {
    problems.push(
      `${file}: body must start with a [category] tag, e.g. "[fix] ...". ` +
        `Run \`pnpm changeset:new\` to author one correctly.`,
    );
  }
  if (!parsed.headline) problems.push(`${file}: body has no summary headline`);
  if (parsed.contributors.length === 0) {
    problems.push(
      `${file}: body must credit at least one contributor, e.g. "@yourhandle" ` +
        `on its own line. Run \`pnpm changeset:new\`.`,
    );
  }
  return problems;
}

function main() {
  const config = readConfig();
  const pkgs = discoverPackages();
  const pub = pkgs.filter(
    p => !p.private && !(config.ignore || []).includes(p.name),
  );
  const ctx = {
    pubNames: new Set(pub.map(p => p.name)),
    allNames: new Set(pkgs.map(p => p.name)),
    pre1: pub.every(p => /^0\./.test(String(p.version || '0'))),
  };

  const files = fs.readdirSync(CS_DIR).filter(isChangesetFile);
  const problems = [];
  for (const f of files) {
    const contents = fs.readFileSync(path.join(CS_DIR, f), 'utf8');
    problems.push(...validateChangeset(f, contents, ctx));
  }

  if (problems.length) {
    console.error(
      `\n✗ check:changesets found ${problems.length} problem(s):\n`,
    );
    for (const p of problems) console.error('  - ' + p);
    console.error('\nSee the Release-Process wiki and `pnpm changeset:new`.\n');
    process.exit(1);
  }
  console.log(
    `✓ check:changesets — ${files.length} changeset(s) valid${ctx.pre1 ? ' (0.x: [breaking] -> minor, else patch)' : ''}`,
  );
}

// Run as a script, but stay importable for unit tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export {validateChangeset, parseFrontmatter};
