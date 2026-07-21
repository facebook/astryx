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
  it('renames every named size on Avatar', async () => {
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

  it('renames a size inside a ternary', async () => {
    const input = `import {Avatar} from '@astryxdesign/core';
const x = <Avatar name="A" size={big ? 'large' : 'small'} />;`;
    const output = await applyTransform(input);
    expect(output).toContain(`big ? 'xl' : 'md'`);
  });

  it('renames Storybook options arrays and default args', async () => {
    const input = `import {Avatar} from '@astryxdesign/core';
const meta = {
  argTypes: {size: {control: 'select', options: ['tiny', 'xsmall', 'small', 'medium', 'large']}},
  args: {size: 'medium'},
};`;
    const output = await applyTransform(input);
    expect(output).toContain(`['xsm', 'sm', 'md', 'lg', 'xl']`);
    expect(output).toContain(`size: 'lg'`);
  });

  it('renames a size-typed union literal', async () => {
    const input = `import {Avatar} from '@astryxdesign/core';
type Props = {size: 'small' | 'large'};`;
    const output = await applyTransform(input);
    expect(output).toContain(`'md' | 'xl'`);
  });

  it('does not touch files that never import Avatar/AvatarGroup', async () => {
    const input = `import {Badge} from '@astryxdesign/core';
const x = <Badge size="small" />;
const cfg = {size: 'large'};`;
    const output = await applyTransform(input);
    expect(output).toContain(`size="small"`);
    expect(output).toContain(`size: 'large'`);
  });

  it('does not rename an unrelated size string in an Avatar file', async () => {
    // Guarded: only `size`-keyed props are renamed, so a non-size string
    // literal is left alone even in a file that imports Avatar.
    const input = `import {Avatar} from '@astryxdesign/core';
const label = 'small';
const x = <Avatar name="A" size="small" />;`;
    const output = await applyTransform(input);
    expect(output).toContain(`const label = 'small'`);
    expect(output).toContain(`size='md'`);
  });
});
