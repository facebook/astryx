// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file circleCheck.test.tsx
 * @input vitest, Testing Library, CircleCheckIndicator, its build-time
 *   mirror and the UIKit constants table
 *   (`@astryxdesign/core/motion/experimental`)
 * @output Holds the mirror to the table (the mark clock and the multiselect
 *   circle's geometry, with the two derived xSmall values), and asserts what
 *   the circle ships: its colour change takes the table's one frame under a
 *   coarse pointer, keeps the theme's duration token with a mouse and the
 *   reduced-motion arm, and its diameter and stroke are UIKit's at each size
 * @position Unit test beside circleCheck.stylex.ts. It renders the indicator
 *   alone: the stylesheet it reads is the one StyleX injects for this
 *   component.
 */

import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {uikit} from '@astryxdesign/core/motion/experimental';
import {CircleCheckIndicator} from './CircleCheckIndicator';
import {circleCheckConsts} from './circleCheck.stylex';

const {large, xSmall} = uikit.selection.multiselectCircle;

/** Every declaration on `el`'s own classes, keyed by property, per media. */
function declarationsOf(el: Element): Map<string, Map<string | null, string>> {
  const classes = el.className
    .split(/\s+/)
    .filter(Boolean)
    .map(name => `.${name}`);
  const out = new Map<string, Map<string | null, string>>();
  const walk = (rules: CSSRuleList, media: string | null) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) {
        walk(rule.cssRules, rule.media.mediaText);
      } else if (
        rule instanceof CSSStyleRule &&
        classes.some(cls => rule.selectorText.startsWith(cls))
      ) {
        for (const property of Array.from(rule.style)) {
          const byMedia = out.get(property) ?? new Map();
          byMedia.set(media, rule.style.getPropertyValue(property).trim());
          out.set(property, byMedia);
        }
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    walk(sheet.cssRules, null);
  }
  return out;
}

/** A CSS length or duration as a number (px, or ms; `0s` is written so). */
function toNumber(value: string | undefined): number {
  if (value == null) {
    return Number.NaN;
  }
  if (value.endsWith('ms') || value.endsWith('px')) {
    return parseFloat(value);
  }
  return value.endsWith('s') ? parseFloat(value) * 1000 : parseFloat(value);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

describe('circleCheckConsts mirror the constants table', () => {
  it('takes the mark clock', () => {
    expect(toNumber(circleCheckConsts.markChangeMs)).toBe(
      uikit.selection.mark.changeMs,
    );
  });

  it('takes the circle at the Large text size for md', () => {
    expect(toNumber(circleCheckConsts.mdDiameter)).toBe(large.diameter);
    expect(toNumber(circleCheckConsts.mdStroke)).toBe(large.stroke);
    expect(toNumber(circleCheckConsts.mdCheckSize)).toBe(large.checkSize);
    expect(toNumber(circleCheckConsts.mdCheckStroke)).toBe(large.checkStroke);
    expect(toNumber(circleCheckConsts.mdCheckOffsetY)).toBe(large.checkOffsetY);
  });

  it('takes the circle at the xSmall text size for sm, deriving what was not measured there', () => {
    expect(toNumber(circleCheckConsts.smDiameter)).toBe(xSmall.diameter);
    expect(toNumber(circleCheckConsts.smStroke)).toBe(xSmall.stroke);
    expect(toNumber(circleCheckConsts.smCheckSize)).toBe(xSmall.checkSize);
    expect(toNumber(circleCheckConsts.smCheckStroke)).toBe(
      round2((large.checkStroke * xSmall.checkSize) / large.checkSize),
    );
    expect(toNumber(circleCheckConsts.smCheckOffsetY)).toBe(
      round2((large.checkOffsetY * xSmall.diameter) / large.diameter),
    );
  });
});

describe('CircleCheckIndicator ships the table', () => {
  function circle(size: 'sm' | 'md'): Element {
    render(<CircleCheckIndicator state="checked" size={size} />);
    const el = document.querySelector(
      `.astryx-circle-check-indicator[data-size="${size}"]`,
    );
    if (el == null) {
      throw new Error('no circle');
    }
    return el;
  }

  it('changes in one frame under a finger, keeps the theme’s fade with a mouse and none under reduced motion', () => {
    const durations =
      declarationsOf(circle('md')).get('transition-duration') ?? new Map();
    // StyleX keeps sibling media arms exclusive, so the coarse arm reads
    // "(pointer: coarse) and (not (prefers-reduced-motion: reduce))".
    const coarse = [...durations].find(([media]) =>
      media?.startsWith('(pointer: coarse)'),
    );
    expect(toNumber(coarse?.[1])).toBe(uikit.selection.mark.changeMs);
    expect(durations.get(null)).toMatch(/^var\(--duration-fast/);
    expect(durations.get('(prefers-reduced-motion: reduce)')).toBe('0s');
  });

  it.each([
    ['md', large],
    ['sm', xSmall],
  ] as const)(
    'draws the %s circle at UIKit’s diameter and stroke',
    (size, row) => {
      const declared = declarationsOf(circle(size));
      expect(toNumber(declared.get('width')?.get(null))).toBe(row.diameter);
      expect(toNumber(declared.get('height')?.get(null))).toBe(row.diameter);
      // The ring is an inset shadow of this width (a border would snap to
      // whole device pixels).
      expect(toNumber(declared.get('--_circle-stroke')?.get(null))).toBe(
        row.stroke,
      );
    },
  );

  it('draws the empty ring as an inset shadow of the stroke, and the filled circle without one', () => {
    render(<CircleCheckIndicator state="unchecked" size="md" />);
    const empty = document.querySelector(
      '.astryx-circle-check-indicator:not([data-checked])',
    );
    if (empty == null) {
      throw new Error('no empty circle');
    }
    expect(declarationsOf(empty).get('box-shadow')?.get(null)).toMatch(
      /^inset 0 0 0 var\(--_circle-stroke\)/,
    );
    render(<CircleCheckIndicator state="checked" size="md" />);
    const filled = document.querySelector(
      '.astryx-circle-check-indicator[data-checked="checked"]',
    );
    if (filled == null) {
      throw new Error('no filled circle');
    }
    expect(declarationsOf(filled).get('box-shadow')?.get(null)).toBe('none');
  });
});
