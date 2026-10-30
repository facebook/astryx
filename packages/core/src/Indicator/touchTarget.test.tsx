// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchTarget.test.tsx
 * @input CheckboxInput, RadioList and CheckboxList rendered in jsdom, the
 *   stylesheet StyleX injects for them, the shared touch hit layer and the
 *   size token defaults
 * @output Holds the touch target token's default to the platform's control
 *   size, and that under a coarse pointer nothing grows (spec:AST-094 FR42,
 *   List FR10): a labelled CheckboxInput's row, each RadioList row and its
 *   list's gap, and every CheckboxList row at every density keep their
 *   geometry, while each carries the coarse-only invisible hit layer
 *   (utils/touchHitArea.stylex.ts) that gives the target; a tap on a
 *   checkbox's layer toggles it
 * @position Stylesheet layer of the touch hit areas; the real-engine layer is
 *   Indicator/__tests__/TouchTargets.interaction.browser.spec.ts
 */

import * as stylex from '@stylexjs/stylex';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {CheckboxInput} from '../CheckboxInput';
import {CheckboxList, CheckboxListItem} from '../CheckboxList';
import {RadioList, RadioListItem} from '../RadioList';
import {sizeDefaults} from '../theme/tokens.stylex';
import {touchHitAreaStyles} from '../utils/touchHitArea.stylex';

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

/** Whether `el` carries every class of the shared touch hit layer. */
function hasHitLayer(el: Element): boolean {
  const layer = (stylex.props(touchHitAreaStyles.layer).className ?? '')
    .split(/\s+/)
    .filter(Boolean);
  if (layer.length === 0) {
    throw new Error('the hit layer has no classes');
  }
  return layer.every(name => el.classList.contains(name));
}

function closestOrThrow(el: Element, selector: string): Element {
  const found = el.closest(selector);
  if (found == null) {
    throw new Error(`no ${selector} around the control`);
  }
  return found;
}

const TOUCH = '(pointer: coarse)';

describe('touch target size', () => {
  it('is a theme metric whose default is the platform’s control size', () => {
    // Apple's Human Interface Guidelines: iOS controls take a hit target of
    // at least 44 × 44 pt.
    expect(sizeDefaults['--size-touch-target']).toBe('44px');
  });
});

describe('CheckboxInput under a finger', () => {
  it('keeps a labelled checkbox’s row at its size and gives it the hit layer (FR42)', () => {
    render(
      <CheckboxInput label="Accept terms" value={false} onChange={() => {}} />,
    );
    const row = closestOrThrow(
      screen.getByRole('checkbox', {name: 'Accept terms'}),
      '[data-astryx-pressable]',
    );
    expect(valueOf(row, 'min-height', TOUCH)).toBeUndefined();
    expect(valueOf(row, 'min-height', null)).toBeUndefined();
    expect(hasHitLayer(row)).toBe(true);
    // The row holds the layer only under a finger; a mouse sees no change.
    expect(valueOf(row, 'position', TOUCH)).toBe('relative');
    expect(valueOf(row, 'position', null)).toBeUndefined();
  });

  it('gives a label-hidden, disabled or read-only checkbox no hit layer', () => {
    render(
      <>
        <CheckboxInput
          label="Marker"
          isLabelHidden
          value={false}
          onChange={() => {}}
        />
        <CheckboxInput
          label="Disabled"
          isDisabled
          value={false}
          onChange={() => {}}
        />
        <CheckboxInput
          label="Read-only"
          isReadOnly
          value={false}
          onChange={() => {}}
        />
      </>,
    );
    for (const name of ['Marker', 'Disabled', 'Read-only']) {
      const input = screen.getByRole('checkbox', {name});
      const row =
        input.closest('[data-astryx-pressable]') ?? input.parentElement;
      if (row == null) {
        throw new Error(`no row for ${name}`);
      }
      expect(hasHitLayer(row), name).toBe(false);
    }
  });

  it('toggles on a tap that lands on the hit layer, outside the row’s box, and not on one inside it', () => {
    const onChange = vi.fn();
    render(
      <CheckboxInput label="Accept terms" value={false} onChange={onChange} />,
    );
    const row = closestOrThrow(
      screen.getByRole('checkbox', {name: 'Accept terms'}),
      '[data-astryx-pressable]',
    );
    vi.spyOn(row, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({x: 10, y: 10, width: 200, height: 24}),
    );
    // Inside the row's own box (the gap between box and label): unchanged.
    fireEvent.click(row, {clientX: 30, clientY: 20});
    expect(onChange).not.toHaveBeenCalled();
    // Just above it, on the layer's band.
    fireEvent.click(row, {clientX: 30, clientY: 5});
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBe(true);
  });
});

describe('CheckboxList under a finger', () => {
  function rowOf(name: string): Element {
    return closestOrThrow(screen.getByRole('checkbox', {name}), 'li');
  }

  it('sets no touch row height at any density: List keeps row geometry (FR10)', () => {
    for (const density of ['compact', 'balanced', 'spacious'] as const) {
      const {unmount} = render(
        <CheckboxList
          label={`Notifications ${density}`}
          value={['email']}
          onChange={() => {}}
          density={density}>
          <CheckboxListItem
            label={`Email ${density}`}
            value="email"
            description="Weekly digest"
          />
          <CheckboxListItem label={`SMS ${density}`} value="sms" />
        </CheckboxList>,
      );
      for (const name of [`Email ${density}`, `SMS ${density}`]) {
        expect(valueOf(rowOf(name), 'min-height', TOUCH), name).toBeUndefined();
        expect(paddingBlockOf(rowOf(name), TOUCH), name).toEqual([]);
        // A row that toggles takes List's invisible hit area instead.
        expect(hasHitLayer(rowOf(name)), name).toBe(true);
      }
      unmount();
    }
  });

  it('keeps a read-only compact list at its pitch, as Markdown’s task list', () => {
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
    expect(paddingBlockOf(rowOf('Open'), TOUCH)).toEqual([]);
  });
});

describe('RadioList under a finger', () => {
  it('keeps each row’s size and the list’s gap: no touch height, padding or gap (FR42)', () => {
    for (const orientation of ['vertical', 'horizontal'] as const) {
      const {unmount} = render(
        <RadioList
          label={`Plan ${orientation}`}
          value="a"
          orientation={orientation}
          onChange={() => {}}>
          <RadioListItem label={`Option A ${orientation}`} value="a" />
          <RadioListItem label={`Option B ${orientation}`} value="b" />
        </RadioList>,
      );
      const row = closestOrThrow(
        screen.getByRole('radio', {name: `Option B ${orientation}`}),
        '.astryx-item',
      );
      expect(valueOf(row, 'min-height', TOUCH)).toBeUndefined();
      expect(paddingBlockOf(row, TOUCH)).toEqual([]);
      const touchGaps = declaredFor(screen.getByRole('radiogroup')).filter(
        rule =>
          rule.media?.startsWith(TOUCH) === true &&
          /(?:^|;\s*)(?:row-)?gap:/.test(rule.text),
      );
      expect(touchGaps).toEqual([]);
      unmount();
    }
  });

  it('gives each enabled option the hit layer and a disabled one none (FR42)', () => {
    render(
      <RadioList label="Plan" value="a" onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" isDisabled />
      </RadioList>,
    );
    const rowOf = (name: string) =>
      closestOrThrow(screen.getByRole('radio', {name}), '.astryx-item');
    expect(hasHitLayer(rowOf('Option A'))).toBe(true);
    expect(hasHitLayer(rowOf('Option B'))).toBe(false);
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
