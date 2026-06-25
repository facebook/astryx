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
});
