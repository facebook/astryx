// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchTarget.test.tsx
 * @input vitest, the UIKit constants table (motion/uikit/list.ts), the
 *   build-time mirror and the controls that compose it (CheckboxInput,
 *   RadioList)
 * @output Holds the mirror to the table, and asserts what each control
 *   ships under a coarse pointer: a CheckboxInput row and a RadioList row at
 *   least the control size tall, the checkbox's native input at least the
 *   control size each way, and no gap between radio rows; nothing for a
 *   mouse
 * @position Unit test beside Indicator/touchTarget.stylex.ts; the
 *   real-engine geometry and taps are
 *   Indicator/__tests__/TouchTargets.interaction.browser.spec.ts
 */

import * as stylex from '@stylexjs/stylex';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {list} from '../motion/uikit/list';
import {CheckboxInput} from '../CheckboxInput';
import {RadioList, RadioListItem} from '../RadioList';
import {touchTargetConsts, touchTargetStyles} from './touchTarget.stylex';

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
const SIZE = `${list.metrics.controlSize}px`;

describe('touch target size', () => {
  it('is the constants table’s control size, mirrored for the stylesheet', () => {
    expect(touchTargetConsts.controlSize).toBe(SIZE);
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
    expect(valueOf(row, 'min-height', TOUCH)).toBe(SIZE);
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
  it('makes each row at least the control size tall, with no gap between rows', () => {
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
    expect(valueOf(row, 'min-height', TOUCH)).toBe(SIZE);
    expect(valueOf(row, 'min-height', null)).toBeUndefined();
    // StyleX keeps the gap's arms exclusive.
    const gaps = declaredFor(group).filter(rule =>
      /(?:^|;\s*)(?:row-)?gap:/.test(rule.text),
    );
    const touchGap = gaps.find(rule => rule.media?.startsWith(TOUCH));
    expect(touchGap?.text).toMatch(/gap:\s*0(px)?\b/);
  });
});
