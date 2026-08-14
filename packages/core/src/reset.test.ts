// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Tests for reset.css invariants that components rely on.
 *
 * reset.css is a plain stylesheet, so these tests assert on its source
 * text (same approach as the reset.css baseline checks in
 * theme/onMediaTokens.test.ts and AspectRatio/AspectRatio.test.tsx).
 */

import fs from 'fs';
import path from 'path';

import {beforeAll, describe, expect, it} from 'vitest';

describe('reset.css accessibility invariants', () => {
  let ruleBlocks: {selector: string; body: string}[];

  beforeAll(() => {
    const resetCSS = fs.readFileSync(
      path.resolve(__dirname, './reset.css'),
      'utf-8',
    );
    // Strip comments, then collect every innermost `selector { body }`
    // block. `[^{}]` keeps at-rule preludes (@media, @layer) out of the
    // selector capture, since their own `{` terminates any earlier match.
    const stripped = resetCSS.replace(/\/\*[\s\S]*?\*\//g, '');
    ruleBlocks = [...stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
      ([, selector, body]) => ({selector: selector.trim(), body}),
    );
  });

  it('parses rule blocks out of reset.css', () => {
    // Guards the WCAG assertion below against silently passing if the
    // block parsing ever breaks.
    expect(ruleBlocks.length).toBeGreaterThan(20);
    expect(
      ruleBlocks.some(({body}) => body.includes('box-sizing: border-box')),
    ).toBe(true);
  });

  /**
   * WCAG 2.4.7 (Focus Visible, Level AA): keyboard focus indicators must
   * not be suppressed. `:focus-visible` only matches keyboard-style focus,
   * so any `outline: none` on it removes the focus indicator for keyboard
   * users — and a `@media (hover: none) and (pointer: coarse)` guard does
   * not exempt keyboard users on coarse-pointer devices (iPad/phone with a
   * Bluetooth keyboard, switch-control users).
   */
  it('does not suppress :focus-visible outlines (WCAG 2.4.7)', () => {
    const focusVisibleBlocks = ruleBlocks.filter(({selector}) =>
      selector.includes(':focus-visible'),
    );
    for (const {selector, body} of focusVisibleBlocks) {
      expect
        .soft(body, `":focus-visible" rule "${selector}" must keep the outline`)
        .not.toMatch(/outline(?:-style|-width)?\s*:\s*(?:none|0)/);
    }
  });
});
