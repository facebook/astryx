// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file babel.test.mjs
 * @description Verifies that the XDS babel wrapper applies the configured
 *   library StyleX class-name prefix to XDS library files. Part of the
 *   the library atom prefix defaults to `astryx` and is configurable
 *   before the final cutover.
 */

import {describe, it, expect} from 'vitest';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const babel = require('@babel/core');
const astryxBabelPlugin = require('./babel.js');

const SOURCE = `
import * as stylex from '@stylexjs/stylex';
export const styles = stylex.create({
  box: {color: 'red'},
});
`;

/**
 * Transform a StyleX source through the XDS babel wrapper as if it were a
 * library file, returning the emitted code. `libraryPrefix` controls the
 * atomic class-name prefix for library files.
 */
function transformLibraryFile(libraryPrefix) {
  const result = babel.transformSync(SOURCE, {
    // A path matching one of the library patterns so the wrapper routes it
    // through the library plugin instance.
    filename: 'node_modules/@astryxdesign/core/src/Box/XDSBox.tsx',
    babelrc: false,
    configFile: false,
    plugins: [
      [
        astryxBabelPlugin,
        {
          ...(libraryPrefix ? {libraryPrefix} : {}),
          unstable_moduleResolution: {type: 'commonJS', rootDir: process.cwd()},
        },
      ],
    ],
  });
  return result?.code ?? '';
}

/** Extract the StyleX atomic class names referenced in the emitted code. */
function atomicClasses(code) {
  // StyleX emits atoms like "xds1a2b3c" / "astryx1a2b3c" in the compiled output.
  return code.match(/\b(?:xds|astryx|lib)[a-z0-9]{4,}\b/g) ?? [];
}

describe('xds babel wrapper -- library StyleX prefix', () => {
  it('defaults library atoms to the `astryx` prefix', () => {
    const code = transformLibraryFile(undefined);
    const atoms = atomicClasses(code);
    expect(atoms.length).toBeGreaterThan(0);
    expect(atoms.every(c => c.startsWith('astryx'))).toBe(true);
    expect(
      atoms.some(c => c.startsWith('xds') && !c.startsWith('astryx')),
    ).toBe(false);
  });

  it('uses a configured custom prefix for library atoms', () => {
    const code = transformLibraryFile('lib');
    const atoms = atomicClasses(code);
    expect(atoms.length).toBeGreaterThan(0);
    expect(atoms.every(c => c.startsWith('lib'))).toBe(true);
  });
});
