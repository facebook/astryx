// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SelectableCardMark.test.tsx
 * @input vitest, Testing Library, SelectableCard and the UIKit constants
 *   table (motion/uikit/selection.ts)
 * @output Asserts the card's selection mark (its inset ring and its border)
 *   changes on the table's one frame under a coarse pointer and keeps the
 *   theme's duration token with a mouse
 * @position Unit test of SelectableCard's touch mark timing; the real-engine
 *   proof is Indicator/__tests__/SelectionMarks.interaction.browser.spec.ts
 */

import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {selection} from '../motion/uikit/selection';
import {SelectableCard} from './SelectableCard';

/** The `transition-duration` each media condition declares on `el`. */
function durationsOf(el: Element): Map<string | null, string> {
  const classes = el.className
    .split(/\s+/)
    .filter(Boolean)
    .map(name => `.${name}`);
  const durations = new Map<string | null, string>();
  const walk = (rules: CSSRuleList, media: string | null) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) {
        walk(rule.cssRules, rule.media.mediaText);
      } else if (
        rule instanceof CSSStyleRule &&
        // The card itself, not its press layer (`::after`).
        !rule.selectorText.includes('::') &&
        classes.some(cls => rule.selectorText.startsWith(cls))
      ) {
        const match = /transition-duration:\s*([^;]+)/.exec(rule.style.cssText);
        if (match) {
          durations.set(media, match[1].trim());
        }
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    walk(sheet.cssRules, null);
  }
  return durations;
}

describe('SelectableCard selection mark', () => {
  it('changes its ring and border in one frame under a finger, and keeps the theme’s duration with a mouse', () => {
    const {container} = render(
      <SelectableCard label="Pro plan" isSelected onChange={() => {}}>
        Pro
      </SelectableCard>,
    );
    const card = container.querySelector('.astryx-selectable-card');
    if (card == null) {
      throw new Error('the card rendered no root');
    }
    const durations = durationsOf(card);
    const coarse = [...durations].find(([media]) =>
      media?.startsWith('(pointer: coarse)'),
    );
    expect(coarse?.[1]).toBe(`${selection.mark.changeMs}ms`);
    expect(durations.get(null)).toMatch(/^var\(--duration-fast/);
  });
});
