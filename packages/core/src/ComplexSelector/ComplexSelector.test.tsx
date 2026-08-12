// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ComplexSelector.test.tsx
 * @input Uses vitest, Testing Library, user-event
 * @output Unit tests for ComplexSelector
 * @position Tests; validates custom content, async actions, and dialog composition
 *
 * SYNC: When ComplexSelector.tsx API changes, update these tests.
 */

import {describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ComplexSelector} from './ComplexSelector';

type FruitValue = {
  fruit: 'Apple' | 'Banana';
  ripeness: 'Crisp' | 'Ripe' | 'Juicy';
};

const FRUITS = ['Apple', 'Banana'] as const;
const RIPENESS = ['Crisp', 'Ripe', 'Juicy'] as const;
const h = {hidden: true} as const;

/**
 * Selectors of the compiled rules that PAINT an outline on `el`'s own classes.
 *
 * StyleX injects its CSS at runtime under test, so the shipped rule text is
 * readable here — the only way to check which pseudo-class gates the ring,
 * since jsdom resolves neither `:has()` nor layout. `outline: none` /
 * zero-width declarations are skipped: they suppress a ring rather than draw
 * one.
 */
function outlineRulesFor(el: HTMLElement): string[] {
  const classes = Array.from(el.classList);
  const sheets = Array.from(document.styleSheets);
  const cssTexts: string[] = [];
  for (const sheet of sheets) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        cssTexts.push(rule.cssText);
      }
    } catch {
      // ignore sheets jsdom refuses to read
    }
  }
  for (const style of Array.from(document.querySelectorAll('style'))) {
    // Runtime-injected text is not always exposed as parsed cssRules.
    cssTexts.push(...(style.textContent || '').split('}').map(s => s + '}'));
  }

  const paints = /outline(-width|-style)?\s*:\s*(?!none|0|initial)/;
  const suppresses = /outline(-width|-style)?\s*:\s*(none|0)\b/;
  const selectors: string[] = [];
  for (const text of cssTexts) {
    const selector = text.split('{')[0].trim();
    if (!selector) {
      continue;
    }
    const onThisElement = classes.some(cls =>
      new RegExp(`\\.${cls}(?![\\w-])`).test(selector),
    );
    if (!onThisElement) {
      continue;
    }
    const body = text.slice(text.indexOf('{'));
    if (!paints.test(body) || suppresses.test(body)) {
      continue;
    }
    selectors.push(selector);
  }
  return selectors;
}

function FruitGrid({
  value,
  onChange,
}: {
  value: FruitValue;
  onChange: (value: FruitValue) => void;
}) {
  return (
    <div role="grid" aria-label="Fruit blend choices">
      {FRUITS.flatMap(fruit =>
        RIPENESS.map(ripeness => {
          const isSelected =
            value.fruit === fruit && value.ripeness === ripeness;
          return (
            <button
              key={`${fruit}-${ripeness}`}
              type="button"
              role="gridcell"
              aria-label={`${fruit} ${ripeness}`}
              aria-selected={isSelected || undefined}
              onClick={() => onChange({fruit, ripeness})}>
              {fruit} {ripeness}
            </button>
          );
        }),
      )}
    </div>
  );
}

function FruitComplexSelector({
  value,
  onChange,
  changeAction,
}: {
  value: FruitValue;
  onChange: (value: FruitValue) => void;
  changeAction?: (value: FruitValue) => void | Promise<void>;
}) {
  return (
    <ComplexSelector
      label="Fruit blend"
      value={value}
      onChange={onChange}
      changeAction={changeAction}
      triggerLabel={`${value.fruit} ${value.ripeness}`}>
      {(value, onChange, close) => (
        <FruitGrid
          value={value}
          onChange={nextValue => {
            onChange(nextValue);
            close();
          }}
        />
      )}
    </ComplexSelector>
  );
}

describe('ComplexSelector', () => {
  it('renders custom content with value and commits through onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <FruitComplexSelector
        value={{fruit: 'Apple', ripeness: 'Ripe'}}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Fruit blend'}));
    await user.click(
      screen.getByRole('gridcell', {name: 'Banana Juicy', ...h}),
    );

    expect(onChange).toHaveBeenCalledWith({fruit: 'Banana', ripeness: 'Juicy'});
    expect(screen.getByRole('button', {name: 'Fruit blend'})).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('gives the popup clearance on both block edges, not just the leading one (#4803)', async () => {
    const user = userEvent.setup();
    render(
      <FruitComplexSelector
        value={{fruit: 'Apple', ripeness: 'Ripe'}}
        onChange={() => {}}
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Fruit blend'}));
    const popup = document.querySelector('[popover]') as HTMLElement;
    expect(popup).not.toBeNull();
    const style = getComputedStyle(popup);
    // Only the leading edge (marginBlockStart) had clearance, which is
    // correct for a popup that opens downward but leaves zero clearance
    // when the same popup opens upward (placement="above") — the trailing
    // edge is what's nearest the trigger in that orientation. Popover (built
    // on the same usePopover/useLayer pair) sets both edges via its own
    // `gap` style, which is what this mirrors. jsdom doesn't resolve the
    // marginBlockStart/marginBlockEnd logical computed-style properties for
    // this element (both return '' regardless), so assert on the equivalent
    // physical properties instead, which do resolve correctly here.
    expect(style.marginTop).toBe('var(--spacing-1)');
    expect(style.marginBottom).toBe('var(--spacing-1)');
  });

  it('runs changeAction through the provided onChange helper', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const changeAction = vi.fn();

    render(
      <FruitComplexSelector
        value={{fruit: 'Apple', ripeness: 'Ripe'}}
        onChange={onChange}
        changeAction={changeAction}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Fruit blend'}));
    await user.click(
      screen.getByRole('gridcell', {name: 'Banana Crisp', ...h}),
    );

    expect(onChange).toHaveBeenCalledWith({fruit: 'Banana', ripeness: 'Crisp'});
    await waitFor(() => {
      expect(changeAction).toHaveBeenCalledWith({
        fruit: 'Banana',
        ripeness: 'Crisp',
      });
    });
  });

  it('paints the field ring for keyboard focus only, not after a mouse open/close cycle (#4922)', async () => {
    const user = userEvent.setup();

    render(
      <ComplexSelector
        label="Fruit blend"
        value="Apple"
        triggerLabel="Apple"
        data-testid="cs">
        {(_value, _onChange, close) => (
          <button type="button" onClick={close}>
            Done
          </button>
        )}
      </ComplexSelector>,
    );

    const field = screen.getByTestId('cs');
    const trigger = screen.getByRole('button', {name: 'Fruit blend'});

    // Mouse-driven open then close. usePopover's onHide restores focus to the
    // trigger, so the field satisfies :focus-within with no keyboard involved —
    // which is exactly what used to re-light the ring and leave it stuck.
    await user.click(trigger);
    await user.click(screen.getByRole('button', {name: 'Done', ...h}));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(field).toHaveClass('astryx-complex-selector');
    expect(field.matches(':focus-within')).toBe(true);

    // jsdom computes no layout and won't resolve :has(:focus-visible), so the
    // ring is asserted on the compiled rules for this element's own classes:
    // whatever paints an outline here must be gated on keyboard focus.
    const painting = outlineRulesFor(field);
    expect(painting.length).toBeGreaterThan(0);
    for (const selector of painting) {
      expect(selector).toContain(':focus-visible');
      expect(selector).not.toContain(':focus-within');
    }
  });

  it('passes a close helper to composed content', async () => {
    const user = userEvent.setup();

    render(
      <ComplexSelector label="Fruit blend" value="Apple" triggerLabel="Apple">
        {(_value, _onChange, close) => (
          <button type="button" onClick={close}>
            Done
          </button>
        )}
      </ComplexSelector>,
    );

    const trigger = screen.getByRole('button', {name: 'Fruit blend'});
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('button', {name: 'Done', ...h}));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
