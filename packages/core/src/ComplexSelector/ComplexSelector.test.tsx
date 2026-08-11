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
