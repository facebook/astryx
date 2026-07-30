// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import('../rename-avatar-size-scale.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-avatar-size-scale', () => {
  it('renames every named size on an Avatar JSX size attribute', async () => {
    const input = `import {Avatar} from '@astryxdesign/core';
const a = <Avatar name="A" size="tiny" />;
const b = <Avatar name="B" size="xsmall" />;
const c = <Avatar name="C" size="small" />;
const d = <Avatar name="D" size="medium" />;
const e = <Avatar name="E" size="large" />;`;
    const output = await applyTransform(input);
    expect(output).toContain(`size='xsm'`);
    expect(output).toContain(`size='sm'`);
    expect(output).toContain(`size='md'`);
    expect(output).toContain(`size='lg'`);
    expect(output).toContain(`size='xl'`);
    for (const old of ['tiny', 'xsmall', 'small', 'medium', 'large']) {
      expect(output).not.toContain(`size="${old}"`);
    }
  });

  it('renames size on AvatarGroup', async () => {
    const input = `import {AvatarGroup} from '@astryxdesign/core';
const x = <AvatarGroup size="medium">{kids}</AvatarGroup>;`;
    const output = await applyTransform(input);
    expect(output).toContain(`size='lg'`);
  });

  it('leaves numeric sizes untouched', async () => {
    const input = `import {Avatar} from '@astryxdesign/core';
const x = <Avatar name="A" size={48} />;`;
    const output = await applyTransform(input);
    expect(output).toContain('size={48}');
  });

  it('is alias-aware', async () => {
    const input = `import {Avatar as Face} from '@astryxdesign/core';
const x = <Face name="A" size="small" />;`;
    const output = await applyTransform(input);
    expect(output).toContain(`size='md'`);
  });

  it('renames the subpath and legacy import sources', async () => {
    const sub = `import {Avatar} from '@astryxdesign/core/Avatar';
const x = <Avatar name="A" size="large" />;`;
    expect(await applyTransform(sub)).toContain(`size='xl'`);
    const legacy = `import {Avatar} from '@xds/core';
const x = <Avatar name="A" size="tiny" />;`;
    expect(await applyTransform(legacy)).toContain(`size='xsm'`);
  });

  it('renames a size inside a ternary on an Avatar element', async () => {
    const input = `import {Avatar} from '@astryxdesign/core';
const x = <Avatar name="A" size={big ? 'large' : 'small'} />;`;
    const output = await applyTransform(input);
    expect(output).toContain(`big ? 'xl' : 'md'`);
  });

  it('renames the UNIQUE names tiny/xsmall in Storybook options and size args', async () => {
    const input = `import {Avatar} from '@astryxdesign/core';
const meta = {
  argTypes: {size: {control: 'select', options: ['tiny', 'xsmall']}},
  args: {size: 'tiny'},
};`;
    const output = await applyTransform(input);
    expect(output).toContain(`['xsm', 'sm']`);
    expect(output).toContain(`size: 'xsm'`);
  });

  it('renames a FULL Storybook options array (unique name unlocks ambiguous members)', async () => {
    // The presence of a unique name (tiny/xsmall) proves the whole array is the
    // Avatar size enum, so small/medium/large in it are safe to rename too.
    const input = `import {Avatar} from '@astryxdesign/core';
const meta = {
  argTypes: {size: {control: 'select', options: ['tiny', 'xsmall', 'small', 'medium', 'large']}},
};`;
    const output = await applyTransform(input);
    expect(output).toContain(`['xsm', 'sm', 'md', 'lg', 'xl']`);
  });

  it('renames a standalone Avatar-size array literal used with .map()', async () => {
    const input = `import {AvatarGroup} from '@astryxdesign/core';
const sizes = (['tiny', 'xsmall', 'small', 'medium', 'large'] as const).map(s => s);`;
    const output = await applyTransform(input);
    expect(output).toContain(`['xsm', 'sm', 'md', 'lg', 'xl']`);
  });

  it('does NOT rename an array of ambiguous words with no unique Avatar name', async () => {
    // Without tiny/xsmall, the array could be anything (priorities, densities),
    // so ambiguous members are left untouched.
    const input = `import {Avatar} from '@astryxdesign/core';
const densities = ['small', 'medium', 'large'] as const;`;
    const output = await applyTransform(input);
    expect(output).toContain(`['small', 'medium', 'large']`);
  });

  it('renames a UNIQUE name in a size-typed union literal', async () => {
    const input = `import {Avatar} from '@astryxdesign/core';
type Props = {size: 'tiny' | 'xsmall'};`;
    const output = await applyTransform(input);
    expect(output).toContain(`'xsm' | 'sm'`);
  });

  // --- Precision guards: ambiguous common words must NOT be corrupted in
  // --- context-blind positions, even in files that import Avatar. ---

  it('does NOT rename ambiguous names in an unrelated union type', async () => {
    const input = `import {Avatar} from '@astryxdesign/core';
type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';`;
    const output = await applyTransform(input);
    expect(output).toContain(`'medium'`);
    expect(output).not.toContain(`'lg'`);
  });

  it('does NOT rename an ambiguous name in a non-size object property', async () => {
    const input = `import {Avatar} from '@astryxdesign/core';
const cfg = {priority: 'medium', density: 'large'};`;
    const output = await applyTransform(input);
    expect(output).toContain(`priority: 'medium'`);
    expect(output).toContain(`density: 'large'`);
  });

  it('does NOT rename an ambiguous name in a size-keyed object property (component unknown)', async () => {
    // A `size: 'small'` object entry could belong to any component; renaming it
    // blind would be unsafe, so it is left for manual migration.
    const input = `import {Avatar} from '@astryxdesign/core';
const args = {size: 'small'};`;
    const output = await applyTransform(input);
    expect(output).toContain(`size: 'small'`);
  });

  it('does not touch files that never import Avatar/AvatarGroup', async () => {
    const input = `import {Badge} from '@astryxdesign/core';
const x = <Badge size="small" />;
type P = 'tiny' | 'xsmall';`;
    const output = await applyTransform(input);
    expect(output).toContain(`size="small"`);
    expect(output).toContain(`'tiny' | 'xsmall'`);
  });

  it('does not rename an unrelated non-size string in an Avatar file', async () => {
    const input = `import {Avatar} from '@astryxdesign/core';
const label = 'small';
const x = <Avatar name="A" size="small" />;`;
    const output = await applyTransform(input);
    expect(output).toContain(`const label = 'small'`);
    expect(output).toContain(`size='md'`);
  });
});
