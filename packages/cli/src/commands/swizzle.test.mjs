// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {execFileSync} from 'node:child_process';
import {rewriteImports, createImportRewriter} from './swizzle.mjs';

describe('rewriteImports (legacy naive rewriter)', () => {
  it('rewrites ../theme/tokens to @xds/core/theme', () => {
    const input = `import { tokens } from '../theme/tokens.stylex';`;
    const result = rewriteImports(input);
    expect(result).toBe(`import { tokens } from '@xds/core/theme';`);
  });

  it('rewrites ../utils/mergeProps to @xds/core/utils', () => {
    const input = `import { mergeProps } from '../utils/mergeProps';`;
    const result = rewriteImports(input);
    expect(result).toBe(`import { mergeProps } from '@xds/core/utils';`);
  });

  it('leaves same-level relative imports untouched', () => {
    const input = `import { helper } from './helper';`;
    const result = rewriteImports(input);
    expect(result).toBe(`import { helper } from './helper';`);
  });

  it('rewrites export from statements', () => {
    const input = `export { foo } from '../hooks/useLayout';`;
    const result = rewriteImports(input);
    expect(result).toBe(`export { foo } from '@xds/core/hooks';`);
  });

  it('handles double quotes', () => {
    const input = `import { tokens } from "../theme/tokens.stylex";`;
    const result = rewriteImports(input);
    expect(result).toBe(`import { tokens } from "@xds/core/theme";`);
  });

  it('handles multiple imports in one file', () => {
    const input = [
      `import { tokens } from '../theme/tokens.stylex';`,
      `import { mergeProps } from '../utils/mergeProps';`,
      `import { helper } from './helper';`,
    ].join('\n');

    const result = rewriteImports(input);
    expect(result).toBe(
      [
        `import { tokens } from '@xds/core/theme';`,
        `import { mergeProps } from '@xds/core/utils';`,
        `import { helper } from './helper';`,
      ].join('\n'),
    );
  });
});

// -------------------------------------------------------------------
// createImportRewriter — exports-aware rewriter that backs the
// `xds swizzle` command. These tests use a synthetic fake-core fixture
// to exercise the rewriter without depending on the full @xds/core
// source tree.
// -------------------------------------------------------------------

describe('createImportRewriter', () => {
  let fakeCore;

  beforeAll(() => {
    fakeCore = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-rewriter-'));
    const src = path.join(fakeCore, 'src');
    fs.mkdirSync(path.join(src, 'Foo'), {recursive: true});
    fs.mkdirSync(path.join(src, 'Layout'), {recursive: true});
    fs.mkdirSync(path.join(src, 'utils'), {recursive: true});

    // Foo barrel re-exports XDSFoo (value) and FooProps (type)
    fs.writeFileSync(path.join(src, 'Foo', 'index.ts'),
      `export {XDSFoo} from './XDSFoo';\nexport type {FooProps} from './XDSFoo';\n`);
    fs.writeFileSync(path.join(src, 'Foo', 'XDSFoo.ts'),
      `export const XDSFoo = 'foo';\nexport type FooProps = {};\n`);

    // Layout barrel exposes EDGE_COMP_ATTR but NOT paddingStyles
    fs.writeFileSync(path.join(src, 'Layout', 'index.ts'),
      `export {EDGE_COMP_ATTR} from './edge.stylex';\n`);
    fs.writeFileSync(path.join(src, 'Layout', 'edge.stylex.ts'),
      `export const EDGE_COMP_ATTR = 'data-edge';\n`);
    fs.writeFileSync(path.join(src, 'Layout', 'padding.stylex.ts'),
      `export const paddingStyles = {};\n`);

    // utils barrel re-exports SizeValue (type)
    fs.writeFileSync(path.join(src, 'utils', 'index.ts'),
      `export type {SizeValue} from './types';\n`);
    fs.writeFileSync(path.join(src, 'utils', 'types.ts'),
      `export type SizeValue = number | string;\nexport type SpacingStep = 0 | 1;\n`);

    // Top-level type file
    fs.writeFileSync(path.join(src, 'XDSBaseProps.ts'),
      `export interface XDSBaseProps {}\n`);

    // package.json with exports map
    fs.writeFileSync(path.join(fakeCore, 'package.json'), JSON.stringify({
      name: '@xds/core',
      exports: {
        '.': {source: './src/index.ts'},
        './Foo': {source: './src/Foo/index.ts'},
        './Layout': {source: './src/Layout/index.ts'},
        './utils': {source: './src/utils/index.ts'},
        './XDSBaseProps': {source: './src/XDSBaseProps.ts'},
      },
    }));
  });

  afterAll(() => {
    fs.rmSync(fakeCore, {recursive: true, force: true});
  });

  function build() {
    const exports = new Set(['Foo', 'Layout', 'utils', 'XDSBaseProps']);
    return createImportRewriter({coreDir: fakeCore, exports});
  }

  it('rewrites top-level `../XDSBaseProps` to the public subpath', () => {
    const {rewrite} = build();
    const fileAbs = path.join(fakeCore, 'src', 'Foo', 'XDSFoo.ts');
    const out = rewrite(
      `import type {XDSBaseProps} from '../XDSBaseProps';`,
      fileAbs,
      'XDSFoo.ts',
    );
    expect(out).toBe(`import type {XDSBaseProps} from '@xds/core/XDSBaseProps';`);
  });

  it('rewrites a barrel-covered deep import to the package subpath', () => {
    const {rewrite, copies} = build();
    const fileAbs = path.join(fakeCore, 'src', 'Bar', 'XDSBar.ts');
    fs.mkdirSync(path.dirname(fileAbs), {recursive: true});
    const out = rewrite(
      `import {EDGE_COMP_ATTR} from '../Layout/edge.stylex';`,
      fileAbs,
      'XDSBar.ts',
    );
    expect(out).toBe(`import {EDGE_COMP_ATTR} from '@xds/core/Layout';`);
    expect(copies.size).toBe(0);
  });

  it('inlines a deep import when the symbol is NOT in the public barrel', () => {
    const {rewrite, copies} = build();
    const fileAbs = path.join(fakeCore, 'src', 'Card', 'XDSCard.ts');
    fs.mkdirSync(path.dirname(fileAbs), {recursive: true});
    const out = rewrite(
      `import {paddingStyles} from '../Layout/padding.stylex';`,
      fileAbs,
      'XDSCard.ts',
    );
    expect(out).toMatch(/from '\.\/_xdsInternal\/Layout\/padding\.stylex'/);
    expect(copies.size).toBe(1);
    const [absSource, outRel] = [...copies.entries()][0];
    expect(absSource).toBe(path.join(fakeCore, 'src', 'Layout', 'padding.stylex.ts'));
    expect(outRel).toBe(path.join('_xdsInternal', 'Layout', 'padding.stylex.ts'));
  });

  it('inlines a value-position import that the barrel only re-exports as a type', () => {
    const {rewrite, copies} = build();
    // Foo barrel exports FooProps as TYPE only. A value-position import
    // for FooProps must be inlined.
    const fileAbs = path.join(fakeCore, 'src', 'Bar', 'XDSBar.ts');
    fs.mkdirSync(path.dirname(fileAbs), {recursive: true});
    const out = rewrite(
      `import {FooProps} from '../Foo/XDSFoo';`, // value position
      fileAbs,
      'XDSBar.ts',
    );
    // Should not point at the barrel because FooProps isn't a value re-export
    expect(out).not.toBe(`import {FooProps} from '@xds/core/Foo';`);
    expect(copies.size).toBe(1);
  });

  it('keeps a type-position import that the barrel re-exports as a type', () => {
    const {rewrite, copies} = build();
    const fileAbs = path.join(fakeCore, 'src', 'Bar', 'XDSBar.ts');
    fs.mkdirSync(path.dirname(fileAbs), {recursive: true});
    const out = rewrite(
      `import type {FooProps} from '../Foo/XDSFoo';`,
      fileAbs,
      'XDSBar.ts',
    );
    expect(out).toBe(`import type {FooProps} from '@xds/core/Foo';`);
    expect(copies.size).toBe(0);
  });

  it('preserves same-level imports for component files', () => {
    const {rewrite} = build();
    const fileAbs = path.join(fakeCore, 'src', 'Foo', 'XDSFoo.ts');
    const out = rewrite(
      `import {helper} from './helper';`,
      fileAbs,
      'XDSFoo.ts',
    );
    expect(out).toBe(`import {helper} from './helper';`);
  });

  it('handles ../../utils/types deep imports (multi-level relative)', () => {
    const {rewrite, copies} = build();
    // File is two levels deep: src/Calendar/hooks/useFoo.ts → ../../utils/types
    const fileAbs = path.join(fakeCore, 'src', 'Calendar', 'hooks', 'useFoo.ts');
    fs.mkdirSync(path.dirname(fileAbs), {recursive: true});
    const out = rewrite(
      `import type {SpacingStep} from '../../utils/types';`,
      fileAbs,
      path.join('hooks', 'useFoo.ts'),
    );
    // utils barrel doesn't have SpacingStep so it should be inlined
    expect(out).toMatch(/_xdsInternal\/utils\/types/);
    expect(copies.size).toBe(1);
  });
});

// -------------------------------------------------------------------
// End-to-end: swizzle real components into a tmp dir, then run
// `tsc --noEmit` to verify the output type-checks. Covers the
// regression suite for HIGH-9 (XDSBaseProps export, Calendar subdirs,
// Card/Dialog deep stylex imports).
// -------------------------------------------------------------------

describe('swizzle output type-checks (e2e)', () => {
  // This suite swizzles the FULL set of components (auto-discovered via
  // `swizzle --list`, nothing hardcoded) into a single fixture and runs
  // `tsc --noEmit` ONCE over all of them. This proves the rewriter
  // produces type-correct output across every component family — form
  // inputs, overlays/portals, layout, navigation, data display,
  // date/time, and composite components — not just a hand-picked sample.
  //
  // It depends on packages/core being built (`pnpm build`) so that dist
  // .d.ts files exist for type resolution. CI runs build before tests.
  const repoRoot = path.resolve(import.meta.dirname, '..', '..', '..', '..');
  const corePkgDir = path.join(repoRoot, 'packages', 'core');
  const distExists = fs.existsSync(path.join(corePkgDir, 'dist', 'index.d.ts'));
  const cliBin = path.join(repoRoot, 'packages', 'cli', 'bin', 'xds.mjs');

  // In CI we MUST run this suite — silently skipping would let a broken
  // rewriter ship green. `pnpm build` is a documented pre-req, so a
  // missing dist in CI is a hard error, not a skip. Locally (no CI env),
  // we skip with a hint when core hasn't been built yet.
  const isCI = Boolean(process.env.CI);
  if (isCI && !distExists) {
    throw new Error(
      'swizzle e2e: packages/core/dist/index.d.ts is missing in CI. ' +
        'Run `pnpm build` before the CLI test job — the swizzle e2e ' +
        'matrix cannot be skipped in CI.',
    );
  }
  const conditionalIt = distExists ? it : it.skip;

  // Discover every swizzleable component from the CLI itself. Keeping
  // this dynamic means new components are covered automatically and the
  // matrix can never drift out of date.
  function discoverComponents() {
    if (!distExists) return [];
    const out = execFileSync(process.execPath, [cliBin, 'swizzle', '--list', '--json'], {
      env: {...process.env, FORCE_COLOR: '0'},
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    const parsed = JSON.parse(out);
    return Array.isArray(parsed.data) ? parsed.data : [];
  }

  let tmpDir;
  const components = discoverComponents();

  beforeAll(() => {
    if (!distExists) return;
    // Create the fixture INSIDE the workspace so the swizzle command's
    // upward walk (findCoreDir) locates packages/core. Using os.tmpdir()
    // lands outside the repo and findCoreDir's 5-level cap can't reach
    // the workspace packages/core.
    const fixturesRoot = path.join(repoRoot, 'node_modules', '.cache', 'swizzle-e2e');
    fs.mkdirSync(fixturesRoot, {recursive: true});
    tmpDir = fs.mkdtempSync(path.join(fixturesRoot, 'fixture-'));

    // Minimal package + tsconfig that consumes @xds/core. We DON'T
    // install (no node_modules) — we write a tsconfig with `paths` so
    // tsc resolves @xds/core directly to the workspace package's dist.
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
      name: 'swizzle-e2e-fixture',
      version: '0.0.0',
      type: 'module',
    }));

    fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        isolatedModules: true,
        resolveJsonModule: true,
        noEmit: true,
        paths: {
          '@xds/core': [path.join(corePkgDir, 'dist', 'index.d.ts')],
          '@xds/core/*': [path.join(corePkgDir, 'dist', '*')],
        },
        types: [],
      },
      include: ['components/**/*.ts', 'components/**/*.tsx'],
    }, null, 2));

    // Swizzle every component into the single fixture.
    for (const component of components) {
      execFileSync(process.execPath, [cliBin, 'swizzle', component, '--no-report'], {
        cwd: tmpDir,
        env: {...process.env, FORCE_COLOR: '0'},
        stdio: 'pipe',
      });
    }
  }, 120_000);

  afterAll(() => {
    if (tmpDir) fs.rmSync(tmpDir, {recursive: true, force: true});
  });

  conditionalIt('discovers a non-trivial component matrix', () => {
    // Guard against a regression where --list returns nothing and the
    // type-check below silently passes over an empty fixture.
    expect(components.length).toBeGreaterThan(50);
  });

  conditionalIt(
    'every swizzled component compiles cleanly (full matrix)',
    () => {
      const tscBin = path.join(repoRoot, 'node_modules', '.bin', 'tsc');
      let stdout = '';
      let exitCode = 0;
      try {
        stdout = execFileSync(tscBin, ['--noEmit'], {
          cwd: tmpDir,
          stdio: 'pipe',
          encoding: 'utf-8',
        });
      } catch (err) {
        exitCode = err.status ?? 1;
        stdout = (err.stdout || '') + (err.stderr || '');
      }

      if (exitCode !== 0) {
        // tsc paths include components/xds/<Component>/... so failures
        // point straight at the offending component.
        throw new Error(
          `tsc reported errors across the swizzle matrix ` +
            `(${components.length} components):\n${stdout}`,
        );
      }
      expect(exitCode).toBe(0);
    },
    120_000,
  );
});
