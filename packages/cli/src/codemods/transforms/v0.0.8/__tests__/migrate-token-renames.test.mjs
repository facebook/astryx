import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import('../migrate-token-renames.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-token-renames (v0.0.8)', () => {
  // === Color renames ===

  it('renames --color-secondary to --color-neutral', async () => {
    const output = await applyTransform(`const x = '--color-secondary';`);
    expect(output).toContain('--color-neutral');
    expect(output).not.toContain('--color-secondary');
  });

  it('renames --color-text-link to --color-text-accent', async () => {
    const output = await applyTransform(`const x = colorVars['--color-text-link'];`);
    expect(output).toContain('--color-text-accent');
    expect(output).not.toContain('--color-text-link');
  });

  it('renames --color-text-on-dark-media to --color-on-dark', async () => {
    const output = await applyTransform(`const x = '--color-text-on-dark-media';`);
    expect(output).toContain('--color-on-dark');
  });

  it('renames background tokens', async () => {
    const input = `const x = {
      a: colorVars['--color-wash'],
      b: colorVars['--color-surface'],
      c: colorVars['--color-card'],
      d: colorVars['--color-popover'],
      e: colorVars['--color-muted'],
    };`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-background-body');
    expect(output).toContain('--color-background-surface');
    expect(output).toContain('--color-background-card');
    expect(output).toContain('--color-background-popover');
    expect(output).toContain('--color-background-muted');
  });

  it('renames --color-hover-tint to --color-tint-hover', async () => {
    const output = await applyTransform(`const x = '--color-hover-tint';`);
    expect(output).toContain('--color-tint-hover');
  });

  it('removes ring-focus tokens by mapping to accent/status', async () => {
    const input = `const x = {
      a: colorVars['--color-ring-focus'],
      b: colorVars['--color-ring-focus-error'],
      c: colorVars['--color-ring-focus-success'],
      d: colorVars['--color-ring-focus-warning'],
    };`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-accent');
    expect(output).toContain('--color-error');
    expect(output).toContain('--color-success');
    expect(output).toContain('--color-warning');
    expect(output).not.toMatch(/ring-focus/);
  });

  it('renames palette tokens (reversed naming)', async () => {
    const input = `const x = {
      a: colorVars['--color-blue-background'],
      b: colorVars['--color-red-text'],
      c: colorVars['--color-green-icon'],
      d: colorVars['--color-gray-border'],
    };`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-background-blue');
    expect(output).toContain('--color-text-red');
    expect(output).toContain('--color-icon-green');
    expect(output).toContain('--color-border-gray');
  });

  // === Size renames ===

  it('renames size tokens', async () => {
    const output = await applyTransform(`const x = sizeVars['--size-sm'];`);
    expect(output).toContain('--size-element-sm');
  });

  // === Radius renames ===

  it('renames radius tokens from numeric to semantic', async () => {
    const input = `const x = {
      a: radiusVars['--radius-0'],
      b: radiusVars['--radius-1'],
      c: radiusVars['--radius-2'],
      d: radiusVars['--radius-3'],
      e: radiusVars['--radius-rounded'],
    };`;
    const output = await applyTransform(input);
    expect(output).toContain('--radius-none');
    expect(output).toContain('--radius-inner');
    expect(output).toContain('--radius-element');
    expect(output).toContain('--radius-container');
    expect(output).toContain('--radius-full');
  });

  it('removes --radius-4 by mapping to --radius-container', async () => {
    const output = await applyTransform(`const x = '--radius-4';`);
    expect(output).toContain('--radius-container');
  });

  // === Shadow renames ===

  it('renames shadow tokens', async () => {
    const input = `const x = {
      a: shadowVars['--shadow-base'],
      b: shadowVars['--shadow-menu'],
      c: shadowVars['--shadow-hover'],
      d: shadowVars['--shadow-dialog'],
    };`;
    const output = await applyTransform(input);
    expect(output).toContain('--shadow-low');
    expect(output).toContain('--shadow-med');
    expect(output).toContain('--shadow-high');
    expect(output).not.toMatch(/shadow-base|shadow-menu|shadow-hover|shadow-dialog/);
  });

  it('renames inset shadow tokens', async () => {
    const input = `const x = {
      a: shadowVars['--inset-shadow-border-hover'],
      b: shadowVars['--inset-shadow-border-accent'],
      c: shadowVars['--inset-shadow-border-positive'],
      d: shadowVars['--inset-shadow-border-warning'],
      e: shadowVars['--inset-shadow-border-negative'],
    };`;
    const output = await applyTransform(input);
    expect(output).toContain('--shadow-inset-hover');
    expect(output).toContain('--shadow-inset-selected');
    expect(output).toContain('--shadow-inset-success');
    expect(output).toContain('--shadow-inset-warning');
    expect(output).toContain('--shadow-inset-error');
  });

  // === Typography renames ===

  it('renames font family tokens', async () => {
    const output = await applyTransform(`const x = 'var(--font-heading)';`);
    expect(output).toContain('var(--font-family-heading)');
  });

  it('renames font size tokens', async () => {
    const output = await applyTransform(`const x = textSizeVars['--text-base'];`);
    expect(output).toContain('--font-size-base');
  });

  it('renames --text-xsm to --font-size-xs', async () => {
    const output = await applyTransform(`const x = '--text-xsm';`);
    expect(output).toContain('--font-size-xs');
  });

  // === Type scale renames ===

  it('renames heading type scale tokens', async () => {
    const output = await applyTransform(`const x = 'var(--heading-1-size)';`);
    expect(output).toContain('var(--text-heading-1-size)');
  });

  // === Removed token migrations ===

  it('maps --color-info to --color-icon-purple', async () => {
    const output = await applyTransform(`const x = colorVars['--color-info'];`);
    expect(output).toContain('--color-icon-purple');
    expect(output).not.toContain("'--color-info'");
  });

  it('maps --color-info-muted to --color-background-purple', async () => {
    const output = await applyTransform(`const x = '--color-info-muted';`);
    expect(output).toContain('--color-background-purple');
  });

  // === Line height renames (token string + identifier rewrite) ===

  it('rewrites lineHeightVars member access to typeScaleVars with new key', async () => {
    const input = `const x = lineHeightVars['--leading-base'];`;
    const output = await applyTransform(input);
    expect(output).toContain('typeScaleVars["--text-body-leading"]');
    expect(output).not.toContain('lineHeightVars');
    expect(output).not.toContain('--leading-base');
  });

  it('rewrites lineHeightVars import to typeScaleVars', async () => {
    const input = `import { lineHeightVars } from '@xds/core/theme/tokens.stylex';
const x = lineHeightVars['--leading-snug'];`;
    const output = await applyTransform(input);
    expect(output).toContain('typeScaleVars');
    expect(output).toContain('--text-label-leading');
    expect(output).not.toContain('lineHeightVars');
    expect(output).not.toContain('--leading-snug');
  });

  it('rewrites lineHeightDefaults to typeScaleDefaults', async () => {
    const input = `import { lineHeightDefaults } from '@xds/core';
const tokens = { ...lineHeightDefaults };`;
    const output = await applyTransform(input);
    expect(output).toContain('typeScaleDefaults');
    expect(output).not.toContain('lineHeightDefaults');
  });

  it('renames all --leading-* token strings', async () => {
    const input = `const styles = {
      a: lineHeightVars['--leading-base'],
      b: lineHeightVars['--leading-snug'],
      c: lineHeightVars['--leading-normal'],
      d: lineHeightVars['--leading-tight'],
      e: lineHeightVars['--leading-relaxed'],
    };`;
    const output = await applyTransform(input);
    expect(output).toContain('typeScaleVars["--text-body-leading"]');
    expect(output).toContain('typeScaleVars["--text-label-leading"]');
    expect(output).toContain('typeScaleVars["--text-large-leading"]');
    expect(output).toContain('typeScaleVars["--text-heading-1-leading"]');
    expect(output).toContain('typeScaleVars["--text-supporting-leading"]');
    expect(output).not.toContain('lineHeightVars');
  });

  it('renames bare --leading-* strings (e.g. in CSS)', async () => {
    const output = await applyTransform(`const x = '--leading-normal';`);
    expect(output).toContain('--text-large-leading');
  });

  // === Edge cases ===

  it('handles template literals', async () => {
    const output = await applyTransform('const css = `color: var(--color-wash)`;');
    expect(output).toContain('--color-background-body');
  });

  it('does not modify already-final names', async () => {
    const input = `const x = '--color-background-body';`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import('../migrate-token-renames.mjs');
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const result = transform({source: `const x = '--color-accent';`, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });
});
