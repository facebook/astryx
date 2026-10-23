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

const IMPORT =
  "import {Heading, Link, Text, Timestamp} from '@astryxdesign/core';\n";

describe('rename-text-color-active-to-accent', () => {
  it('renames Text color="active" to color="accent"', async () => {
    const input = `${IMPORT}<Text color="active">Hi</Text>`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).not.toContain('active');
  });

  it('renames Heading color="active" to color="accent"', async () => {
    const input = `${IMPORT}<Heading level={2} color="active">Title</Heading>`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).not.toContain('active');
  });

  it('renames Link color="active" to color="accent"', async () => {
    const input = `${IMPORT}<Link href="/x" color="active">Go</Link>`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).not.toContain('active');
  });

  it('renames Timestamp color="active" to color="accent"', async () => {
    const input = `${IMPORT}<Timestamp value={d} color="active" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).not.toContain('active');
  });

  it("renames expression-container color={'active'}", async () => {
    const input = `${IMPORT}<Text color={'active'}>Hi</Text>`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).not.toContain("'active'");
  });

  it('renames active inside a ternary color expression', async () => {
    const input = `${IMPORT}<Text color={isOn ? 'active' : 'secondary'}>Hi</Text>`;
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

  it('renames color args on a Storybook meta and its stories for an Astryx Text', async () => {
    const input = `import type {Meta, StoryObj} from '@storybook/react';
import {Text} from '@xds/core/Text';
const meta = {component: Text, args: {color: 'active'}} satisfies Meta<typeof Text>;
export default meta;
export const Accent: StoryObj<typeof meta> = {args: {color: 'active' as const}};`;
    const output = await applyTransform(input);
    expect(output).toContain("args: {color: 'accent'}");
    expect(output).toContain("'accent' as const");
    expect(output).not.toContain("'active'");
  });

  it('leaves an unproven color object in an Astryx file unchanged with a TODO', async () => {
    const input = `import {Text} from '@xds/core/Text';
const COLORS = [{color: 'active' as const, description: 'Accent'}];`;
    const output = await applyTransform(input);
    expect(output).toContain("color: 'active' as const");
    expect(output).toContain(
      "TODO(astryx upgrade): `color: 'active'` was left unchanged",
    );
    expect(await applyTransform(output)).toBe(output);
  });

  it('does not rename another library config in a file that uses Astryx Text', async () => {
    const input = `import {Text} from '@astryxdesign/core';
import {Badge} from 'other-ui';
const badgeConfig = {color: 'active'};
export const Row = () => <Text color="active"><Badge {...badgeConfig} /></Text>;`;
    const output = await applyTransform(input);
    expect(output).toContain("<Text color='accent'>");
    expect(output).toContain("color: 'active'};");
    expect(output).not.toContain("color: 'accent'");
    expect(output).toContain('TODO(astryx upgrade)');
  });

  it('does not rename object color prop when no target component is imported', async () => {
    const input = `const cfg = {color: 'active'};`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('renames an aliased or namespaced Astryx import', async () => {
    const aliased =
      await applyTransform(`import {Text as AstryxText} from '@astryxdesign/core/Text';
<AstryxText color="active">Hi</AstryxText>`);
    expect(aliased).toContain("'accent'");
    const namespaced =
      await applyTransform(`import * as Astryx from '@astryxdesign/core';
<Astryx.Heading color="active">Hi</Astryx.Heading>`);
    expect(namespaced).toContain("'accent'");
  });

  it('does not touch Text and Link from another package', async () => {
    const input = `import {Text} from 'react-native';
import Link from 'next/link';
<Text color="active">Hi</Text>;
<Link href="/x" color="active">Go</Link>;`;
    expect(await applyTransform(input)).toBe(input);
  });

  it('does not touch an unimported or shadowed Text', async () => {
    const unimported = `<Text color="active">Hi</Text>`;
    expect(await applyTransform(unimported)).toBe(unimported);
    const shadowed = `${IMPORT}function Row({Text}) {
  return <Text color="active">Hi</Text>;
}`;
    expect(await applyTransform(shadowed)).toBe(shadowed);
  });

  it('does not rename object color props when Text comes from another package', async () => {
    const input = `import {Text} from 'react-native';
const cfg = {color: 'active'};
const meta = {argTypes: {color: {options: ['active']}}};`;
    expect(await applyTransform(input)).toBe(input);
  });

  it('renames active in Storybook color argTypes options of an Astryx meta', async () => {
    const input = `import {Text} from '@xds/core/Text';
export default {component: Text, argTypes: {color: {control: 'select', options: ['primary', 'active', 'inherit']}}};`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).not.toContain("'active'");
  });

  it('migrates a namespace-imported meta component and reports namespace-file candidates', async () => {
    const input = `import * as Astryx from '@astryxdesign/core';
const options = {color: 'active'};
export default {component: Astryx.Heading, argTypes: {color: {options: ['active']}}};`;
    const output = await applyTransform(input);
    expect(output).toContain("options: ['accent']");
    expect(output).toContain("color: 'active'");
    expect(output).toContain('TODO(astryx upgrade)');
  });

  it('does not migrate argTypes whose meta component is not an Astryx import', async () => {
    const input = `import {Text} from '@astryxdesign/core';
import {Label} from 'other-ui';
export default {component: Label, argTypes: {color: {options: ['active']}}};
export const Row = () => <Text>Hi</Text>;`;
    const output = await applyTransform(input);
    expect(output).toContain("options: ['active']");
    expect(output).toContain('TODO(astryx upgrade)');
  });

  it('returns undefined (no change) when nothing matches', async () => {
    const input = `<Text color="primary">Hi</Text>`;
    const output = await applyTransform(input);
    // applyTransform falls back to source when transform returns undefined
    expect(output).toBe(input);
  });
});
