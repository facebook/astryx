// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Static guard for the reset's link rule.
 *
 * Links inherit their text decoration. Chromium and Safari 26.2 and later
 * read `text-decoration` as the full shorthand (line, style, color and
 * thickness). Safari 17 through 26.1 read it as the line alone: there the
 * prefixed `-webkit-text-decoration` carries the style and color, and the
 * thickness is in no shorthand, so the rule names it on its own. In those
 * versions a link inside decorated text otherwise draws its own solid,
 * current-color line over the parent's.
 */

import fs from 'fs';
import path from 'path';

import {describe, expect, it} from 'vitest';

describe('reset.css link decoration', () => {
  it('inherits every text-decoration longhand, in older Safari too', () => {
    const stripped = fs
      .readFileSync(path.resolve(__dirname, './reset.css'), 'utf-8')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    const linkRule = [...stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(
      ([, selector]) => selector.trim() === ':where(a)',
    );
    expect(linkRule).toBeDefined();
    const declarations = linkRule![2]
      .split(';')
      .map(declaration => declaration.trim())
      .filter(Boolean);
    expect(declarations).toEqual(
      expect.arrayContaining([
        '-webkit-text-decoration: inherit',
        'text-decoration: inherit',
        'text-decoration-thickness: inherit',
      ]),
    );
  });
});
