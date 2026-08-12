// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for the staged (next-release) codemods.
 *
 * Mirrors v0.3.0/__tests__/next-codemods.test.mjs, which covers the codemods
 * after promotion. Keeping a copy here means a staged transform is tested from
 * the day it is written rather than the day it is released.
 */

import {describe, expect, it} from 'vitest';
import jscodeshift from 'jscodeshift';

const j = jscodeshift.withParser('tsx');
const api = {jscodeshift: j, stats: () => {}, report: () => {}};

async function apply(name, source) {
  const {default: transform} = await import(`../${name}.mjs`);
  return transform({source, path: 'test.tsx'}, api) ?? source;
}

const TRANSFORM = 'rename-dropdown-menu-radio-dot-target';

describe('rename-dropdown-menu-radio-dot-target', () => {
  it('renames the theme target key in a defineTheme components map', async () => {
    const input = `import {defineTheme} from '@astryxdesign/core/theme';
export const theme = defineTheme({
  name: 'brand',
  components: {
    'dropdown-menu-radio-dot': {base: {backgroundColor: 'var(--color-accent)'}},
  },
});`;
    const output = await apply(TRANSFORM, input);
    expect(output).toContain("'radio-indicator-dot':");
    // The old name survives only inside the TODO comment the rename attaches.
    expect(output).not.toContain("'dropdown-menu-radio-dot':");
  });

  it('warns that the new target is app-wide, not menu-only', async () => {
    const input = `const components = {
  'dropdown-menu-radio-dot': {base: {width: '10px'}},
};`;
    const output = await apply(TRANSFORM, input);
    // The rename cannot preserve scope — there is no menu-only dot element
    // left — so the author has to decide, and must be told.
    expect(output).toContain('TODO(astryx upgrade)');
    expect(output).toContain('EVERY radio dot');
  });

  it('renames the rendered class inside a selector string', async () => {
    const input = `const sel = '.astryx-dropdown-menu-radio-dot';
const nested = '.astryx-dropdown-menu-radio .astryx-dropdown-menu-radio-dot';`;
    const output = await apply(TRANSFORM, input);
    expect(output).toContain("'.astryx-radio-indicator-dot'");
    expect(output).toContain(
      '.astryx-dropdown-menu-radio .astryx-radio-indicator-dot',
    );
  });

  it('renames the class inside a template literal', async () => {
    const input =
      'const css = `.astryx-dropdown-menu-radio-dot { background: ${c}; }`;';
    const output = await apply(TRANSFORM, input);
    expect(output).toContain('.astryx-radio-indicator-dot {');
    expect(output).not.toContain('astryx-dropdown-menu-radio-dot');
  });

  it('leaves the surviving dropdown-menu-radio target alone', async () => {
    // Only the DOT target was removed; the circle still carries the
    // menu-specific target, so a theme keyed on it must not be rewritten.
    const input = `const components = {
  'dropdown-menu-radio': {base: {borderWidth: '2px'}},
};`;
    const output = await apply(TRANSFORM, input);
    expect(output).toContain("'dropdown-menu-radio'");
    expect(output).not.toContain('radio-indicator');
    expect(output).not.toContain('TODO(astryx upgrade)');
  });

  it('is a no-op on files that never mention the target', async () => {
    const input = `const components = {button: {base: {fontWeight: '600'}}};`;
    expect(await apply(TRANSFORM, input)).toBe(input);
  });

  it('is idempotent', async () => {
    const input = `const components = {
  'dropdown-menu-radio-dot': {base: {width: '10px'}},
};`;
    const once = await apply(TRANSFORM, input);
    expect(await apply(TRANSFORM, once)).toBe(once);
  });
});

describe('rename-menu-divider-data-types', () => {
  const T = 'rename-menu-divider-data-types';

  it('renames a type-only import and its type references', async () => {
    const input = `import type {DropdownMenuOption, DropdownMenuDivider} from '@astryxdesign/core/DropdownMenu';

const rule: DropdownMenuDivider = {type: 'divider'};
const options: DropdownMenuOption[] = [rule];`;
    const output = await apply(T, input);
    expect(output).toContain('DropdownMenuDividerData');
    expect(output).not.toMatch(/DropdownMenuDivider\b(?!Data)/);
  });

  it('renames the ContextMenu and Breadcrumbs aliases too', async () => {
    const input = `import type {ContextMenuDivider} from '@astryxdesign/core/ContextMenu';
import type {BreadcrumbMenuDivider} from '@astryxdesign/core/Breadcrumbs';
const a: ContextMenuDivider = {type: 'divider'};
const b: BreadcrumbMenuDivider = {type: 'divider'};`;
    const output = await apply(T, input);
    expect(output).toContain('ContextMenuDividerData');
    expect(output).toContain('BreadcrumbMenuDividerData');
  });

  it('leaves the new component alone', async () => {
    const input = `import {DropdownMenu, DropdownMenuItem, DropdownMenuDivider} from '@astryxdesign/core/DropdownMenu';

export const Menu = () => (
  <DropdownMenu button={{label: 'Actions'}}>
    <DropdownMenuItem label="Edit" />
    <DropdownMenuDivider />
  </DropdownMenu>
);`;
    const output = await apply(T, input);
    expect(output).not.toContain('DropdownMenuDividerData');
  });

  it('renames an inline type specifier without touching a sibling value import', async () => {
    const input = `import {DropdownMenu, type DropdownMenuDivider} from '@astryxdesign/core/DropdownMenu';
const d: DropdownMenuDivider = {type: 'divider'};
export const M = () => <DropdownMenu button={{label: 'A'}} items={[d]} />;`;
    const output = await apply(T, input);
    expect(output).toContain('type DropdownMenuDividerData');
    expect(output).toContain('const d: DropdownMenuDividerData');
    expect(output).toContain('DropdownMenu,');
  });

  it('preserves an alias', async () => {
    const input = `import type {DropdownMenuDivider as MenuRule} from '@astryxdesign/core/DropdownMenu';
const d: MenuRule = {type: 'divider'};`;
    const output = await apply(T, input);
    expect(output).toContain('DropdownMenuDividerData as MenuRule');
    expect(output).toContain('const d: MenuRule');
  });

  it('ignores a same-named type from another package', async () => {
    const input = `import type {DropdownMenuDivider} from 'some-other-ui';
const d: DropdownMenuDivider = {type: 'divider'};`;
    const output = await apply(T, input);
    expect(output).not.toContain('DropdownMenuDividerData');
  });
});
