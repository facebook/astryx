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

const IMPORT = "import {Switch} from '@astryxdesign/core';\n";

describe('rename-switch-label-spacing-default-to-hug', () => {
  it('renames Switch labelSpacing="default" to labelSpacing="hug"', async () => {
    const input = `${IMPORT}<Switch label="Notify" value={on} labelSpacing="default" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'hug'");
    expect(output).not.toContain('default');
  });

  it("renames expression-container labelSpacing={'default'}", async () => {
    const input = `${IMPORT}<Switch label="Notify" value={on} labelSpacing={'default'} />`;
    const output = await applyTransform(input);
    expect(output).toContain("'hug'");
    expect(output).not.toContain("'default'");
  });

  it('renames default inside a ternary labelSpacing expression', async () => {
    const input = `${IMPORT}<Switch label="Notify" value={on} labelSpacing={isRow ? 'spread' : 'default'} />`;
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

  it('renames labelSpacing args on a Storybook meta and its stories for an Astryx Switch', async () => {
    const input = `import {Switch} from '@astryxdesign/core/Switch';
const meta = {component: Switch, args: {labelSpacing: 'default'}};
export default meta;
export const Adjacent = {args: {labelSpacing: 'default' as const}};`;
    const output = await applyTransform(input);
    expect(output).toContain("args: {labelSpacing: 'hug'}");
    expect(output).toContain("'hug' as const");
    expect(output).not.toContain("'default'");
  });

  it('leaves an unproven labelSpacing object in an Astryx file unchanged with a TODO', async () => {
    const input = `import {Switch} from '@astryxdesign/core/Switch';
const ROWS = [{labelSpacing: 'default' as const, label: 'Adjacent'}];`;
    const output = await applyTransform(input);
    expect(output).toContain("labelSpacing: 'default' as const");
    expect(output).toContain(
      "TODO(astryx upgrade): `labelSpacing: 'default'` was left unchanged",
    );
    expect(await applyTransform(output)).toBe(output);
  });

  it('does not rename another library config in a file that uses Astryx Switch', async () => {
    const input = `import {Switch} from '@astryxdesign/core';
import {Toggle} from 'other-ui';
const toggleConfig = {labelSpacing: 'default'};
export const Row = () => <><Switch label="A" value labelSpacing="default" /><Toggle {...toggleConfig} /></>;`;
    const output = await applyTransform(input);
    expect(output).toContain("labelSpacing='hug'");
    expect(output).toContain("labelSpacing: 'default'};");
    expect(output).not.toContain("labelSpacing: 'hug'");
    expect(output).toContain('TODO(astryx upgrade)');
  });

  it('migrates a namespace-imported Switch meta and reports namespace-file candidates', async () => {
    const input = `import * as Astryx from '@astryxdesign/core';
const options = {labelSpacing: 'default'};
export default {component: Astryx.Switch, argTypes: {labelSpacing: {options: ['default', 'spread']}}};`;
    const output = await applyTransform(input);
    expect(output).toContain("options: ['hug', 'spread']");
    expect(output).toContain("labelSpacing: 'default'");
    expect(output).toContain('TODO(astryx upgrade)');
  });

  it('does not rename object labelSpacing prop when Switch is not imported', async () => {
    const input = `const cfg = {labelSpacing: 'default'};`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not touch a Switch from another package', async () => {
    const input = `import {Switch} from '@headlessui/react';
<Switch checked={on} labelSpacing="default" />;
const cfg = {labelSpacing: 'default'};`;
    expect(await applyTransform(input)).toBe(input);
  });

  it('does not touch an unimported Switch', async () => {
    const input = `<Switch label="Notify" value={on} labelSpacing="default" />`;
    expect(await applyTransform(input)).toBe(input);
  });

  it('renames Storybook argTypes options on an Astryx Switch meta', async () => {
    const input = `import {Switch} from '@astryxdesign/core/Switch';
const meta = {component: Switch, argTypes: {labelSpacing: {control: 'select', options: ['default', 'spread']}}};
export default meta;`;
    const output = await applyTransform(input);
    expect(output).toContain("'hug'");
    expect(output).toContain("'spread'");
    expect(output).not.toContain("'default'");
  });
});
