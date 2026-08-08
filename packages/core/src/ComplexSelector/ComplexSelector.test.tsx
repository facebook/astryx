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
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {ComplexSelector} from './ComplexSelector';

// StyleX emits one deterministic atomic class per property/value pair, so an
// element carries a probe's class exactly when it has the same declaration.
// The dev-mode debug class (contains "__") varies by source location and is
// excluded from the comparison.
const probe = stylex.create({
  blockStartGap: {marginBlockStart: spacingVars['--spacing-1']},
  blockEndGap: {marginBlockEnd: spacingVars['--spacing-1']},
});

function atomicClasses(style: (typeof probe)[keyof typeof probe]): string[] {
  const {className = ''} = stylex.props(style);
  return className.split(' ').filter(c => c !== '' && !c.includes('__'));
}

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

  it('keeps the popup gap on both block edges so placement="above" clears the trigger', async () => {
    // #4803: the popup layer only set marginBlockStart, which spaces a popup
    // opening downward but leaves an upward-opening one flush against the
    // trigger. Both block edges must carry the gap, mirroring Popover's `gap`
    // style, so the clearance holds whichever way the layer opens.
    const user = userEvent.setup();
    render(
      <ComplexSelector
        label="Fruit blend"
        value="Apple"
        triggerLabel="Apple"
        placement="above">
        {() => <div>Surface</div>}
      </ComplexSelector>,
    );
    await user.click(screen.getByRole('button', {name: 'Fruit blend'}));

    const layer = document.querySelector('[popover]');
    expect(layer).not.toBeNull();
    const startGapClasses = atomicClasses(probe.blockStartGap);
    const endGapClasses = atomicClasses(probe.blockEndGap);
    // Guard against a vacuous pass if the probe ever compiles to no classes.
    expect(startGapClasses.length).toBeGreaterThan(0);
    expect(endGapClasses.length).toBeGreaterThan(0);
    for (const cls of [...startGapClasses, ...endGapClasses]) {
      expect(layer!.classList.contains(cls)).toBe(true);
    }
  });
});
