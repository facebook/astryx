// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../rename-radiogroup-arialabel-to-label.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-radiogroup-arialabel-to-label', () => {
  it('renames aria-label to label on DropdownMenuRadioGroup', async () => {
    const input = `import {DropdownMenuRadioGroup} from '@astryxdesign/core';
const t = <DropdownMenuRadioGroup value="a" onChange={fn} aria-label="Sort by"><Item /></DropdownMenuRadioGroup>;`;
    const output = await applyTransform(input);
    expect(output).not.toContain('aria-label');
    expect(output).toContain('label="Sort by"');
  });

  it('renames aria-label on ContextMenuRadioGroup', async () => {
    const input = `import {ContextMenuRadioGroup} from '@astryxdesign/core';
const t = <ContextMenuRadioGroup value="a" onChange={fn} aria-label="View"><Item /></ContextMenuRadioGroup>;`;
    const output = await applyTransform(input);
    expect(output).not.toContain('aria-label');
    expect(output).toContain('label="View"');
  });

  it('renames aria-label on BreadcrumbMenuRadioGroup', async () => {
    const input = `import {BreadcrumbMenuRadioGroup} from '@astryxdesign/core';
const t = <BreadcrumbMenuRadioGroup value="a" onChange={fn} aria-label="Path"><Item /></BreadcrumbMenuRadioGroup>;`;
    const output = await applyTransform(input);
    expect(output).not.toContain('aria-label');
    expect(output).toContain('label="Path"');
  });

  it('handles the subpath import source', async () => {
    const input = `import {DropdownMenuRadioGroup} from '@astryxdesign/core/DropdownMenu';
const t = <DropdownMenuRadioGroup value="a" onChange={fn} aria-label="Sort by"><Item /></DropdownMenuRadioGroup>;`;
    const output = await applyTransform(input);
    expect(output).not.toContain('aria-label');
    expect(output).toContain('label="Sort by"');
  });

  it('is alias-aware', async () => {
    const input = `import {DropdownMenuRadioGroup as RG} from '@astryxdesign/core';
const t = <RG value="a" onChange={fn} aria-label="Sort by"><Item /></RG>;`;
    const output = await applyTransform(input);
    expect(output).not.toContain('aria-label');
    expect(output).toContain('label="Sort by"');
  });

  it('leaves aria-labelledby untouched (visible-label path stays)', async () => {
    const input = `import {DropdownMenuRadioGroup} from '@astryxdesign/core';
const t = <DropdownMenuRadioGroup value="a" onChange={fn} aria-labelledby="sort-heading"><Item /></DropdownMenuRadioGroup>;`;
    const output = await applyTransform(input);
    expect(output).toContain('aria-labelledby="sort-heading"');
    expect(output).not.toContain('label=');
  });

  it('does not touch aria-label on other components', async () => {
    const input = `import {DropdownMenuRadioGroup} from '@astryxdesign/core';
const t = <SomeOtherComponent aria-label="untouched" />;`;
    const output = await applyTransform(input);
    expect(output).toContain('aria-label="untouched"');
  });

  it('returns undefined (no-op) when no target import is found', async () => {
    const input = `import {Button} from '@astryxdesign/core';
const t = <Button aria-label="Click" />;`;
    const {default: transform} = await import(
      '../rename-radiogroup-arialabel-to-label.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const file = {source: input, path: 'test.tsx'};
    const result = transform(file, api);
    expect(result).toBeUndefined();
  });
});
