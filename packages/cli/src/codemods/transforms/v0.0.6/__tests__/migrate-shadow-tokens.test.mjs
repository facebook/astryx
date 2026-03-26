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
  it('--elevation-base → --shadow-low', async () => {
    expect(await applyTransform(`const x = '--elevation-base';`)).toContain('--shadow-low');
  });
  it('--elevation-menu → --shadow-low', async () => {
    expect(await applyTransform(`const x = '--elevation-menu';`)).toContain('--shadow-low');
  });
  it('--elevation-hover → --shadow-med', async () => {
    expect(await applyTransform(`const x = '--elevation-hover';`)).toContain('--shadow-med');
  });
  it('--elevation-dialog → --shadow-high', async () => {
    expect(await applyTransform(`const x = '--elevation-dialog';`)).toContain('--shadow-high');
  });

  // From shadow-N (numeric period)
  it('--shadow-1 → --shadow-low', async () => {
    expect(await applyTransform(`const x = '--shadow-1';`)).toContain('--shadow-low');
  });
  it('--shadow-3 → --shadow-med', async () => {
    expect(await applyTransform(`const x = '--shadow-3';`)).toContain('--shadow-med');
  });
  it('--shadow-4 → --shadow-high', async () => {
    expect(await applyTransform(`const x = '--shadow-4';`)).toContain('--shadow-high');
  });

  // From intermediate v0.0.6 names
  it('--shadow-base → --shadow-low', async () => {
    expect(await applyTransform(`const x = '--shadow-base';`)).toContain('--shadow-low');
  });
  it('--shadow-menu → --shadow-low', async () => {
    expect(await applyTransform(`const x = '--shadow-menu';`)).toContain('--shadow-low');
  });
  it('--shadow-hover → --shadow-med', async () => {
    expect(await applyTransform(`const x = '--shadow-hover';`)).toContain('--shadow-med');
  });
  it('--shadow-dialog → --shadow-high', async () => {
    expect(await applyTransform(`const x = '--shadow-dialog';`)).toContain('--shadow-high');
  });

  // Inset shadows
  it('--elevation-input-hover → --shadow-inset-hover', async () => {
    expect(await applyTransform(`const x = '--elevation-input-hover';`)).toContain('--shadow-inset-hover');
  });
  it('--elevation-input-hover-success → --shadow-inset-success', async () => {
    expect(await applyTransform(`const x = '--elevation-input-hover-success';`)).toContain('--shadow-inset-success');
  });
  it('--inset-shadow-border-hover → --shadow-inset-hover', async () => {
    expect(await applyTransform(`const x = '--inset-shadow-border-hover';`)).toContain('--shadow-inset-hover');
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
    expect(await applyTransform(`const s = 'var(--elevation-menu)';`)).toContain('var(--shadow-low)');
  });
  it('renames in template literals', async () => {
    const out = await applyTransform('const s = `box-shadow: var(--elevation-dialog)`;');
    expect(out).toContain('--shadow-high');
    expect(out).not.toContain('--elevation-dialog');
  });

  // Safety
  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import('../migrate-shadow-tokens.mjs');
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const result = transform({source: `const x = '--shadow-low';`, path: 'test.tsx'}, {jscodeshift: j, stats: () => {}, report: () => {}});
    expect(result).toBeUndefined();
  });
});
