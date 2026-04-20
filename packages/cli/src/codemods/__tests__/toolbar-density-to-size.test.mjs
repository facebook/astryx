import {describe, expect, test} from 'vitest';
import {applyTransform} from 'jscodeshift/dist/testUtils.js';
import transform from '../transforms/v0.0.13/toolbar-density-to-size.mjs';

const opts = {parser: 'tsx'};

describe('toolbar-density-to-size', () => {
  test('converts density="compact" to size="sm"', () => {
    const input = `<XDSToolbar label="Actions" density="compact" />`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toContain("size='sm'");
    expect(output).not.toContain('density');
  });

  test('removes density="default" entirely', () => {
    const input = `<XDSToolbar label="Actions" density="default" />`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).not.toContain('density');
    expect(output).not.toContain('size');
    expect(output).toContain('label="Actions"');
  });

  test('converts dynamic density to ternary', () => {
    const input = `<XDSToolbar label="Actions" density={d} />`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toContain("size={d === 'compact' ? 'sm' : 'md'}");
    expect(output).not.toContain('density');
  });

  test('leaves XDSToolbar without density unchanged', () => {
    const input = `<XDSToolbar label="Actions" variant="wash" />`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    // Transform returns undefined (no changes), applyTransform returns ''
    expect(output).toBe('');
  });

  test('does not transform density on other components', () => {
    const input = `<XDSList density="spacious" />`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    // No XDSToolbar found, transform returns undefined
    expect(output).toBe('');
  });

  test('converts density in Storybook args objects', () => {
    const input = `import {XDSToolbar} from '@xds/core/Toolbar';
const x = { density: 'compact' };`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toContain("size: 'sm'");
    expect(output).not.toContain("density: 'compact'");
  });

  test('converts density in argTypes with options', () => {
    const input = `import {XDSToolbar} from '@xds/core/Toolbar';
const meta = { argTypes: { density: { control: 'radio', options: ['default', 'compact'] } } };`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toContain('size:');
    expect(output).toContain("'sm'");
    expect(output).toContain("'md'");
    expect(output).toContain("'lg'");
  });

  test('skips object property transform when no XDSToolbar import', () => {
    const input = `const x = { density: 'compact' };`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toBe('');
  });
});
