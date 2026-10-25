// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchTarget.test.tsx
 * @input vitest, the theme's touch target size (`--size-touch-target`) and
 *   the controls that read it (CheckboxInput, RadioList)
 * @output Holds the token's default to the platform's control size, and
 *   asserts what each
 *   control ships under a coarse pointer: a CheckboxInput row and a RadioList
 *   row at least the touch target tall, the checkbox's native input at least
 *   that each way, and a vertical list's gap turned into its rows' padding;
 *   nothing for a mouse
 * @position Unit test beside Indicator/touchTarget.stylex.ts; the
 *   real-engine geometry and taps are
 *   Indicator/__tests__/TouchTargets.interaction.browser.spec.ts
 */

import * as stylex from '@stylexjs/stylex';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {CheckboxInput} from '../CheckboxInput';
import {RadioList, RadioListItem} from '../RadioList';
import {sizeDefaults} from '../theme/tokens.stylex';
import {touchTargetStyles} from './touchTarget.stylex';

interface Declared {
  media: string | null;
  text: string;
}

/** Every injected rule naming one of the element's classes, with its media. */
function declaredFor(el: Element): Declared[] {
  const classes = el.className
    .split(/\s+/)
    .filter(Boolean)
    .map(name => `.${name}`);
  const out: Declared[] = [];
  const walk = (rules: CSSRuleList, media: string | null) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) {
        walk(rule.cssRules, rule.media.mediaText);
      } else if (
        rule instanceof CSSStyleRule &&
        classes.some(cls => rule.selectorText.startsWith(cls))
      ) {
        out.push({media, text: rule.style.cssText});
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    walk(sheet.cssRules, null);
  }
  return out;
}

/** The value `property` takes on `el` under `media` (null: unconditionally). */
function valueOf(
  el: Element,
  property: string,
  media: string | null,
): string | undefined {
  for (const rule of declaredFor(el)) {
    if (rule.media !== media) {
      continue;
    }
    const match = new RegExp(`(?:^|;\\s*)${property}:\\s*([^;]+)`).exec(
      rule.text,
    );
    if (match) {
      return match[1].trim();
    }
  }
  return undefined;
}

const TOUCH = '(pointer: coarse)';
const TARGET = 'var(--size-touch-target)';

describe('touch target size', () => {
  it('is a theme metric whose default is the platform’s control size', () => {
    // Apple's Human Interface Guidelines: iOS controls take a hit target of
    // at least 44 × 44 pt.
    expect(sizeDefaults['--size-touch-target']).toBe('44px');
  });
});

describe('CheckboxInput under a finger', () => {
  it('makes the row at least the control size tall and the input at least that square', () => {
    render(
      <CheckboxInput label="Accept terms" value={false} onChange={() => {}} />,
    );
    const input = screen.getByRole('checkbox', {name: 'Accept terms'});
    const row = input.closest('[data-astryx-pressable]');
    if (row == null) {
      throw new Error('the checkbox has no row');
    }
    expect(valueOf(row, 'min-height', TOUCH)).toBe(TARGET);
    // jsdom drops logical sizes from its style objects, so the input is
    // checked for the control target's classes; the engines measure it.
    const control = (stylex.props(touchTargetStyles.control).className ?? '')
      .split(/\s+/)
      .filter(Boolean);
    expect(control.length).toBeGreaterThan(0);
    for (const name of control) {
      expect(input.classList.contains(name)).toBe(true);
    }
    // A mouse keeps the drawn sizes.
    expect(valueOf(row, 'min-height', null)).toBeUndefined();
  });
});

describe('RadioList under a finger', () => {
  it('makes each row at least the touch target tall, sharing the list’s gap as padding', () => {
    render(
      <RadioList label="Plan" value="a" onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" />
      </RadioList>,
    );
    const radio = screen.getByRole('radio', {name: 'Option B'});
    const row = radio.closest('.astryx-item');
    const group = screen.getByRole('radiogroup');
    if (row == null) {
      throw new Error('the radio has no row');
    }
    expect(valueOf(row, 'min-height', TOUCH)).toBe(TARGET);
    expect(valueOf(row, 'min-height', null)).toBeUndefined();
    // The gap becomes the rows' own: half of it above and below each row.
    // StyleX keeps the gap's arms exclusive.
    const gaps = declaredFor(group).filter(rule =>
      /(?:^|;\s*)(?:row-)?gap:/.test(rule.text),
    );
    const touchGap = gaps.find(rule => rule.media?.startsWith(TOUCH));
    expect(touchGap?.text).toMatch(/gap:\s*0(px)?\b/);
    const halfGap = 'calc(var(--spacing-2) / 2)';
    expect(paddingBlockOf(row, TOUCH)).toEqual([halfGap, halfGap]);
    // A mouse keeps the bare row.
    expect(paddingBlockOf(row, null)).toEqual(['0', '0']);
  });

  it('keeps a horizontal option’s row floor without the gap padding', () => {
    render(
      <RadioList
        label="Plan"
        value="a"
        orientation="horizontal"
        onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" />
      </RadioList>,
    );
    const row = screen
      .getByRole('radio', {name: 'Option B'})
      .closest('.astryx-item');
    if (row == null) {
      throw new Error('the radio has no row');
    }
    expect(valueOf(row, 'min-height', TOUCH)).toBe(TARGET);
    expect(paddingBlockOf(row, TOUCH)).toEqual([]);
  });
});

/** The block padding `el` declares under `media`, as [start, end]. */
function paddingBlockOf(el: Element, media: string | null): string[] {
  const both = valueOf(el, 'padding-block', media);
  if (both != null) {
    const [start, end = start] = both.split(/\s+(?![^(]*\))/);
    return [start, end];
  }
  const start =
    valueOf(el, 'padding-top', media) ??
    valueOf(el, 'padding-block-start', media);
  const end =
    valueOf(el, 'padding-bottom', media) ??
    valueOf(el, 'padding-block-end', media);
  return start == null && end == null ? [] : [start ?? '', end ?? ''];
}
