#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * CI gate for XDS changesets — `node scripts/check-changesets.mjs`.
 *
 * Enforces the conventions the release process depends on:
 *   1. Pre-1.0 patch-only: while every publishable package is < 1.0.0, no
 *      changeset may declare a `minor` or `major` bump (would jump 0.0.x ->
 *      0.1.0 / 1.0.0).
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

const require = createRequire(import.meta.url);
const {parseEntry} = require('./changeset-entry-format.cjs');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CS_DIR = path.join(ROOT, '.changeset');

function readConfig() {
  return JSON.parse(fs.readFileSync(path.join(CS_DIR, 'config.json'), 'utf8'));
}

function discoverPackages() {
  const ws = fs.readFileSync(path.join(ROOT, 'pnpm-workspace.yaml'), 'utf8');
  const globs = [...ws.matchAll(/^\s*-\s*["']?([^"'\n]+)["']?/gm)].map(m =>
    m[1].trim(),
  );
  const pkgs = [];
  for (const g of globs) {
    const base = g.replace(/\/\*+$/, '');
    const abs = path.join(ROOT, base);
    if (!fs.existsSync(abs)) continue;
    const dirs = g.endsWith('*')
      ? fs
          .readdirSync(abs, {withFileTypes: true})
          .filter(d => d.isDirectory())
          .map(d => path.join(abs, d.name))
      : [abs];
    for (const dir of dirs) {
      const pj = path.join(dir, 'package.json');
      if (!fs.existsSync(pj)) continue;
      const p = JSON.parse(fs.readFileSync(pj, 'utf8'));
      if (p.name)
        pkgs.push({name: p.name, private: !!p.private, version: p.version});
    }
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

function main() {
  const config = readConfig();
  const pkgs = discoverPackages();
  const pub = pkgs.filter(
    p => !p.private && !(config.ignore || []).includes(p.name),
  );
  const pubNames = new Set(pub.map(p => p.name));
  const allNames = new Set(pkgs.map(p => p.name));
  const pre1 = pub.every(p => /^0\./.test(String(p.version || '0')));

  const files = fs.readdirSync(CS_DIR).filter(isChangesetFile);
  const problems = [];

  for (const f of files) {
    const contents = fs.readFileSync(path.join(CS_DIR, f), 'utf8');
    const fm = parseFrontmatter(contents);
    if (!fm) {
      problems.push(`${f}: missing or invalid frontmatter`);
      continue;
    }
    const names = Object.keys(fm.releases);
    if (names.length === 0)
      problems.push(`${f}: frontmatter lists no packages`);
    for (const [name, type] of Object.entries(fm.releases)) {
      if (!allNames.has(name)) {
        problems.push(`${f}: unknown package "${name}"`);
      } else if (!pubNames.has(name)) {
        problems.push(
          `${f}: "${name}" is private/ignored and cannot be released`,
        );
      }
      if (pre1 && (type === 'minor' || type === 'major')) {
        problems.push(
          `${f}: "${name}" declares "${type}" — repo is pre-1.0, use "patch" ` +
            `(minor/major would jump 0.0.x). Use [breaking] in the body to signal a breaking change.`,
        );
      }
      if (!['major', 'minor', 'patch', 'none'].includes(type)) {
        problems.push(`${f}: "${name}" has invalid bump "${type}"`);
      }
    }

    const parsed = parseEntry(fm.summary);
    if (!parsed.category) {
      problems.push(
        `${f}: body must start with a [category] tag, e.g. "[fix] ...". ` +
          `Run \`pnpm changeset:new\` to author one correctly.`,
      );
    }
    if (!parsed.headline) problems.push(`${f}: body has no summary headline`);
    if (parsed.contributors.length === 0) {
      problems.push(
        `${f}: body must credit at least one contributor, e.g. "@yourhandle" ` +
          `on its own line. Run \`pnpm changeset:new\`.`,
      );
    }
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
    `✓ check:changesets — ${files.length} changeset(s) valid${pre1 ? ' (pre-1.0 patch-only enforced)' : ''}`,
  );
}

main();
