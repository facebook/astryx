// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../migrate-gap-to-numeric.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-gap-to-numeric', () => {
  it('converts gap="space0" to gap={0}', async () => {
    const input = '<XDSStack direction="vertical" gap="space0"><div /></XDSStack>';
    const output = await applyTransform(input);
    expect(output).toContain('gap={0}');
    expect(output).not.toContain('"space0"');
  });

  it('converts gap="space0.5" to gap={0.5}', async () => {
    const input = '<XDSHStack gap="space0.5"><div /></XDSHStack>';
    const output = await applyTransform(input);
    expect(output).toContain('gap={0.5}');
    expect(output).not.toContain('"space0.5"');
  });

  it('converts gap="space4" to gap={4}', async () => {
    const input = '<XDSVStack gap="space4"><div /></XDSVStack>';
    const output = await applyTransform(input);
    expect(output).toContain('gap={4}');
    expect(output).not.toContain('"space4"');
  });

  it('converts gap="space10" to gap={10}', async () => {
    const input = '<XDSStack direction="horizontal" gap="space10"><div /></XDSStack>';
    const output = await applyTransform(input);
    expect(output).toContain('gap={10}');
    expect(output).not.toContain('"space10"');
  });

  it('converts rowGap and columnGap on XDSGrid', async () => {
    const input = '<XDSGrid columns={3} rowGap="space2" columnGap="space6"><div /></XDSGrid>';
    const output = await applyTransform(input);
    expect(output).toContain('rowGap={2}');
    expect(output).toContain('columnGap={6}');
    expect(output).not.toContain('"space2"');
    expect(output).not.toContain('"space6"');
  });

  it('converts gap on XDSGrid', async () => {
    const input = '<XDSGrid columns={3} gap="space4"><div /></XDSGrid>';
    const output = await applyTransform(input);
    expect(output).toContain('gap={4}');
    expect(output).not.toContain('"space4"');
  });

  it('handles gap={"space4"} expression container form', async () => {
    const input = '<XDSStack direction="vertical" gap={"space4"}><div /></XDSStack>';
    const output = await applyTransform(input);
    expect(output).toContain('gap={4}');
  });

  it('does not modify non-gap props', async () => {
    const input = '<XDSStack direction="vertical" gap="space2" wrap="wrap"><div /></XDSStack>';
    const output = await applyTransform(input);
    expect(output).toContain('gap={2}');
    expect(output).toContain('wrap="wrap"');
  });

  it('handles multiple components in one file', async () => {
    const input = `
      <div>
        <XDSHStack gap="space2"><div /></XDSHStack>
        <XDSVStack gap="space4"><div /></XDSVStack>
        <XDSGrid columns={3} gap="space6"><div /></XDSGrid>
      </div>
    `;
    const output = await applyTransform(input);
    expect(output).toContain('gap={2}');
    expect(output).toContain('gap={4}');
    expect(output).toContain('gap={6}');
    expect(output).not.toContain('"space');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../migrate-gap-to-numeric.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<XDSStack direction="vertical" gap={4}><div /></XDSStack>';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('does not modify unknown string values', async () => {
    const input = '<XDSStack direction="vertical" gap="custom"><div /></XDSStack>';
    const output = await applyTransform(input);
    expect(output).toContain('gap="custom"');
  });

  it('does not modify gap on user-defined components', async () => {
    const input = '<CustomComponent gap="space3" />';
    const output = await applyTransform(input);
    expect(output).toContain('gap="space3"');
    expect(output).not.toContain('gap={3}');
  });

  it('does not modify gap on HTML elements', async () => {
    const input = '<div gap="space4"><span /></div>';
    const output = await applyTransform(input);
    expect(output).toContain('gap="space4"');
    expect(output).not.toContain('gap={4}');
  });

  it('does not modify rowGap/columnGap on non-XDS components', async () => {
    const input =
      '<MyGrid rowGap="space2" columnGap="space6"><div /></MyGrid>';
    const output = await applyTransform(input);
    expect(output).toContain('rowGap="space2"');
    expect(output).toContain('columnGap="space6"');
  });

  it('does not modify gap on namespaced or member-expression components', async () => {
    const input = '<Foo.Bar gap="space4"><div /></Foo.Bar>';
    const output = await applyTransform(input);
    expect(output).toContain('gap="space4"');
  });

  it('only rewrites XDS components in mixed files', async () => {
    const input = `
      <div>
        <XDSStack gap="space2"><div /></XDSStack>
        <CustomComponent gap="space3" />
        <div gap="space4" />
      </div>
    `;
    const output = await applyTransform(input);
    expect(output).toContain('gap={2}');
    expect(output).toContain('gap="space3"');
    expect(output).toContain('gap="space4"');
  });

  it.each([
    'XDSStack',
    'XDSHStack',
    'XDSVStack',
    'XDSGrid',
    'XDSGridSpan',
    'XDSStackItem',
  ])('rewrites gap on %s', async (component) => {
    const input = `<${component} gap="space5"><div /></${component}>`;
    const output = await applyTransform(input);
    expect(output).toContain('gap={5}');
    expect(output).not.toContain('"space5"');
  });
});
