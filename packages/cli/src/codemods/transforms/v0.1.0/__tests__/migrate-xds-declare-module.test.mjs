// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source, filePath = 'test.d.ts') {
  const {default: transform} = await import('../migrate-xds-declare-module.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: filePath};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-xds-declare-module', () => {
  it('renames a subpath declare module', async () => {
    const input = [
      "declare module '@xds/core/Heading' {",
      '  export const HeadingLevelMap: Record<string, number>;',
      '}',
    ].join('\n');

    const output = await applyTransform(input);
    expect(output).toMatch(/declare module ['"]@astryxdesign\/core\/Heading['"]/);
    expect(output).not.toContain('@xds/core');
    // The augmentation body identifier is untouched.
    expect(output).toContain('HeadingLevelMap');
  });

  it('renames a bare @xds/core declare module', async () => {
    const input = "declare module '@xds/core' {\n  const x: number;\n}";
    const output = await applyTransform(input);
    expect(output).toMatch(/declare module ['"]@astryxdesign\/core['"]/);
    expect(output).not.toContain('@xds/core');
  });

  it('renames @xds/lab declare module using the shared map', async () => {
    const input = "declare module '@xds/lab/Thing' {\n  const y: number;\n}";
    const output = await applyTransform(input);
    expect(output).toMatch(/declare module ['"]@astryxdesign\/lab\/Thing['"]/);
    expect(output).not.toContain('@xds/lab');
  });

  it('leaves non-xds declare modules alone', async () => {
    const input = "declare module 'react' {\n  const z: number;\n}";
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('leaves an already-migrated declare module unchanged', async () => {
    const input = "declare module '@astryxdesign/core/Heading' {\n  const a: number;\n}";
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not touch namespace declarations (Identifier id)', async () => {
    const input = 'declare namespace XDSCore {\n  const b: number;\n}';
    const output = await applyTransform(input, 'test.ts');
    expect(output).toBe(input);
  });
});
