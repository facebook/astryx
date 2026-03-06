import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../replace-hstack-vstack-with-stack.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('replace-hstack-vstack-with-stack', () => {
  // === JSX transforms ===

  it('replaces XDSHStack with XDSStack direction="horizontal"', async () => {
    const input = '<XDSHStack gap={8}><div /><div /></XDSHStack>';
    const output = await applyTransform(input);
    expect(output).toContain('XDSStack');
    expect(output).toContain('direction="horizontal"');
    expect(output).toContain('gap={8}');
    expect(output).not.toContain('XDSHStack');
  });

  it('replaces XDSVStack with XDSStack direction="vertical"', async () => {
    const input = '<XDSVStack gap={12}><div /><div /></XDSVStack>';
    const output = await applyTransform(input);
    expect(output).toContain('XDSStack');
    expect(output).toContain('direction="vertical"');
    expect(output).toContain('gap={12}');
    expect(output).not.toContain('XDSVStack');
  });

  it('handles self-closing elements', async () => {
    const input = '<XDSHStack gap={4} />';
    const output = await applyTransform(input);
    expect(output).toContain('XDSStack');
    expect(output).toContain('direction="horizontal"');
    expect(output).not.toContain('XDSHStack');
  });

  it('preserves all existing props', async () => {
    const input = '<XDSHStack gap={8} align="center" xstyle={styles.row}><div /></XDSHStack>';
    const output = await applyTransform(input);
    expect(output).toContain('direction="horizontal"');
    expect(output).toContain('gap={8}');
    expect(output).toContain('align="center"');
    expect(output).toContain('xstyle={styles.row}');
  });

  it('handles both HStack and VStack in the same file', async () => {
    const input = `
      <div>
        <XDSHStack gap={8}><span /></XDSHStack>
        <XDSVStack gap={12}><span /></XDSVStack>
      </div>
    `;
    const output = await applyTransform(input);
    expect(output).not.toContain('XDSHStack');
    expect(output).not.toContain('XDSVStack');
    expect(output).toContain('direction="horizontal"');
    expect(output).toContain('direction="vertical"');
  });

  it('does not touch non-XDS components', async () => {
    const input = '<HStack gap={8}><div /></HStack>';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not touch XDSStack that already has direction', async () => {
    const input = '<XDSStack direction="horizontal" gap={8}><div /></XDSStack>';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  // === Import transforms ===

  it('replaces XDSHStack import with XDSStack', async () => {
    const input = `import {XDSHStack} from '@xds/core/Stack';
<XDSHStack><div /></XDSHStack>`;
    const output = await applyTransform(input);
    expect(output).toContain("import {XDSStack} from '@xds/core/Stack'");
    expect(output).not.toContain('XDSHStack');
  });

  it('replaces XDSVStack import with XDSStack', async () => {
    const input = `import {XDSVStack} from '@xds/core/Stack';
<XDSVStack><div /></XDSVStack>`;
    const output = await applyTransform(input);
    expect(output).toContain("import {XDSStack} from '@xds/core/Stack'");
    expect(output).not.toContain('XDSVStack');
  });

  it('does not duplicate XDSStack import if already present', async () => {
    const input = `import {XDSStack, XDSHStack} from '@xds/core/Stack';
<XDSHStack><div /></XDSHStack>`;
    const output = await applyTransform(input);
    // Should have XDSStack but not duplicate it
    const matches = output.match(/XDSStack/g);
    // XDSStack appears in import + JSX opening + JSX closing = 3
    expect(output).not.toContain('XDSHStack');
    expect(output).toContain('XDSStack');
    expect(output).toContain("'@xds/core/Stack'");
  });

  it('handles both HStack and VStack imports together', async () => {
    const input = `import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Stack';
<div>
  <XDSHStack><div /></XDSHStack>
  <XDSVStack><div /></XDSVStack>
</div>`;
    const output = await applyTransform(input);
    expect(output).not.toContain('XDSHStack');
    expect(output).not.toContain('XDSVStack');
    expect(output).toContain('XDSStack');
    expect(output).toContain('XDSStackItem');
  });

  it('handles imports from @xds/core barrel', async () => {
    const input = `import {XDSHStack, XDSButton} from '@xds/core';
<XDSHStack><XDSButton label="Click" /></XDSHStack>`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSStack');
    expect(output).toContain('XDSButton');
    expect(output).not.toContain('XDSHStack');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../replace-hstack-vstack-with-stack.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<XDSStack direction="horizontal" gap={8}><div /></XDSStack>';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('handles nested stacks', async () => {
    const input = `
      <XDSVStack gap={16}>
        <XDSHStack gap={8}><span /><span /></XDSHStack>
        <XDSHStack gap={8}><span /><span /></XDSHStack>
      </XDSVStack>
    `;
    const output = await applyTransform(input);
    expect(output).not.toContain('XDSVStack');
    expect(output).not.toContain('XDSHStack');
    // Should have both directions
    expect(output).toContain('direction="vertical"');
    expect(output).toContain('direction="horizontal"');
  });
});
