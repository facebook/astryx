// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Pure normalized Icon emission without installed Core or source evaluation.
 * @input Exact contributor pointers, proven import expressions and supplied defaults.
 * @output Shared identity, renderer references, collision-safe bindings and missing-ledger rejection.
 * @position Private CLI unit seam; native artifact behavior is tested separately.
 */
import {describe, expect, it} from 'vitest';
import {
  lowerBuiltIconContracts,
  lowerBuiltIconSources,
} from './icon-emission.mjs';

describe('normalized Icon artifact emission', () => {
  it('retains independently authored equal contracts and their distinct references', () => {
    const one = {appearances: ['filled']},
      two = {appearances: ['filled']};
    const theme = {
      __iconContracts: [one, two],
      iconCapabilities: {
        contract: two,
        presentation: {
          default: {weight: 525.5},
          bySize: {md: {appearance: 'filled'}},
        },
      },
    };
    const emitted = lowerBuiltIconContracts(
      theme,
      'demoTheme',
      new Set(),
      undefined,
      undefined,
      [
        {contract: one, expression: 'C1'},
        {contract: two, expression: 'C2'},
      ],
    );
    expect(emitted.expression(one)).toBe('demoThemeIconContracts[0]');
    expect(emitted.expression(two)).toBe('demoThemeIconContracts[1]');
    expect(emitted.fields).toContain('contract: demoThemeIconContracts[1]');
    expect(emitted.declarations).toContain('C1 ??');
    expect(emitted.declarations).toContain('C2 ??');
    expect(emitted.fields).toContain('525.5');
    expect(emitted.fields).not.toMatch(
      /componentIcons|byState|roleSizeOverrides/,
    );
  });
  it('requires exact-pointer membership rather than structural equality', () => {
    const contract = {};
    const emitted = lowerBuiltIconContracts(
      {__iconContracts: [contract]},
      'demo',
      new Set(),
    );
    expect(() => emitted.expression({})).toThrow(
      expect.objectContaining({code: 'ERR_THEME_INVALID'}),
    );
  });
  it('keeps an imported renderer and all branches without sampling or function text', () => {
    const contract = {};
    function supplied({weight}) {
      return weight;
    }
    const theme = {
      __iconSources: {
        'library:mark': {
          capabilities: contract,
          tree: {
            default: {
              default: {render: supplied, weightRange: {min: 200, max: 800}},
            },
            byAppearance: {outline: {default: 'outline'}},
          },
        },
        fixed: 'unchanged',
      },
    };
    const emitted = lowerBuiltIconSources(
      theme,
      'libraryIcons',
      'demo',
      new Set(),
      () => 'contracts[0]',
    );
    expect(emitted.declarations).toContain('libraryIcons');
    expect(emitted.declarations).toContain('.tree ??');
    expect(emitted.declarations).toContain(
      'CreateElement(demoIconSources["library:mark"].tree.default.default.render)',
    );
    expect(emitted.declarations).not.toMatch(
      /function supplied|weight:|200|800|byAppearance/,
    );
    expect(emitted.imports).toContain("from 'react'");
    expect(emitted.imports).not.toMatch(/resolve|inspect|Adapter|Role/);
  });
  it('does not recreate fixed-only maps and omits unused constructor imports', () => {
    const emitted = lowerBuiltIconContracts({}, 'demo', new Set());
    expect(emitted).toMatchObject({imports: '', declarations: '', fields: ''});
  });
  it('avoids reserved import/theme/family binding collisions', () => {
    const used = new Set([
      'demoIconContracts',
      'demoDefineIconCapabilities',
      'demoIconSources',
      'demoIconDefaults',
    ]);
    const contract = {};
    const contracts = lowerBuiltIconContracts(
      {__iconContracts: [contract]},
      'demo',
      used,
    );
    const sources = lowerBuiltIconSources(
      {
        __iconSources: {
          close: {capabilities: contract, tree: {default: 'close'}},
        },
      },
      'icons',
      'demo',
      used,
      contracts.expression,
    );
    expect(contracts.expression(contract)).toBe('demoIconContracts1[0]');
    expect(sources.sources).toBe('demoIconSources1');
    expect(sources.icons).toBe('demoIconDefaults1');
  });
});
