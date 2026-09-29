// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for scripts/check-template-deps.mjs — the template dependency
 * policy gate (#6717). Fixture templates assert the gate rejects escape-hatch
 * dependencies and accepts clean ones; the real dashboard-scorecard template
 * asserts the fixed template passes.
 */

import {describe, expect, it, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  auditTemplate,
  importedPackages,
  packageRoot,
  stripComments,
} from './check-template-deps.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Throwaway template dirs, cleaned up after each test. */
const tmpDirs = [];
function mkTemplate({doc, files}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-tpl-deps-'));
  tmpDirs.push(dir);
  fs.writeFileSync(
    path.join(dir, 'template.doc.mjs'),
    `export const doc = ${JSON.stringify(doc)};\n`,
  );
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), {recursive: true});
    fs.writeFileSync(abs, content);
  }
  return dir;
}
afterEach(() => {
  while (tmpDirs.length) {
    fs.rmSync(tmpDirs.pop(), {recursive: true, force: true});
  }
});

/** Minimal stable-package map for fixtures. */
const STABLE = new Map([
  ['@astryxdesign/core', {canaryOnly: false}],
  ['@astryxdesign/charts', {canaryOnly: true}],
]);

const PAGE = imports =>
  `import {useState} from 'react';\n${imports}\nexport default function Page() { return null; }\n`;

describe('packageRoot', () => {
  it('strips subpaths, keeping scopes', () => {
    expect(packageRoot('@astryxdesign/core/Layout')).toBe('@astryxdesign/core');
    expect(packageRoot('@heroicons/react/24/outline')).toBe('@heroicons/react');
    expect(packageRoot('recharts')).toBe('recharts');
  });
});

describe('stripComments', () => {
  it('removes doc code samples that look like imports', () => {
    const src = 'const README = `npm install x\\nconst {C} = await import(\'x\');\\n`;\n';
    expect(stripComments(src)).not.toContain("import('x')");
  });
});

describe('importedPackages', () => {
  it('collects bare imports and ignores relative and node: specifiers', () => {
    const dir = mkTemplate({
      doc: {type: 'page', name: 't'},
      files: {
        'page.tsx': PAGE(
          `import {Card} from '@astryxdesign/core/Card';\nimport {x} from './local';\nimport fs from 'node:fs';\n`,
        ),
      },
    });
    expect(importedPackages(dir).sort()).toEqual([
      '@astryxdesign/core',
      'react',
    ]);
  });
});

describe('auditTemplate', () => {
  it('passes a clean template with matching declaration', async () => {
    const dir = mkTemplate({
      doc: {
        type: 'page',
        name: 't',
        dependencies: ['react', '@astryxdesign/core'],
      },
      files: {
        'page.tsx': PAGE(`import {Card} from '@astryxdesign/core/Card';\n`),
      },
    });
    const {problems, warnings} = await auditTemplate(dir, 'pages/t', {
      stable: STABLE,
    });
    expect(problems).toEqual([]);
    expect(warnings).toEqual([]);
  });

  it('rejects a third-party escape-hatch dependency', async () => {
    const dir = mkTemplate({
      doc: {type: 'page', name: 't', dependencies: ['react', 'recharts']},
      files: {
        'page.tsx': PAGE(`import {AreaChart} from 'recharts';\n`),
      },
    });
    const {problems} = await auditTemplate(dir, 'pages/t', {stable: STABLE});
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.join('\n')).toMatch(/recharts/);
  });

  it('rejects a canary-only @astryxdesign/* dependency', async () => {
    const dir = mkTemplate({
      doc: {
        type: 'page',
        name: 't',
        dependencies: ['react', '@astryxdesign/charts'],
      },
      files: {
        'page.tsx': PAGE(`import {Chart} from '@astryxdesign/charts';\n`),
      },
    });
    const {problems} = await auditTemplate(dir, 'pages/t', {stable: STABLE});
    expect(problems.join('\n')).toMatch(/canary-only/);
  });

  it('flags imports missing from the declaration', async () => {
    const dir = mkTemplate({
      doc: {type: 'page', name: 't', dependencies: ['react']},
      files: {'page.tsx': PAGE(`import {scale} from 'd3-scale';\n`)},
    });
    const {problems} = await auditTemplate(dir, 'pages/t', {stable: STABLE});
    expect(problems.join('\n')).toMatch(/imports 'd3-scale' but does not declare it/);
  });

  it('flags stale declarations', async () => {
    const dir = mkTemplate({
      doc: {type: 'page', name: 't', dependencies: ['react', 'lodash']},
      files: {'page.tsx': PAGE('')},
    });
    const {problems} = await auditTemplate(dir, 'pages/t', {stable: STABLE});
    expect(problems.join('\n')).toMatch(/declares 'lodash' but never imports it/);
  });

  it('warns (not fails) when a template has no declaration yet', async () => {
    const dir = mkTemplate({
      doc: {type: 'page', name: 't'},
      files: {
        'page.tsx': PAGE(`import {Card} from '@astryxdesign/core/Card';\n`),
      },
    });
    const {problems, warnings} = await auditTemplate(dir, 'pages/t', {
      stable: STABLE,
    });
    expect(problems).toEqual([]);
    expect(warnings.join('\n')).toMatch(/does not declare `dependencies`/);
  });

  it('dashboard-scorecard passes: no recharts, declaration matches imports', async () => {
    const dir = path.join(
      REPO,
      'packages/cli/assets/templates/pages/dashboard-scorecard',
    );
    const {problems, warnings} = await auditTemplate(
      dir,
      'pages/dashboard-scorecard',
    );
    expect(problems).toEqual([]);
    expect(warnings).toEqual([]);
  });
});
