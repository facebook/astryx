// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} =
    await import('../rename-text-color-active-to-accent.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-text-color-active-to-accent', () => {
  it('renames Text color="active" to color="accent"', async () => {
    const input = `<Text color="active">Hi</Text>`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).not.toContain('active');
  });

  it('renames Heading color="active" to color="accent"', async () => {
    const input = `<Heading level={2} color="active">Title</Heading>`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).not.toContain('active');
  });

  it('renames Link color="active" to color="accent"', async () => {
    const input = `<Link href="/x" color="active">Go</Link>`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).not.toContain('active');
  });

  it('renames Timestamp color="active" to color="accent"', async () => {
    const input = `<Timestamp value={d} color="active" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).not.toContain('active');
  });

  it("renames expression-container color={'active'}", async () => {
    const input = `<Text color={'active'}>Hi</Text>`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).not.toContain("'active'");
  });

  it('renames active inside a ternary color expression', async () => {
    const input = `<Text color={isOn ? 'active' : 'secondary'}>Hi</Text>`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).toContain("'secondary'");
    expect(output).not.toContain("'active'");
  });

  it('does not change other color values', async () => {
    const input = `<Text color="secondary">Hi</Text>`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not touch color="active" on non-target components', async () => {
    const input = `<StatusDot color="active" />`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not touch unrelated "active" string literals', async () => {
    const input = `const node = {id: 'active', label: 'Active Users'};`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not touch a status enum value named active', async () => {
    const input = `const filters = {status: 'active'};`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('renames object color prop in files importing a target component', async () => {
    const input = `import {Text} from '@xds/core/Text';
const cfg = {color: 'active'};`;
    const output = await applyTransform(input);
    expect(output).toContain("color: 'accent'");
    expect(output).not.toContain("'active'");
  });

  it("renames color: 'active' as const in files importing a target component", async () => {
    const input = `import {Text} from '@xds/core/Text';
const COLORS = [{color: 'active' as const, description: 'Accent'}];`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent' as const");
    expect(output).not.toContain("'active'");
  });

  it('does not rename object color prop when no target component is imported', async () => {
    const input = `const cfg = {color: 'active'};`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('renames active in Storybook color argTypes options', async () => {
    const input = `import {Text} from '@xds/core/Text';
const meta = {argTypes: {color: {control: 'select', options: ['primary', 'active', 'inherit']}}};`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).not.toContain("'active'");
  });

  it('returns undefined (no change) when nothing matches', async () => {
    const input = `<Text color="primary">Hi</Text>`;
    const output = await applyTransform(input);
    // applyTransform falls back to source when transform returns undefined
    expect(output).toBe(input);
  });
});
