// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Static guard: form controls inherit letter-spacing.
 *
 * `letter-spacing` is not part of the `font` shorthand, and the browser's
 * stylesheet sets it to `normal` on form controls, so `font: inherit` alone
 * leaves them untracked. reset.letter-spacing.a11y.browser.spec.ts measures
 * the result in a browser.
 */

import fs from 'fs';
import path from 'path';

import {describe, expect, it} from 'vitest';

describe('reset.css form controls and letter-spacing', () => {
  it('inherits letter-spacing beside font and color', () => {
    const stripped = fs
      .readFileSync(path.resolve(__dirname, './reset.css'), 'utf-8')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    const formRule = [...stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(
      ([, selector]) =>
        selector.trim() === ':where(button, input, optgroup, select, textarea)',
    );
    expect(formRule).toBeDefined();
    const declarations = formRule![2]
      .split(';')
      .map(declaration => declaration.trim())
      .filter(Boolean);
    expect(declarations).toEqual(
      expect.arrayContaining([
        'font: inherit',
        'letter-spacing: inherit',
        'color: inherit',
      ]),
    );
  });
});
