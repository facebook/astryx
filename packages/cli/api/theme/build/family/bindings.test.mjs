// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {allocateImportBindings, allocateMemberBindings} from './bindings.mjs';

describe('family binding allocation', () => {
  it('makes colliding member names deterministic and legal', () => {
    const bindings = allocateMemberBindings(
      ['ocean-deep', 'oceanDeep', 'default', 'Defined', '__astryx-pick'],
      ['DefinedTheme', '__astryxPickTheme'],
    );
    expect([...bindings.values()]).toEqual([
      'oceanDeepTheme',
      'oceanDeepTheme_2',
      '_defaultTheme',
      'DefinedTheme_2',
      '__astryxPickTheme_2',
    ]);
  });

  it('deduplicates identical imports and disambiguates source-local collisions', () => {
    const allocation = allocateImportBindings(
      [
        {
          id: 'base-icons',
          specifier: './base.mjs',
          importedName: 'registry',
          sourceLocalName: 'assets',
        },
        {
          id: 'base-icons-again',
          specifier: './base.mjs',
          importedName: 'registry',
          sourceLocalName: 'otherName',
        },
        {
          id: 'child-icons',
          specifier: './child.mjs',
          importedName: 'registry',
          sourceLocalName: 'assets',
        },
        {
          id: 'source-fallback',
          specifier: './source.mjs',
          importedName: '*',
          importKind: 'namespace',
          sourceLocalName: '__astryxPickTheme',
        },
      ],
      ['oceanTheme', '__astryxPickTheme'],
    );

    expect(allocation.imports).toHaveLength(3);
    expect(allocation.byRequest.get('base-icons-again')).toBe(
      allocation.byRequest.get('base-icons'),
    );
    expect(allocation.byRequest.get('child-icons')).toBe('assets_2');
    expect(allocation.byRequest.get('source-fallback')).toBe(
      '__astryxPickTheme_2',
    );
  });
});
