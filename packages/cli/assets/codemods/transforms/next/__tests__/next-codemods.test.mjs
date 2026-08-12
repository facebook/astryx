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

describe('remove-indicator-a11y-props', () => {
  const T = 'remove-indicator-a11y-props';

  it('strips the five props from a direct indicator call site', async () => {
    const input = `import {CheckIndicator} from '@astryxdesign/core/Indicator';
const x = <CheckIndicator state="checked" aria-hidden="false" role="checkbox" data-testid="keep" />;`;
    const out = await apply(T, input);
    expect(out).not.toMatch(/aria-hidden="/);
    expect(out).not.toMatch(/\srole="/);
    // Everything else survives — removal must not become a purge.
    expect(out).toContain('data-testid="keep"');
    expect(out).toContain('state="checked"');
    expect(out).toContain('TODO(astryx upgrade)');
  });

  it('reaches an indicator resolved through useIndicator', async () => {
    // The documented way a host renders a themeable indicator: no indicator
    // name appears in the JSX at all, so a name-matching codemod would miss it.
    const input = `import {useIndicator} from '@astryxdesign/core/Indicator';
function Row() {
  const Mark = useIndicator('check');
  return <Mark state="checked" tabIndex={0} aria-label="chosen" />;
}`;
    const out = await apply(T, input);
    // Assert on the ATTRIBUTE form: the TODO comment names the props it
    // removed, so a bare substring check matches its own explanation.
    expect(out).not.toMatch(/tabIndex=\{/);
    expect(out).not.toMatch(/aria-label="/);
    expect(out).toContain('state="checked"');
    expect(out).toContain('TODO(astryx upgrade)');
  });

  it('leaves other components alone', async () => {
    const input = `import {Button} from '@astryxdesign/core/Button';
const x = <Button label="Go" role="link" tabIndex={0} />;`;
    expect(await apply(T, input)).toBe(input);
  });

  it('is a no-op on files with no indicator', async () => {
    const input = `const x = <div role="button" tabIndex={0} />;`;
    expect(await apply(T, input)).toBe(input);
  });

  it('is idempotent', async () => {
    const input = `import {RadioIndicator} from '@astryxdesign/core/Indicator';
const x = <RadioIndicator state="unchecked" role="radio" />;`;
    const once = await apply(T, input);
    expect(await apply(T, once)).toBe(once);
  });
});
