// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source, filePath = 'test.tsx') {
  const {default: transform} =
    await import('../migrate-xds-module-specifiers.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: filePath};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-xds-module-specifiers', () => {
  it('renames import and export source paths including subpaths', async () => {
    const input = [
      "import {Button} from '@xds/core/Button';",
      "import '@xds/theme-default/theme.css';",
      "export {LabThing} from '@xds/lab/Thing';",
      "export * from '@xds/core/theme';",
    ].join('\n');

    const output = await applyTransform(input);
    expect(output).toContain('@astryxdesign/core/Button');
    expect(output).toContain('@astryxdesign/theme-neutral/theme.css');
    expect(output).toContain('@astryxdesign/lab/Thing');
    expect(output).toContain('@astryxdesign/core/theme');
    expect(output).not.toContain('@xds/');
  });

  it('renames dynamic import and require string literals', async () => {
    const output = await applyTransform(
      [
        "const mod = await import('@xds/core/theme');",
        "const core = require('@xds/core');",
      ].join('\n'),
      'test.ts',
    );
    expect(output).toContain('@astryxdesign/core/theme');
    expect(output).toContain('@astryxdesign/core');
    expect(output).not.toContain('@xds/');
  });

  it('does not rewrite ordinary string literals', async () => {
    const input = "const packageName = '@xds/core';";
    const output = await applyTransform(input, 'test.ts');
    expect(output).toBe(input);
  });

  it('remaps defaultTheme -> neutralTheme when collapsing theme-default', async () => {
    const output = await applyTransform(
      `import {defaultTheme} from '@xds/theme-default';`,
      'test.ts',
    );
    // Package collapses to theme-neutral; binding aliased so local usage works.
    expect(output).toContain('neutralTheme as defaultTheme');
    expect(output).toContain('@astryxdesign/theme-neutral');
    expect(output).not.toContain('@xds/');
    expect(output).not.toContain('theme-default');
  });

  it('remaps defaultTheme -> neutralTheme for theme-daily and /built subpath', async () => {
    const output = await applyTransform(
      `import {defaultTheme} from '@xds/theme-daily/built';`,
      'test.ts',
    );
    expect(output).toContain('neutralTheme as defaultTheme');
    expect(output).toContain('@astryxdesign/theme-neutral/built');
  });

  it('preserves an existing alias when remapping defaultTheme', async () => {
    const output = await applyTransform(
      `import {defaultTheme as dt} from '@xds/theme-default';`,
      'test.ts',
    );
    expect(output).toContain('neutralTheme as dt');
    expect(output).toContain('@astryxdesign/theme-neutral');
  });

  it('does NOT remap neutralTheme import from theme-neutral (no rename needed)', async () => {
    const output = await applyTransform(
      `import {neutralTheme} from '@xds/theme-neutral';`,
      'test.ts',
    );
    expect(output).toContain('neutralTheme');
    expect(output).toContain('@astryxdesign/theme-neutral');
    expect(output).not.toContain('defaultTheme');
    expect(output).not.toContain('neutralTheme as');
  });

  it('rewrites the mocked module path in vi.mock (including the inline import() type arg)', async () => {
    const input = [
      "vi.mock('@xds/core/Text', async orig => ({",
      "  ...(await orig<typeof import('@xds/core/Text')>()),",
      '}));',
    ].join('\n');
    const output = await applyTransform(input);
    expect(output).toMatch(/vi\.mock\(['"]@astryxdesign\/core\/Text['"]/);
    // The inline dynamic import() type argument is rewritten too.
    expect(output).toMatch(/import\(['"]@astryxdesign\/core\/Text['"]\)/);
    expect(output).not.toContain('@xds/');
  });

  it('rewrites the mocked module path in jest.mock (bare @xds/core)', async () => {
    const output = await applyTransform(
      "jest.mock('@xds/core', () => ({}));",
      'test.ts',
    );
    expect(output).toMatch(/jest\.mock\(['"]@astryxdesign\/core['"]/);
    expect(output).not.toContain('@xds/');
  });

  it('rewrites vi.doMock / jest.doMock and a bare mock() call', async () => {
    const output = await applyTransform(
      [
        "vi.doMock('@xds/lab/Thing', () => ({}));",
        "jest.doMock('@xds/core/Text', () => ({}));",
        "mock('@xds/core', () => ({}));",
      ].join('\n'),
      'test.ts',
    );
    expect(output).toMatch(/vi\.doMock\(['"]@astryxdesign\/lab\/Thing['"]/);
    expect(output).toMatch(/jest\.doMock\(['"]@astryxdesign\/core\/Text['"]/);
    expect(output).toMatch(/[^.]mock\(['"]@astryxdesign\/core['"]/);
    expect(output).not.toContain('@xds/');
  });

  it('does NOT rewrite the mock path for a non-@xds package', async () => {
    const input = "vi.mock('some-other-pkg', () => ({useXDSFoo: () => 1}));";
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });
});
