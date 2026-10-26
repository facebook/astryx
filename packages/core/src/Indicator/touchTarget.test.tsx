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
import {CheckboxList, CheckboxListItem} from '../CheckboxList';
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

describe('CheckboxList under a finger', () => {
  function rowOf(name: string): Element {
    const row = screen.getByRole('checkbox', {name}).closest('li');
    if (row == null) {
      throw new Error(`no row for ${name}`);
    }
    return row;
  }

  it('makes a compact list’s rows that toggle at least the touch target tall', () => {
    // A standalone CheckboxList is a touch target whatever its density
    // (requirement 2 of the target-size decision).
    render(
      <CheckboxList
        label="Notifications"
        value={['email']}
        onChange={() => {}}
        density="compact">
        <CheckboxListItem label="Email" value="email" />
        <CheckboxListItem label="SMS" value="sms" isDisabled />
      </CheckboxList>,
    );
    for (const name of ['Email', 'SMS']) {
      expect(valueOf(rowOf(name), 'min-height', TOUCH)).toBe(TARGET);
      expect(valueOf(rowOf(name), 'min-height', null)).toBeUndefined();
    }
  });

  it('keeps a read-only compact list at its pitch, as Markdown’s task list', () => {
    // A read-only row with no action of its own is not a target
    // (requirement 3: Markdown's task items do not grow).
    render(
      <CheckboxList
        label="Tasks"
        isLabelHidden
        value={['done']}
        onChange={() => {}}
        isReadOnly
        density="compact">
        <CheckboxListItem label="Done" value="done" />
        <CheckboxListItem label="Open" value="open" />
      </CheckboxList>,
    );
    expect(valueOf(rowOf('Open'), 'min-height', TOUCH)).toBeUndefined();
  });

  it('makes balanced rows that toggle at least the taller of the touch target and the list’s row height', () => {
    // A theme that raises the touch target raises these rows too; at the
    // default they keep List's touch row heights (52 px, 62 px with a
    // description).
    render(
      <CheckboxList label="Notifications" value={[]} onChange={() => {}}>
        <CheckboxListItem label="Email" value="email" />
        <CheckboxListItem
          label="SMS"
          value="sms"
          description="Standard rates apply"
        />
      </CheckboxList>,
    );
    // StyleX writes the value without the space after the comma.
    const touchFloor = (name: string) =>
      valueOf(rowOf(name), 'min-height', TOUCH)?.replace(/\s+/g, '');
    expect(touchFloor('Email')).toBe(`max(${TARGET},52px)`);
    expect(touchFloor('SMS')).toBe(`max(${TARGET},62px)`);
    expect(valueOf(rowOf('Email'), 'min-height', null)).toBeUndefined();
  });

  it('keeps a read-only balanced list on the list’s row height', () => {
    render(
      <CheckboxList
        label="Tasks"
        value={['done']}
        onChange={() => {}}
        isReadOnly>
        <CheckboxListItem label="Done" value="done" />
      </CheckboxList>,
    );
    expect(valueOf(rowOf('Done'), 'min-height', TOUCH)).toBe('52px');
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
