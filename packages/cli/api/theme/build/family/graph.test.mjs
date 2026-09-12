// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file graph.test.mjs
 * @input Loaded family members with exact source and extends identity
 * @output AST-034 graph validation, canonical order, and stable digest
 * @position Focused tests for the private family graph planner
 */

import {describe, expect, it} from 'vitest';
import {buildFamilyGraph} from './graph.mjs';

function entry(name, sourceId, parent, extra = {}) {
  const theme = {name, tokens: {}, ...extra};
  return {
    sourceId,
    sourceBytes: `export const ${name.replaceAll('-', '_')} = ${name};\n`,
    theme,
    rawInput: parent ? {name, extends: parent} : {name},
  };
}

function familyEntries() {
  const ocean = entry('ocean', 'themes/ocean.ts', null);
  const deep = entry('ocean-deep', 'themes/ocean-deep.ts', ocean.theme);
  const midnight = entry(
    'ocean-midnight',
    'themes/ocean-midnight.ts',
    deep.theme,
  );
  const soft = entry('ocean-soft', 'themes/ocean-soft.ts', ocean.theme);
  return {ocean, deep, midnight, soft};
}

describe('buildFamilyGraph', () => {
  it('recomputes the least eligible member after every emitted node', () => {
    const {ocean, deep, midnight, soft} = familyEntries();
    const graph = buildFamilyGraph([soft, midnight, ocean, deep]);

    expect(graph.rootName).toBe('ocean');
    expect(graph.order.map(node => node.name)).toEqual([
      'ocean',
      'ocean-deep',
      'ocean-midnight',
      'ocean-soft',
    ]);
    expect(graph.order.map(node => node.parentName)).toEqual([
      null,
      'ocean',
      'ocean-deep',
      'ocean',
    ]);
  });

  it('produces the same graph identity for shuffled inputs', () => {
    const {ocean, deep, midnight, soft} = familyEntries();
    const first = buildFamilyGraph([ocean, deep, midnight, soft]);
    const second = buildFamilyGraph([soft, midnight, deep, ocean]);

    expect(second.sourceGraphDigest).toBe(first.sourceGraphDigest);
    expect(second.order.map(node => node.sourceId)).toEqual(
      first.order.map(node => node.sourceId),
    );
  });

  it('rejects duplicate names, object identities, and source identities', () => {
    const base = entry('ocean', 'themes/ocean.ts', null);
    const duplicateName = entry('ocean', 'themes/other.ts', null);
    expect(() => buildFamilyGraph([base, duplicateName])).toThrow(
      /duplicate theme name/i,
    );

    expect(() =>
      buildFamilyGraph([
        base,
        {...base, sourceId: 'themes/reexport.ts'},
      ]),
    ).toThrow(/same theme object/i);

    expect(() =>
      buildFamilyGraph([
        base,
        entry('ocean-deep', 'themes/ocean.ts', base.theme),
      ]),
    ).toThrow(/source identity/i);
  });

  it('rejects multiple roots, missing ancestors, and cycles', () => {
    const base = entry('ocean', 'themes/ocean.ts', null);
    expect(() =>
      buildFamilyGraph([
        base,
        entry('stray', 'themes/stray.ts', null),
      ]),
    ).toThrow(/exactly one root/i);

    expect(() =>
      buildFamilyGraph([
        base,
        entry('ocean-deep', 'themes/ocean-deep.ts', {name: 'missing'}),
      ]),
    ).toThrow(/missing selected ancestor/i);

    const a = entry('a', 'themes/a.ts', null);
    const b = entry('b', 'themes/b.ts', a.theme);
    a.rawInput.extends = b.theme;
    expect(() => buildFamilyGraph([a, b])).toThrow(/cycle/i);
  });

  it('rejects an exact parent edge that disagrees with enrolled lineage', () => {
    const base = entry('ocean', 'themes/ocean.ts', null, {
      localTokens: {'--demo-ink': '#000'},
      __localTokenOwners: {'--demo-ink': 'ocean'},
      __localTokenLineage: ['ocean'],
    });
    const child = entry('ocean-deep', 'themes/ocean-deep.ts', base.theme, {
      localTokens: {'--demo-ink': '#111'},
      __localTokenOwners: {'--demo-ink': 'ocean'},
      __localTokenLineage: ['different-base', 'ocean-deep'],
    });

    expect(() => buildFamilyGraph([base, child])).toThrow(
      /disagrees with.*lineage/i,
    );
  });
});
