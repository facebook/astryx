// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} =
    await import('../rename-switch-label-spacing-default-to-hug.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-switch-label-spacing-default-to-hug', () => {
  it('renames Switch labelSpacing="default" to labelSpacing="hug"', async () => {
    const input = `<Switch label="Notify" value={on} labelSpacing="default" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'hug'");
    expect(output).not.toContain('default');
  });

  it("renames expression-container labelSpacing={'default'}", async () => {
    const input = `<Switch label="Notify" value={on} labelSpacing={'default'} />`;
    const output = await applyTransform(input);
    expect(output).toContain("'hug'");
    expect(output).not.toContain("'default'");
  });

  it('renames default inside a ternary labelSpacing expression', async () => {
    const input = `<Switch label="Notify" value={on} labelSpacing={isRow ? 'spread' : 'default'} />`;
    const output = await applyTransform(input);
    expect(output).toContain("'hug'");
    expect(output).toContain("'spread'");
    expect(output).not.toContain("'default'");
  });

  it('does not change labelSpacing="spread"', async () => {
    const input = `<Switch label="Notify" value={on} labelSpacing="spread" />`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not touch labelSpacing="default" on non-Switch components', async () => {
    const input = `<LegacyToggle labelSpacing="default" />`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not touch other props with a "default" value on Switch', async () => {
    const input = `<Switch label="Notify" value={on} data-variant="default" />`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not touch unrelated "default" string literals', async () => {
    const input = `const theme = {mode: 'default', label: 'Default Mode'};`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('renames object labelSpacing prop in files importing Switch', async () => {
    const input = `import {Switch} from '@astryxdesign/core/Switch';
const cfg = {labelSpacing: 'default'};`;
    const output = await applyTransform(input);
    expect(output).toContain("labelSpacing: 'hug'");
    expect(output).not.toContain("'default'");
  });

  it("renames labelSpacing: 'default' as const in files importing Switch", async () => {
    const input = `import {Switch} from '@astryxdesign/core/Switch';
const ROWS = [{labelSpacing: 'default' as const, label: 'Adjacent'}];`;
    const output = await applyTransform(input);
    expect(output).toContain("'hug' as const");
    expect(output).not.toContain("'default'");
  });

  it('does not rename object labelSpacing prop when Switch is not imported', async () => {
    const input = `const cfg = {labelSpacing: 'default'};`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('renames Storybook argTypes options in files importing Switch', async () => {
    const input = `import {Switch} from '@astryxdesign/core/Switch';
const meta = {argTypes: {labelSpacing: {control: 'select', options: ['default', 'spread']}}};`;
    const output = await applyTransform(input);
    expect(output).toContain("'hug'");
    expect(output).toContain("'spread'");
    expect(output).not.toContain("'default'");
  });
});
