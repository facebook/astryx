// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Verifies that `.ts`-authored sources (hooks and other functions) are
 * found by `findComponentSource`, so `resolveImportPath` derives a
 * tree-shakeable subpath instead of falling back to the bare package root.
 *
 * Runs against the real packages/core source, not mocks.
 */

import {describe, it, expect} from 'vitest';
import {
  findComponentSource,
  resolveImportPath,
} from './component-discovery.mjs';
import {findCoreDir} from '../utils/paths.mjs';

describe('findComponentSource resolves .ts-authored sources', () => {
  const coreDir = findCoreDir();

  it('finds a hook authored as a .ts file (not just .tsx)', () => {
    const src = findComponentSource(coreDir, 'useMediaQuery');
    expect(src).toBeTruthy();
    expect(src.endsWith('useMediaQuery.ts')).toBe(true);
  });

  it('still finds a component authored as .tsx', () => {
    const src = findComponentSource(coreDir, 'Button');
    expect(src).toBeTruthy();
    expect(src.endsWith('.tsx')).toBe(true);
  });
});

describe('resolveImportPath reproduces authored hook importPaths', () => {
  const coreDir = findCoreDir();

  // Representative sample of core hooks whose sources are `.ts` files. Before
  // the `.ts` fix these fell back to bare `@astryxdesign/core`; the derived
  // subpath must now match the value each hook's doc currently authors.
  const cases = [
    ['useMediaQuery', '@astryxdesign/core/hooks'],
    ['useResizable', '@astryxdesign/core/Resizable'],
    ['useTheme', '@astryxdesign/core/theme'],
    ['useFocusTrap', '@astryxdesign/core/hooks'],
    ['useOverflow', '@astryxdesign/core/hooks'],
  ];

  for (const [name, expected] of cases) {
    it(`${name} derives ${expected}`, () => {
      expect(resolveImportPath(coreDir, name)).toBe(expected);
    });
  }

  it('never falls back to the bare package root for a .ts hook', () => {
    for (const [name] of cases) {
      expect(resolveImportPath(coreDir, name)).not.toBe('@astryxdesign/core');
    }
  });
});
