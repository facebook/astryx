// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file experimental.test.ts
 * @input The `@astryxdesign/core/keyboard/experimental` entry, the package
 *   root, the hooks and utils subpaths, and package.json's exports map
 * @output Proof that the experimental keyboard surface is exported where
 *   spec:AST-017 FR21 puts it and nowhere else
 * @position Testing for /packages/core/src/keyboard/experimental.ts
 */

import {describe, expect, it} from 'vitest';
import pkg from '../../package.json';
import * as hooks from '../hooks';
import * as root from '../index';
import * as utils from '../utils';
import * as keyboard from './experimental';

const NAMES = ['getKeyboardLayoutGuide', 'useKeyboardLayoutGuide'] as const;

describe('@astryxdesign/core/keyboard/experimental', () => {
  it('exports the keyboard layout guide', () => {
    for (const name of NAMES) {
      expect(keyboard[name], name).toBeTypeOf('function');
    }
    const guide = keyboard.getKeyboardLayoutGuide(window);
    expect(guide).toBe(keyboard.getKeyboardLayoutGuide(window));
    expect(guide.inset).toBe(0);
  });

  it('is a subpath of its own, never re-exported from the root or an ordinary subpath', () => {
    expect(pkg.exports['./keyboard/experimental']).toMatchObject({
      source: './src/keyboard/experimental.ts',
    });
    for (const name of NAMES) {
      expect(name in root, `root re-exports ${name}`).toBe(false);
      expect(name in hooks, `hooks re-exports ${name}`).toBe(false);
      expect(name in utils, `utils re-exports ${name}`).toBe(false);
    }
  });
});
