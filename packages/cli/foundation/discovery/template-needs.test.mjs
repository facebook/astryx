// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for template-needs analysis: external package detection, StyleX
 * compiler warning, and install command generation.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  extractImportedPackages,
  analyzeTemplateNeeds,
} from './template-needs.mjs';

// ── extractImportedPackages ─────────────────────────────────────────────────

describe('extractImportedPackages', () => {
  it('extracts bare package names from static imports', () => {
    const source = `
      import {Button} from '@astryxdesign/core';
      import {ArrowIcon} from '@heroicons/react/24/outline';
      import * as stylex from '@stylexjs/stylex';
      import {useState} from 'react';
      import recharts from 'recharts';
    `;
    const pkgs = extractImportedPackages(source);
    expect(pkgs).toEqual(
      new Set([
        '@astryxdesign/core',
        '@heroicons/react',
        '@stylexjs/stylex',
        'react',
        'recharts',
      ]),
    );
  });

  it('ignores relative and absolute imports', () => {
    const source = `
      import {foo} from './bar';
      import {baz} from '../qux';
      import {thing} from '/absolute/path';
    `;
    expect(extractImportedPackages(source).size).toBe(0);
  });

  it('handles type imports', () => {
    const source = `import type {Props} from 'some-package';`;
    expect(extractImportedPackages(source)).toEqual(new Set(['some-package']));
  });

  it('deduplicates multiple imports from the same package', () => {
    const source = `
      import {A} from '@heroicons/react/24/outline';
      import {B} from '@heroicons/react/24/solid';
    `;
    expect(extractImportedPackages(source)).toEqual(
      new Set(['@heroicons/react']),
    );
  });
});

// ── analyzeTemplateNeeds ────────────────────────────────────────────────────

describe('analyzeTemplateNeeds', () => {
  let dir;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tmpl-needs-'));
  });
  afterEach(() => fs.rmSync(dir, {recursive: true, force: true}));

  it('reports missing external packages with an install command', () => {
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({dependencies: {'react': '^19.0.0', '@astryxdesign/core': '^0.6.0'}}),
    );
    const source = `
      import {Button} from '@astryxdesign/core';
      import {ArrowIcon} from '@heroicons/react/24/outline';
      import {useState} from 'react';
    `;
    const result = analyzeTemplateNeeds(source, dir);
    expect(result.missingPackages).toEqual(['@heroicons/react']);
    expect(result.installCommand).toMatch(/npm install @heroicons\/react/);
    expect(result.notes.length).toBeGreaterThanOrEqual(1);
    expect(result.notes[0]).toMatch(/Install missing dependencies/);
  });

  it('reports nothing when all packages are installed', () => {
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({
        dependencies: {
          'react': '^19.0.0',
          '@astryxdesign/core': '^0.6.0',
          '@heroicons/react': '^2.2.0',
        },
      }),
    );
    const source = `
      import {Button} from '@astryxdesign/core';
      import {ArrowIcon} from '@heroicons/react/24/outline';
    `;
    const result = analyzeTemplateNeeds(source, dir);
    expect(result.missingPackages).toEqual([]);
    expect(result.installCommand).toBeNull();
    expect(result.notes).toEqual([]);
  });

  it('warns about StyleX compiler when template uses it and project lacks one', () => {
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({dependencies: {'@stylexjs/stylex': '^0.10.0'}}),
    );
    const source = `import * as stylex from '@stylexjs/stylex';`;
    const result = analyzeTemplateNeeds(source, dir);
    expect(result.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining('StyleX'),
        expect.stringContaining('styling-overview'),
      ]),
    );
  });

  it('does NOT warn about StyleX when the project has a compiler', () => {
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({
        devDependencies: {
          '@stylexjs/stylex': '^0.10.0',
          '@stylexjs/rollup-plugin': '^0.10.0',
        },
      }),
    );
    const source = `import * as stylex from '@stylexjs/stylex';`;
    const result = analyzeTemplateNeeds(source, dir);
    const stylexNotes = result.notes.filter(n => n.includes('StyleX'));
    expect(stylexNotes).toEqual([]);
  });

  it('detects pnpm from lockfile', () => {
    fs.writeFileSync(path.join(dir, 'package.json'), '{}');
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    const source = `import {Chart} from 'recharts';`;
    const result = analyzeTemplateNeeds(source, dir);
    expect(result.installCommand).toMatch(/^pnpm add /);
  });

  it('detects yarn from lockfile', () => {
    fs.writeFileSync(path.join(dir, 'package.json'), '{}');
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    const source = `import {Chart} from 'recharts';`;
    const result = analyzeTemplateNeeds(source, dir);
    expect(result.installCommand).toMatch(/^yarn add /);
  });

  it('excludes @stylexjs/stylex from missing packages (it is a Core peer)', () => {
    fs.writeFileSync(path.join(dir, 'package.json'), '{}');
    const source = `import * as stylex from '@stylexjs/stylex';`;
    const result = analyzeTemplateNeeds(source, dir);
    expect(result.missingPackages).not.toContain('@stylexjs/stylex');
  });

  it('handles a template with no external imports', () => {
    fs.writeFileSync(path.join(dir, 'package.json'), '{}');
    const source = `
      import {useState} from 'react';
      import {Button} from '@astryxdesign/core';
    `;
    const result = analyzeTemplateNeeds(source, dir);
    expect(result.notes).toEqual([]);
    expect(result.missingPackages).toEqual([]);
  });
});
