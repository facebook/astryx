// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import('../migrate-shadow-tokens.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  return transform({source, path: 'test.tsx'}, api) ?? source;
}

describe('migrate-shadow-tokens', () => {
  // From elevation-*
  it('--elevation-base → --shadow-base', async () => {
    expect(await applyTransform(`const x = '--elevation-base';`)).toContain('--shadow-base');
  });
  it('--elevation-menu → --shadow-menu', async () => {
    expect(await applyTransform(`const x = '--elevation-menu';`)).toContain('--shadow-menu');
  });
  it('--elevation-hover → --shadow-hover', async () => {
    expect(await applyTransform(`const x = '--elevation-hover';`)).toContain('--shadow-hover');
  });
  it('--elevation-dialog → --shadow-dialog', async () => {
    expect(await applyTransform(`const x = '--elevation-dialog';`)).toContain('--shadow-dialog');
  });

  // From shadow-N (numeric period)
  it('--shadow-1 → --shadow-base', async () => {
    expect(await applyTransform(`const x = '--shadow-1';`)).toContain('--shadow-base');
  });
  it('--shadow-2 → --shadow-menu', async () => {
    expect(await applyTransform(`const x = '--shadow-2';`)).toContain('--shadow-menu');
  });
  it('--shadow-3 → --shadow-hover', async () => {
    expect(await applyTransform(`const x = '--shadow-3';`)).toContain('--shadow-hover');
  });
  it('--shadow-4 → --shadow-dialog', async () => {
    expect(await applyTransform(`const x = '--shadow-4';`)).toContain('--shadow-dialog');
  });

  // Inset shadows
  it('--elevation-input-hover → --inset-shadow-border-hover', async () => {
    expect(await applyTransform(`const x = '--elevation-input-hover';`)).toContain('--inset-shadow-border-hover');
  });
  it('--elevation-input-hover-success → --inset-shadow-border-positive', async () => {
    expect(await applyTransform(`const x = '--elevation-input-hover-success';`)).toContain('--inset-shadow-border-positive');
  });
  it('--elevation-input-hover-warning → --inset-shadow-border-warning', async () => {
    expect(await applyTransform(`const x = '--elevation-input-hover-warning';`)).toContain('--inset-shadow-border-warning');
  });
  it('--elevation-input-hover-error → --inset-shadow-border-negative', async () => {
    expect(await applyTransform(`const x = '--elevation-input-hover-error';`)).toContain('--inset-shadow-border-negative');
  });

  // JS identifiers
  it('elevationVars → shadowVars', async () => {
    const out = await applyTransform(`import { elevationVars } from '@xds/core';`);
    expect(out).toContain('shadowVars');
    expect(out).not.toContain('elevationVars');
  });
  it('elevationDefaults → shadowDefaults', async () => {
    expect(await applyTransform(`import { elevationDefaults } from '@xds/core';`)).toContain('shadowDefaults');
  });
  it('ElevationVarName → ShadowVarName', async () => {
    expect(await applyTransform(`import type { ElevationVarName } from '@xds/core';`)).toContain('ShadowVarName');
  });

  // var() and template literals
  it('renames in var()', async () => {
    expect(await applyTransform(`const s = 'var(--elevation-menu)';`)).toContain('var(--shadow-menu)');
  });
  it('renames in template literals', async () => {
    const out = await applyTransform('const s = `box-shadow: var(--elevation-dialog)`;');
    expect(out).toContain('--shadow-dialog');
    expect(out).not.toContain('--elevation-dialog');
  });

  // defineTheme
  it('handles defineTheme', async () => {
    const out = await applyTransform(`const t = defineTheme({ tokens: { '--elevation-base': 'x', '--elevation-input-hover': 'y' } })`);
    expect(out).toContain('--shadow-base');
    expect(out).toContain('--inset-shadow-border-hover');
  });

  // Safety
  it('does not modify --color-shadow-elevation', async () => {
    expect(await applyTransform(`const x = '--color-shadow-elevation';`)).toContain('--color-shadow-elevation');
  });
  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import('../migrate-shadow-tokens.mjs');
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const result = transform({source: `const x = '--shadow-base';`, path: 'test.tsx'}, {jscodeshift: j, stats: () => {}, report: () => {}});
    expect(result).toBeUndefined();
  });

  // Real-world pattern
  it('handles full component pattern', async () => {
    const out = await applyTransform(`import {elevationVars} from '../theme/tokens.stylex';
const s = stylex.create({ c: { boxShadow: elevationVars['--elevation-menu'] } });`);
    expect(out).toContain('shadowVars');
    expect(out).toContain('--shadow-menu');
    expect(out).not.toContain('elevationVars');
    expect(out).not.toContain('--elevation-menu');
  });
});
