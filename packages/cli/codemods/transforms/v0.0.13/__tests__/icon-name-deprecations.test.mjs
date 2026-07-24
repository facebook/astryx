// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, test} from 'vitest';

async function run(source) {
  const {default: transform} = await import('../icon-name-deprecations.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  return transform({source, path: 'test.tsx'}, api) ?? source;
}

describe('icon-name-deprecations', () => {
  test('renames JSX string literal: icon="checkCircle"', async () => {
    const input = `<XDSIcon icon="checkCircle" />`;
    const output = await run(input);
    expect(output).toContain('success');
    expect(output).not.toContain('checkCircle');
  });

  test('renames xCircle to error', async () => {
    const input = `<XDSIcon icon="xCircle" />`;
    const output = await run(input);
    expect(output).toContain('error');
    expect(output).not.toContain('xCircle');
  });

  test('renames inside ternary expression', async () => {
    const input = `<XDSIcon icon={copied ? 'checkCircle' : 'copy'} />`;
    const output = await run(input);
    expect(output).toContain('success');
    expect(output).not.toContain('checkCircle');
    expect(output).toContain('copy');
  });

  test('renames both branches of ternary if both deprecated', async () => {
    const input = `<XDSIcon icon={isOk ? 'checkCircle' : 'xCircle'} />`;
    const output = await run(input);
    expect(output).toContain('success');
    expect(output).toContain('error');
    expect(output).not.toContain('checkCircle');
    expect(output).not.toContain('xCircle');
  });

  test('renames inside logical expression', async () => {
    const input = `<XDSIcon icon={valid && 'checkCircle'} />`;
    const output = await run(input);
    expect(output).toContain('success');
    expect(output).not.toContain('checkCircle');
  });

  test('renames in object property value', async () => {
    const input = `const nav = [{ label: 'Done', icon: 'checkCircle' }];`;
    const output = await run(input);
    expect(output).toContain('success');
    expect(output).not.toContain('checkCircle');
  });

  test('renames icon registry keys', async () => {
    const input = `import type {XDSIconRegistry} from '@xds/core/Icon';\nconst icons = { checkCircle: <Svg />, xCircle: <X /> };`;
    const output = await run(input);
    expect(output).toContain('success');
    expect(output).toContain('error');
    expect(output).not.toContain('checkCircle');
    expect(output).not.toContain('xCircle');
  });

  test('does not rename unrelated props', async () => {
    const input = `<div title="checkCircle" />`;
    const output = await run(input);
    expect(output).toContain('checkCircle');
  });

  test('handles real-world pattern: ternary with color prop', async () => {
    const input = `<XDSIcon icon={copied ? 'checkCircle' : 'copy'} color="inherit" />`;
    const output = await run(input);
    expect(output).toContain('success');
    expect(output).toContain('copy');
    expect(output).not.toContain('checkCircle');
  });
});
