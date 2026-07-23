// Copyright (c) Meta Platforms, Inc. and affiliates.

// @file Regression guard for the repo-wide component-doc type-check.
//
// Context: the docsite/Vercel build broke because a lab component's .doc.mjs
// used an invalid PropDoc key ("defaultValue") that no CI check caught -- lab
// docs were never type-checked (only @astryxdesign/core had a typecheck:docs
// gate). tsconfig.docs.json now globs EVERY package's component docs
// ("packages/*/src/**/*.doc.mjs") so a new package is covered automatically.
//
// This test fails if that auto-discovery glob is ever narrowed/removed, or if a
// component .doc.mjs lands outside the covered "packages/<pkg>/src/" pattern
// (where it would silently escape the type-check again).
//
// NOTE: header intentionally uses line comments -- a block comment can't
// contain the glob "**/*.doc.mjs" because the embedded "*/" would close it.

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const tsconfig = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'tsconfig.docs.json'), 'utf8'),
);
const include = tsconfig.include ?? [];

const toPosix = p => p.split(path.sep).join('/');

describe('repo-wide component-doc type-check coverage', () => {
  it('auto-discovers docs across all packages via a wildcard glob (not a hand-list)', () => {
    // The whole point of the hardening: a single wildcard so a new
    // packages/<pkg>/src/**/*.doc.mjs is type-checked without touching config.
    expect(include).toContain('packages/*/src/**/*.doc.mjs');
    // Root-level package docs (e.g. core/groups.doc.mjs = GroupDoc) too.
    expect(include).toContain('packages/*/*.doc.mjs');
    expect(include).toContain('packages/core/src/docs-types.ts');
  });

  it('finds the existing component docs (core + lab) under the covered pattern', () => {
    const docs = fs.globSync('packages/*/src/**/*.doc.mjs', {cwd: REPO_ROOT});
    // Sanity: core + lab together have well over 100 component docs.
    expect(docs.length).toBeGreaterThan(100);
  });

  it('has no component .doc.mjs OUTSIDE the type-checked src/ globs', () => {
    const all = fs
      .globSync('packages/**/*.doc.mjs', {cwd: REPO_ROOT})
      .map(toPosix)
      .filter(p => !p.includes('/node_modules/') && !p.includes('/dist/'));

    // CLI page/block templates and long-form doc topics are a *different* doc
    // type (not ComponentDoc) and are validated elsewhere -- exclude them.
    const isTemplateOrTopicDoc = p =>
      p.includes('/templates/') || /^packages\/[^/]+\/docs\//.test(p);

    const componentDocs = all.filter(p => !isTemplateOrTopicDoc(p));
    // Covered by tsconfig.docs.json: anything under a package's src/, plus
    // root-level package docs (packages/<pkg>/<name>.doc.mjs).
    const isCovered = p =>
      /^packages\/[^/]+\/src\/.*\.doc\.mjs$/.test(p) ||
      /^packages\/[^/]+\/[^/]+\.doc\.mjs$/.test(p);
    const uncovered = componentDocs.filter(p => !isCovered(p));

    expect(uncovered).toEqual([]);
  });
});
