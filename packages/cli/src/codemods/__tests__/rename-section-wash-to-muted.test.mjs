import {describe, expect, test} from 'vitest';
import {applyTransform} from 'jscodeshift/dist/testUtils.js';
import transform from '../transforms/v0.0.14/rename-section-wash-to-muted.mjs';

const opts = {parser: 'tsx'};

describe('rename-section-wash-to-muted', () => {
  test('converts variant="wash" to variant="muted" on XDSSection', () => {
    const input = `<XDSSection variant="wash">content</XDSSection>`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toContain('muted');
    expect(output).not.toContain('wash');
  });

  test('converts variant="wash" to variant="muted" on XDSToolbar', () => {
    const input = `<XDSToolbar label="Actions" variant="wash" />`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toContain('muted');
    expect(output).not.toContain('wash');
  });

  test('converts expression container variant={"wash"}', () => {
    const input = `<XDSSection variant={'wash'}>content</XDSSection>`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toContain('muted');
    expect(output).not.toContain('wash');
  });

  test('does not modify other variant values', () => {
    const input = `<XDSSection variant="default">content</XDSSection>`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    // No changes — returns empty string
    expect(output).toBe('');
  });

  test('does not modify variant="wash" on unrelated components', () => {
    const input = `<XDSCard variant="wash" />`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toBe('');
  });

  test('leaves XDSSection without variant unchanged', () => {
    const input = `<XDSSection padding="lg">content</XDSSection>`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toBe('');
  });

  test('converts variant in Storybook args when XDSSection is imported', () => {
    const input = `import {XDSSection} from '@xds/core/Section';
const meta = { args: { variant: 'wash' } };`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toContain("variant: 'muted'");
    expect(output).not.toContain("'wash'");
  });

  test('converts variant in Storybook args when XDSToolbar is imported', () => {
    const input = `import {XDSToolbar} from '@xds/core/Toolbar';
const meta = { args: { variant: 'wash' } };`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toContain("variant: 'muted'");
    expect(output).not.toContain("'wash'");
  });

  test('skips object property transform when no relevant import', () => {
    const input = `const x = { variant: 'wash' };`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toBe('');
  });

  test('converts wash in argTypes variant options array', () => {
    const input = `import {XDSSection} from '@xds/core/Section';
const meta = { argTypes: { variant: { control: 'select', options: ['section', 'transparent', 'wash'] } } };`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toContain("'muted'");
    expect(output).not.toContain("'wash'");
  });

  test('converts JSX text "wash" to "muted" in files importing target components', () => {
    const input = `import {XDSSection} from '@xds/core/Section';
const App = () => <h4>wash</h4>;`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toContain('muted');
    expect(output).not.toContain('wash');
  });

  test('does not convert JSX text "wash" without relevant import', () => {
    const input = `const App = () => <h4>wash</h4>;`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toBe('');
  });

  test('handles multiple components in same file', () => {
    const input = `<div>
  <XDSSection variant="wash">section</XDSSection>
  <XDSToolbar variant="wash" label="bar" />
</div>`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).not.toContain('wash');
    expect(output.match(/muted/g)).toHaveLength(2);
  });
});
