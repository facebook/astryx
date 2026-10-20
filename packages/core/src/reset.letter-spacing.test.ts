// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Static guard: buttons, inputs and textareas inherit letter-spacing, and a
 * select keeps the browser's.
 *
 * `letter-spacing` is not part of the `font` shorthand, and the browser's
 * stylesheet sets it to `normal` on form controls, so `font: inherit` alone
 * leaves them untracked. A select stays out: Firefox does not widen it for
 * letter-spacing, so a tracked label would be clipped.
 * reset.letter-spacing.a11y.browser.spec.ts measures the result in a browser.
 */

import fs from 'fs';
import path from 'path';

import {describe, expect, it} from 'vitest';

const rules = [
  ...fs
    .readFileSync(path.resolve(__dirname, './reset.css'), 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .matchAll(/([^{}]+)\{([^{}]*)\}/g),
].map(([, selector, body]) => ({
  selector: selector.trim(),
  declarations: body
    .split(';')
    .map(declaration => declaration.trim())
    .filter(Boolean),
}));

describe('reset.css form controls and letter-spacing', () => {
  it('makes buttons, inputs and textareas inherit letter-spacing', () => {
    const rule = rules.find(
      ({selector}) => selector === ':where(button, input, textarea)',
    );
    expect(rule?.declarations).toEqual(['letter-spacing: inherit']);
  });

  it('leaves a select and its options to the browser letter-spacing', () => {
    const touching = rules.filter(
      ({selector, declarations}) =>
        /\b(select|optgroup|option)\b/.test(selector) &&
        declarations.some(declaration =>
          declaration.startsWith('letter-spacing'),
        ),
    );
    expect(touching).toEqual([]);
  });
});
