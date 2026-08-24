// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ComplexSelector.test.tsx
 * @input Uses vitest, Testing Library, user-event, and ComplexSelector
 * @output Unit tests for selection, trigger variants, positioning, and the imperative handle
 * @position Tests; validates the ComplexSelector public interaction contract
 *
 * SYNC: When ComplexSelector.tsx API changes, update these tests.
 */

import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ComplexSelector, type ComplexSelectorHandle} from './ComplexSelector';

const originalMatches = HTMLElement.prototype.matches;

// Mock the Popover API, which jsdom does not implement.
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
  Object.defineProperty(HTMLElement.prototype, 'matches', {
    configurable: true,
    value: function (this: HTMLElement, selector: string): boolean {
      if (selector === ':popover-open') {
        return this.hasAttribute('popover-open');
      }
      return originalMatches.call(this, selector);
    },
  });
});

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
  it('defaults to md and reflects explicit trigger sizes', () => {
    const {container, rerender} = render(
      <ComplexSelector label="Fruit blend" value="Apple">
        {() => <div>Options</div>}
      </ComplexSelector>,
    );

    const getSelector = () =>
      container.querySelector('.astryx-complex-selector');

    expect(getSelector()).toHaveAttribute('data-size', 'md');

    rerender(
      <ComplexSelector label="Fruit blend" value="Apple" size="sm">
        {() => <div>Options</div>}
      </ComplexSelector>,
    );

    expect(getSelector()).toHaveAttribute('data-size', 'sm');

    rerender(
      <ComplexSelector label="Fruit blend" value="Apple" size="lg">
        {() => <div>Options</div>}
      </ComplexSelector>,
    );

    expect(getSelector()).toHaveAttribute('data-size', 'lg');
  });

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
    // Both edges, not just the leading one: the trailing edge is what faces
    // the trigger when the same popup opens upward (placement="above") or is
    // flipped by position-try-fallbacks. useLayer's `offset` sets both from
    // the resolved placement; jsdom resolves neither the var indirection nor
    // logical margins, so read the debug-mode declarations it emits.
    const blockStart = popup.style.getPropertyValue('--x-marginBlockStart');
    expect(blockStart).not.toBe('');
    expect(popup.style.getPropertyValue('--x-marginBlockEnd')).toBe(blockStart);
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

  it('renders a ghost toolbar trigger with a start icon', () => {
    const {container} = render(
      <ComplexSelector
        label="View options"
        value={['name']}
        variant="ghost"
        startIcon="viewColumns"
        status={{type: 'warning', message: 'Unsaved changes'}}
        data-testid="view-options">
        {() => <div>Columns</div>}
      </ComplexSelector>,
    );

    expect(container.querySelector('.astryx-complex-selector')).toHaveAttribute(
      'data-variant',
      'ghost',
    );
    expect(container.querySelector('.astryx-field-status')).toHaveAttribute(
      'data-variant',
      'detached',
    );
    expect(
      screen.getByTestId('view-options').querySelectorAll('svg'),
    ).toHaveLength(2);
  });

  it('supports end-aligned popup positioning', () => {
    render(
      <ComplexSelector label="View options" value={[]} alignment="end">
        {() => <div>Columns</div>}
      </ComplexSelector>,
    );

    const popover = screen
      .getByRole('dialog', {hidden: true})
      .closest('[popover]');
    expect(popover?.getAttribute('style')).toContain(
      'position-area: self-block-end span-self-inline-start',
    );
  });

  it('exposes imperative open, close, toggle, and isOpen via handleRef', async () => {
    const handleRef = React.createRef<ComplexSelectorHandle>();
    render(
      <ComplexSelector label="View options" value={[]} handleRef={handleRef}>
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'View options'});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(handleRef.current?.isOpen()).toBe(false);

    act(() => {
      handleRef.current?.open();
    });
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
    expect(handleRef.current?.isOpen()).toBe(true);

    act(() => {
      handleRef.current?.close();
    });
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
    expect(handleRef.current?.isOpen()).toBe(false);

    act(() => {
      handleRef.current?.toggle();
    });
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    act(() => {
      handleRef.current?.toggle();
    });
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('does not open via the imperative handle when disabled', async () => {
    const handleRef = React.createRef<ComplexSelectorHandle>();
    render(
      <ComplexSelector
        label="View options"
        value={[]}
        isDisabled
        handleRef={handleRef}>
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'View options'});

    act(() => {
      handleRef.current?.open();
    });
    act(() => {
      handleRef.current?.toggle();
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(handleRef.current?.isOpen()).toBe(false);
  });

  it('does not reopen from the trigger click that follows light dismiss', async () => {
    const user = userEvent.setup();
    render(
      <ComplexSelector label="View options" value={[]}>
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'View options'});

    await user.click(trigger);
    const popover = screen
      .getByRole('dialog', {hidden: true})
      .closest('[popover]');
    expect(popover).not.toBeNull();

    const closeEvent = new Event('toggle');
    Object.defineProperty(closeEvent, 'newState', {value: 'closed'});
    fireEvent(popover as HTMLElement, closeEvent);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    const showCallCount = vi.mocked(HTMLElement.prototype.showPopover).mock
      .calls.length;
    fireEvent.click(trigger);
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(
      showCallCount,
    );
  });
});

describe('ComplexSelector popup theme target', () => {
  it('puts astryx-complex-selector-popup on the surface that paints, not the content box', async () => {
    const user = userEvent.setup();
    render(
      <ComplexSelector label="Fruit blend" value="Apple" triggerLabel="Apple">
        {() => <button type="button">Done</button>}
      </ComplexSelector>,
    );
    await user.click(screen.getByRole('button', {name: 'Fruit blend'}));

    const popup = document.querySelector(
      '.astryx-complex-selector-popup',
    ) as HTMLElement;
    expect(popup).not.toBeNull();

    // The surface is the element usePopover renders: it carries the dialog
    // role and the shared surface class, and the component's content box —
    // the one with the padding and the scroll — sits INSIDE it. A target on
    // that inner box cannot paint the popup's background or radius, which is
    // what a theme reaches for this class to do.
    expect(popup).toHaveAttribute('role', 'dialog');
    expect(popup).toHaveClass('astryx-popover-surface');
    expect(popup.querySelector('[id]')).not.toBeNull();
    expect(popup).toContainElement(
      screen.getByRole('button', {name: 'Done', ...h}),
    );

    // And it is not the bare positioning layer either.
    const layer = document.querySelector('[popover]') as HTMLElement;
    expect(popup).not.toBe(layer);
    expect(layer.contains(popup)).toBe(true);
  });

  it('keeps the target when the consumer also passes contentXstyle', async () => {
    const user = userEvent.setup();
    render(
      <ComplexSelector
        label="Fruit blend"
        value="Apple"
        triggerLabel="Apple"
        contentXstyle={{}}>
        {() => <button type="button">Done</button>}
      </ComplexSelector>,
    );
    await user.click(screen.getByRole('button', {name: 'Fruit blend'}));

    expect(
      document.querySelector('.astryx-complex-selector-popup'),
    ).not.toBeNull();
  });
});
