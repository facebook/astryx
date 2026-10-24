// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectionMotion.test.ts
 * @input vitest, the UIKit constants table (motion/uikit/selection.ts), the
 *   build-time mirror and the checkbox and radio indicators
 * @output Holds the mirror to the table, and asserts what each mark ships:
 *   its colour change takes the table's one frame under a coarse pointer,
 *   keeps the theme's duration token otherwise, and keeps the reduced-motion
 *   arm
 * @position Unit test beside Indicator/selectionMotion.stylex.ts; the
 *   real-engine proof (a tap's first frame, storyboard, busy main thread) is
 *   Indicator/__tests__/SelectionMarks.interaction.browser.spec.ts
 */

import {createElement} from 'react';
import {render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {selection} from '../motion/uikit/selection';
import {CheckboxIndicator} from './CheckboxIndicator';
import {RadioIndicator} from './RadioIndicator';
import {selectionMotionConsts} from './selectionMotion.stylex';

interface Declared {
  media: string | null;
  text: string;
}

/**
 * Every injected rule that names one of the element's classes, with the
 * media condition it sits in (null at the top level).
 */
function declaredFor(el: Element): Declared[] {
  const classes = el.className
    .split(/\s+/)
    .filter(Boolean)
    .map(name => `.${name}`);
  const out: Declared[] = [];
  const walk = (list: CSSRuleList, media: string | null) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSMediaRule) {
        walk(rule.cssRules, rule.media.mediaText);
      } else if (rule instanceof CSSStyleRule) {
        if (classes.some(cls => rule.selectorText.startsWith(cls))) {
          out.push({media, text: rule.style.cssText});
        }
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    walk(sheet.cssRules, null);
  }
  return out;
}

/** The `transition-duration` each media condition declares on `el`. */
function durationsOf(el: Element): Map<string | null, string> {
  const durations = new Map<string | null, string>();
  for (const {media, text} of declaredFor(el)) {
    const match = /transition-duration:\s*([^;]+)/.exec(text);
    if (match) {
      durations.set(media, match[1].trim());
    }
  }
  return durations;
}

describe('selection mark clock', () => {
  it('is the constants table’s mark change, mirrored for the stylesheet', () => {
    expect(selectionMotionConsts.markChangeMs).toBe(selection.mark.changeMs);
  });

  it('is one frame: iOS never animates a selection mark', () => {
    expect(selection.mark.changeMs).toBe(0);
  });
});

type MarkState = 'checked' | 'unchecked';

describe.each<[string, (state: MarkState) => ReturnType<typeof createElement>]>(
  [
    [
      'CheckboxIndicator',
      state => createElement(CheckboxIndicator, {state, size: 'md'}),
    ],
    [
      'RadioIndicator',
      state => createElement(RadioIndicator, {state, size: 'md'}),
    ],
  ],
)('%s', (_name, element) => {
  function mark(state: MarkState): Element {
    const {container} = render(element(state));
    const root = container.firstElementChild;
    if (root == null) {
      throw new Error('the indicator rendered nothing');
    }
    return root;
  }

  it('changes its colour in one frame under a finger', () => {
    const durations = durationsOf(mark('checked'));
    // StyleX keeps sibling media arms exclusive, so the coarse arm reads
    // "(pointer: coarse) and (not (prefers-reduced-motion: reduce))".
    const coarse = [...durations].find(([media]) =>
      media?.startsWith('(pointer: coarse)'),
    );
    expect(coarse?.[1]).toBe(`${selection.mark.changeMs}ms`);
  });

  it('keeps the theme’s duration token with a mouse, and the reduced-motion arm', () => {
    const durations = durationsOf(mark('unchecked'));
    expect(durations.get(null)).toMatch(/^var\(--duration-fast/);
    expect(durations.get('(prefers-reduced-motion: reduce)')).toBe('0s');
  });
});
