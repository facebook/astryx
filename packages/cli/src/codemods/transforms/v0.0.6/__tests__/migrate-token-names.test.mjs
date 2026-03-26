import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import('../migrate-token-names.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-token-names', () => {
  // === Semantic clarity renames ===

  it('renames --color-accent-deemphasized to --color-accent-muted', async () => {
    const input = `const x = colorVars['--color-accent-deemphasized'];`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-accent-muted');
    expect(output).not.toContain('--color-accent-deemphasized');
  });

  it('does NOT rename --color-accent (kept as-is)', async () => {
    const input = `const x = colorVars['--color-accent'];`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-accent');
  });

  it('renames --color-positive to --color-success', async () => {
    const input = `const x = colorVars['--color-positive'];`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-success');
    expect(output).not.toContain('--color-positive');
  });

  it('renames --color-negative to --color-error', async () => {
    const input = `const x = colorVars['--color-negative'];`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-error');
    expect(output).not.toContain('--color-negative');
  });

  it('renames --color-educational to --color-info', async () => {
    const input = `const x = colorVars['--color-educational'];`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-info');
    expect(output).not.toContain('--color-educational');
  });

  it('renames *-deemphasized to *-muted for all status tokens', async () => {
    const input = `const x = {
      a: colorVars['--color-positive-deemphasized'],
      b: colorVars['--color-negative-deemphasized'],
      c: colorVars['--color-warning-deemphasized'],
      d: colorVars['--color-educational-deemphasized'],
    };`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-success-muted');
    expect(output).toContain('--color-error-muted');
    expect(output).toContain('--color-warning-muted');
    expect(output).toContain('--color-info-muted');
    expect(output).not.toMatch(/deemphasized/);
  });

  // === Noun-first grammar renames ===

  it('renames overlay tokens to noun-first', async () => {
    const input = `const x = {
      a: colorVars['--color-hover-overlay'],
      b: colorVars['--color-pressed-overlay'],
      c: colorVars['--color-disabled-overlay'],
    };`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-overlay-hover');
    expect(output).toContain('--color-overlay-pressed');
    expect(output).toContain('--color-overlay-disabled');
  });

  it('renames focus-outline tokens to ring-focus', async () => {
    const input = `const x = {
      a: colorVars['--color-focus-outline'],
      b: colorVars['--color-focus-outline-error'],
      c: colorVars['--color-focus-outline-success'],
      d: colorVars['--color-focus-outline-warning'],
    };`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-ring-focus');
    expect(output).toContain('--color-ring-focus-error');
    expect(output).toContain('--color-ring-focus-success');
    expect(output).toContain('--color-ring-focus-warning');
    expect(output).not.toMatch(/focus-outline/);
  });

  // === Border/divider renames ===

  it('renames divider tokens to border', async () => {
    const input = `const x = {
      a: colorVars['--color-divider'],
      b: colorVars['--color-divider-high-contrast'],
      c: colorVars['--color-divider-emphasized'],
    };`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-border');
    expect(output).toContain('--color-border-strong');
    expect(output).toContain('--color-border-emphasized');
    expect(output).not.toMatch(/color-divider/);
  });

  // === Effects renames ===

  it('renames glimmer to skeleton', async () => {
    const input = `const x = colorVars['--color-glimmer'];`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-skeleton');
    expect(output).not.toMatch(/glimmer/);
  });

  it('renames --color-shadow-elevation to --color-shadow', async () => {
    const input = `const x = colorVars['--color-shadow-elevation'];`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-shadow');
    expect(output).not.toContain('--color-shadow-elevation');
  });

  // === Media renames ===

  it('renames on-media to on-dark-media', async () => {
    const input = `const x = {
      a: colorVars['--color-text-on-media'],
      b: colorVars['--color-icon-on-media'],
    };`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-text-on-dark-media');
    expect(output).toContain('--color-icon-on-dark-media');
  });

  // === Token removals (replaced by existing) ===

  it('replaces --color-accent-text with --color-text-link', async () => {
    const input = `const x = colorVars['--color-accent-text'];`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-text-link');
    expect(output).not.toContain('--color-accent-text');
  });

  it('replaces --color-text-placeholder with --color-text-secondary', async () => {
    const input = `const x = colorVars['--color-text-placeholder'];`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-text-secondary');
    expect(output).not.toContain('--color-text-placeholder');
  });

  it('replaces --color-icon-tertiary with --color-icon-secondary', async () => {
    const input = `const x = colorVars['--color-icon-tertiary'];`;
    const output = await applyTransform(input);
    expect(output).toContain('--color-icon-secondary');
    expect(output).not.toContain('--color-icon-tertiary');
  });

  // === Edge cases ===

  it('handles var() references in string literals', async () => {
    const input = `const x = 'var(--color-divider)';`;
    const output = await applyTransform(input);
    expect(output).toContain('var(--color-border)');
    expect(output).not.toContain('--color-divider');
  });

  it('handles template literals', async () => {
    const input = 'const css = `color: var(--color-educational)`;';
    const output = await applyTransform(input);
    expect(output).toContain('--color-info');
    expect(output).not.toContain('--color-educational');
  });

  it('handles defineTheme token objects', async () => {
    const input = `defineTheme({
      tokens: {
        '--color-accent': ['#0064E0', '#2694FE'],
        '--color-positive': ['#0D8626', '#0D8626'],
        '--color-divider': ['#05365919', '#F2F4F619'],
      }
    })`;
    const output = await applyTransform(input);
    // accent stays as accent
    expect(output).toContain('--color-accent');
    // positive → success
    expect(output).toContain('--color-success');
    // divider → border
    expect(output).toContain('--color-border');
    expect(output).not.toContain('--color-positive');
    expect(output).not.toContain('--color-divider');
  });

  it('does not modify tokens that are already renamed', async () => {
    const input = `const x = {
      a: colorVars['--color-accent'],
      b: colorVars['--color-success'],
      c: colorVars['--color-error'],
      d: colorVars['--color-border'],
    };`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not modify unrelated tokens', async () => {
    const input = `const x = {
      a: colorVars['--color-text-primary'],
      b: colorVars['--color-surface'],
      c: colorVars['--color-warning'],
      d: colorVars['--color-blue-background'],
    };`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import('../migrate-token-names.mjs');
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = `const x = '--color-accent';`;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('does not partially match (--color-accent stays, --color-accent-text renames)', async () => {
    const input = `const x = {
      a: colorVars['--color-accent-text'],
      b: colorVars['--color-accent'],
    };`;
    const output = await applyTransform(input);
    // accent-text → text-link
    expect(output).toContain('--color-text-link');
    // accent stays as accent
    expect(output).toContain('--color-accent');
    expect(output).not.toContain('--color-accent-text');
  });

  // === Inset shadow rename (Tailwind alignment) ===

  it('renames --insetshadow-border-* to --inset-shadow-border-*', async () => {
    const input = `const x = {
      a: shadowVars['--insetshadow-border-hover'],
      b: shadowVars['--insetshadow-border-accent'],
      c: shadowVars['--insetshadow-border-positive'],
      d: shadowVars['--insetshadow-border-warning'],
      e: shadowVars['--insetshadow-border-negative'],
    };`;
    const output = await applyTransform(input);
    expect(output).toContain('--inset-shadow-border-hover');
    expect(output).toContain('--inset-shadow-border-accent');
    expect(output).toContain('--inset-shadow-border-positive');
    expect(output).toContain('--inset-shadow-border-warning');
    expect(output).toContain('--inset-shadow-border-negative');
    expect(output).not.toMatch(/insetshadow/);
  });

  // === Easing rename (Tailwind alignment) ===

  it('renames --easing-standard to --ease-standard', async () => {
    const input = `const x = easeVars['--easing-standard'];`;
    const output = await applyTransform(input);
    expect(output).toContain('--ease-standard');
    expect(output).not.toContain('--easing-standard');
  });
});
