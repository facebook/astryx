// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ComplexSelector.test.tsx
 * @input Uses vitest, Testing Library, user-event, and ComplexSelector
 * @output Unit tests for selection, trigger variants, positioning, the imperative handle, and the disabled reason
 * @position Tests; validates the ComplexSelector public interaction contract
 *
 * SYNC: When ComplexSelector.tsx API changes, update these tests.
 */

import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ComplexSelector, type ComplexSelectorHandle} from './ComplexSelector';
import {readAnchorNames} from '../Layer/anchorName';

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

    fireEvent.pointerDown(trigger);
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

  it('stays closed when the trigger click follows its own light dismiss (#5004)', async () => {
    const user = userEvent.setup();
    render(
      <ComplexSelector label="Fruit blend" value="Apple" triggerLabel="Apple">
        {() => <button type="button">Done</button>}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'Fruit blend'});
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // The browser dismissed the popup on pointerup and queued the toggle. When
    // that event lands before the click — WebKit, or any engine under load —
    // the click used to read a closed popup and reopen it.
    fireEvent.pointerDown(trigger);
    const popover = document.querySelector('[popover]') as HTMLElement;
    act(() => {
      popover.dispatchEvent(
        Object.assign(new Event('toggle'), {
          oldState: 'open',
          newState: 'closed',
        }),
      );
    });
    // Synchronously: the click falls inside the one gesture the guard covers,
    // as it does in a browser a few milliseconds behind the dismissal.
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('ComplexSelector onOpenChange', () => {
  function renderSelector(onOpenChange: (isOpen: boolean) => void) {
    render(
      <ComplexSelector
        label="View options"
        value={[]}
        onOpenChange={onOpenChange}>
        {(_value, _onChange, close) => (
          <button type="button" onClick={close}>
            Apply
          </button>
        )}
      </ComplexSelector>,
    );
    return screen.getByRole('button', {name: 'View options'});
  }

  it('reports the open and the close of a trigger toggle', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const trigger = renderSelector(onOpenChange);

    await user.click(trigger);
    expect(onOpenChange.mock.calls).toEqual([[true]]);

    await user.click(trigger);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('reports an open from ArrowDown', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const trigger = renderSelector(onOpenChange);

    trigger.focus();
    await user.keyboard('{ArrowDown}');

    expect(onOpenChange.mock.calls).toEqual([[true]]);
  });

  it('reports a close from Escape', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const trigger = renderSelector(onOpenChange);

    await user.click(trigger);
    onOpenChange.mockClear();
    await user.keyboard('{Escape}');

    expect(onOpenChange.mock.calls).toEqual([[false]]);
  });

  it('reports a close the browser performed (light dismiss)', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const trigger = renderSelector(onOpenChange);

    await user.click(trigger);
    onOpenChange.mockClear();

    const popover = screen
      .getByRole('dialog', {hidden: true})
      .closest('[popover]') as HTMLElement;
    const closeEvent = new Event('toggle');
    Object.defineProperty(closeEvent, 'newState', {value: 'closed'});
    fireEvent(popover, closeEvent);

    expect(onOpenChange.mock.calls).toEqual([[false]]);
  });

  it('reports a gesture light dismiss once without reopening from its click', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const trigger = renderSelector(onOpenChange);

    await user.click(trigger);
    onOpenChange.mockClear();

    const popover = screen
      .getByRole('dialog', {hidden: true})
      .closest('[popover]') as HTMLElement;
    fireEvent.pointerDown(trigger);
    fireEvent(
      popover,
      Object.assign(new Event('toggle'), {
        oldState: 'open',
        newState: 'closed',
      }),
    );
    fireEvent.click(trigger);

    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('reports a close from content calling close()', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const trigger = renderSelector(onOpenChange);

    await user.click(trigger);
    onOpenChange.mockClear();
    await user.click(screen.getByRole('button', {name: 'Apply', ...h}));

    expect(onOpenChange.mock.calls).toEqual([[false]]);
  });

  it('reports opens and closes driven through the imperative handle', () => {
    const onOpenChange = vi.fn();
    const handleRef = React.createRef<ComplexSelectorHandle>();
    render(
      <ComplexSelector
        label="View options"
        value={[]}
        handleRef={handleRef}
        onOpenChange={onOpenChange}>
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );

    act(() => handleRef.current?.open());
    act(() => handleRef.current?.close());
    act(() => handleRef.current?.toggle());

    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true]]);
  });

  it('does not report a state it is already in', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const handleRef = React.createRef<ComplexSelectorHandle>();
    render(
      <ComplexSelector
        label="View options"
        value={[]}
        handleRef={handleRef}
        onOpenChange={onOpenChange}>
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'View options'});

    act(() => handleRef.current?.close());
    expect(onOpenChange).not.toHaveBeenCalled();

    await user.click(trigger);
    act(() => handleRef.current?.open());
    expect(onOpenChange.mock.calls).toEqual([[true]]);
  });
});

// The reason tooltip opens through the same Popover API, so count only the
// show calls made on the selector popup itself.
function popupShowCalls(popup: Element | null): number {
  return vi
    .mocked(HTMLElement.prototype.showPopover)
    .mock.contexts.filter(context => context === popup).length;
}

describe('ComplexSelector disabledMessage', () => {
  it('shows the reason tooltip on hover when disabled with a reason', async () => {
    render(
      <ComplexSelector
        label="View options"
        value={[]}
        isDisabled
        disabledMessage="You need the Editor role"
        data-testid="view-options">
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );

    const container = screen.getByTestId('view-options');
    const tooltip = screen.getByRole('tooltip', h);
    expect(tooltip).toHaveTextContent('You need the Editor role');

    fireEvent.mouseEnter(container);
    await waitFor(() => {
      expect(tooltip).toHaveAttribute('popover-open');
    });

    fireEvent.mouseLeave(container);
    await waitFor(() => {
      expect(tooltip).not.toHaveAttribute('popover-open');
    });
  });

  it('shows the reason tooltip on keyboard focus', async () => {
    const user = userEvent.setup();
    render(
      <ComplexSelector
        label="View options"
        value={[]}
        isDisabled
        disabledMessage="You need the Editor role">
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );

    const tooltip = screen.getByRole('tooltip', h);
    await user.tab();
    expect(screen.getByRole('button', {name: 'View options'})).toHaveFocus();
    await waitFor(() => {
      expect(tooltip).toHaveAttribute('popover-open');
    });
  });

  it('does not render a tooltip when not disabled', () => {
    render(
      <ComplexSelector
        label="View options"
        value={[]}
        disabledMessage="You need the Editor role">
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );
    expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
  });

  it('does not render a tooltip when disabled without a reason', () => {
    render(
      <ComplexSelector label="View options" value={[]} isDisabled>
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );
    expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
  });

  it('keeps the trigger focusable via aria-disabled when a reason is provided', () => {
    render(
      <ComplexSelector
        label="View options"
        value={[]}
        isDisabled
        disabledMessage="You need the Editor role">
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'View options'});
    expect(trigger).not.toBeDisabled();
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
  });

  it('links the reason tooltip from the trigger via aria-describedby', () => {
    render(
      <ComplexSelector
        label="View options"
        value={[]}
        isDisabled
        disabledMessage="You need the Editor role">
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'View options'});
    const tooltip = screen.getByRole('tooltip', h);
    expect(trigger.getAttribute('aria-describedby')).toContain(tooltip.id);
  });

  it('blocks activation while focusable-disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const handleRef = React.createRef<ComplexSelectorHandle>();
    render(
      <ComplexSelector
        label="View options"
        value={[]}
        onChange={onChange}
        handleRef={handleRef}
        isDisabled
        disabledMessage="You need the Editor role">
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'View options'});
    const popup = screen.getByRole('dialog', h).closest('[popover]');
    expect(popup).not.toBeNull();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(popup).not.toHaveAttribute('popover-open');
    expect(popupShowCalls(popup)).toBe(0);

    act(() => handleRef.current?.open());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(handleRef.current?.isOpen()).toBe(false);
    expect(popupShowCalls(popup)).toBe(0);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('remains non-focusable when disabled without a reason', () => {
    render(
      <ComplexSelector label="View options" value={[]} isDisabled>
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'View options'});
    expect(trigger).toBeDisabled();
    expect(trigger).not.toHaveAttribute('aria-disabled');
  });

  it('never pairs native disabled with aria-disabled, and treats an empty reason as no reason', () => {
    const tree = (isDisabled: boolean, disabledMessage?: string) => (
      <ComplexSelector
        label="View options"
        value={[]}
        isDisabled={isDisabled}
        disabledMessage={disabledMessage}>
        {() => <button type="button">Apply</button>}
      </ComplexSelector>
    );
    const trigger = () => screen.getByRole('button', {name: 'View options'});
    const expectPlainEnabled = () => {
      expect(trigger()).not.toBeDisabled();
      expect(trigger()).not.toHaveAttribute('aria-disabled');
      expect(trigger()).not.toHaveAttribute('aria-describedby');
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    };
    const expectNativelyDisabled = () => {
      expect(trigger()).toBeDisabled();
      expect(trigger()).not.toHaveAttribute('aria-disabled');
      expect(trigger()).not.toHaveAttribute('aria-describedby');
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    };

    const {rerender} = render(tree(false));
    expectPlainEnabled();

    rerender(tree(false, 'You need the Editor role'));
    expectPlainEnabled();

    rerender(tree(true));
    expectNativelyDisabled();

    // An empty reason is no reason: nothing to describe, so the trigger falls
    // back to native disabled rather than exposing an unnamed tooltip.
    rerender(tree(true, ''));
    expectNativelyDisabled();

    rerender(tree(true, 'You need the Editor role'));
    expect(trigger()).not.toBeDisabled();
    expect(trigger()).toHaveAttribute('aria-disabled', 'true');
    expect(trigger()).toHaveAttribute(
      'aria-describedby',
      screen.getByRole('tooltip', h).id,
    );
  });

  it('orders aria-describedby as description, status message, then the reason, with every id resolving', () => {
    render(
      <ComplexSelector
        label="View options"
        value={[]}
        description="Pick the columns to show"
        status={{type: 'error', message: 'At least one column is required'}}
        isDisabled
        disabledMessage="You need the Editor role">
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'View options'});
    const tooltip = screen.getByRole('tooltip', h);

    const ids = (trigger.getAttribute('aria-describedby') ?? '').split(/\s+/);
    expect(ids).toHaveLength(3);
    const described = ids.map(id => document.getElementById(id));
    expect(described[0]).toHaveTextContent('Pick the columns to show');
    expect(described[1]).toHaveTextContent('At least one column is required');
    expect(described[2]).toBe(tooltip);
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
  });

  it('keeps onOpenChange silent and toggle() a no-op while focusable-disabled', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const handleRef = React.createRef<ComplexSelectorHandle>();
    render(
      <ComplexSelector
        label="View options"
        value={[]}
        handleRef={handleRef}
        onOpenChange={onOpenChange}
        isDisabled
        disabledMessage="You need the Editor role">
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'View options'});
    const popup = screen.getByRole('dialog', h).closest('[popover]');

    await user.click(trigger);
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    await user.keyboard('{ArrowDown}');
    act(() => handleRef.current?.toggle());
    act(() => handleRef.current?.open());
    act(() => handleRef.current?.close());

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(handleRef.current?.isOpen()).toBe(false);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(popup).not.toHaveAttribute('popover-open');
  });

  it('re-enabling at runtime drops aria-disabled, the tooltip, and its describedby id without moving focus, and re-disabling restores them', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const tree = (isDisabled: boolean) => (
      <ComplexSelector
        label="View options"
        value={[]}
        description="Pick the columns to show"
        isDisabled={isDisabled}
        disabledMessage="You need the Editor role"
        onOpenChange={onOpenChange}>
        {() => <button type="button">Apply</button>}
      </ComplexSelector>
    );
    const {rerender} = render(tree(true));
    const trigger = screen.getByRole('button', {name: 'View options'});
    const tooltipId = screen.getByRole('tooltip', h).id;

    await user.tab();
    expect(trigger).toHaveFocus();
    await waitFor(() => {
      expect(screen.getByRole('tooltip', h)).toHaveAttribute('popover-open');
    });

    rerender(tree(false));
    expect(trigger).toHaveFocus();
    expect(trigger).not.toBeDisabled();
    expect(trigger).not.toHaveAttribute('aria-disabled');
    expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    const ids = (trigger.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter(Boolean);
    expect(ids).not.toContain(tooltipId);
    for (const id of ids) {
      expect(document.getElementById(id)).not.toBeNull();
    }

    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(onOpenChange.mock.calls).toEqual([[true]]);
    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();

    rerender(tree(true));
    expect(trigger).toHaveFocus();
    expect(trigger).not.toBeDisabled();
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    const restored = screen.getByRole('tooltip', h);
    expect(trigger.getAttribute('aria-describedby')).toContain(restored.id);
  });

  it('dismisses only the reason tooltip on Escape, keeping focus on the trigger and the popup closed', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <ComplexSelector
        label="View options"
        value={[]}
        onOpenChange={onOpenChange}
        isDisabled
        disabledMessage="You need the Editor role">
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'View options'});
    const tooltip = screen.getByRole('tooltip', h);
    const popup = screen.getByRole('dialog', h).closest('[popover]');

    await user.tab();
    await waitFor(() => {
      expect(tooltip).toHaveAttribute('popover-open');
    });

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(tooltip).not.toHaveAttribute('popover-open');
    });
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(popup).not.toHaveAttribute('popover-open');
    expect(onOpenChange).not.toHaveBeenCalled();
    // Dismissing the tip does not strip the description.
    expect(trigger.getAttribute('aria-describedby')).toContain(tooltip.id);

    // A second Escape has nothing left to dismiss and touches nothing.
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('hides the reason tooltip when keyboard focus leaves the trigger', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ComplexSelector
          label="View options"
          value={[]}
          isDisabled
          disabledMessage="You need the Editor role">
          {() => <button type="button">Apply</button>}
        </ComplexSelector>
        <button type="button">After</button>
      </>,
    );
    const trigger = screen.getByRole('button', {name: 'View options'});
    const tooltip = screen.getByRole('tooltip', h);

    await user.tab();
    expect(trigger).toHaveFocus();
    await waitFor(() => {
      expect(tooltip).toHaveAttribute('popover-open');
    });

    // focusout bubbles from the button to the container the tooltip listens
    // on, so leaving the trigger hides the reason.
    await user.tab();
    expect(trigger).not.toHaveFocus();
    await waitFor(() => {
      expect(tooltip).not.toHaveAttribute('popover-open');
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps busy and the disabled reason independent: settling clears only aria-busy', async () => {
    const user = userEvent.setup();
    const settlers: (() => void)[] = [];
    const changeAction = vi.fn(async () => {
      await new Promise<void>(resolve => {
        settlers.push(resolve);
      });
    });
    const initial: FruitValue = {fruit: 'Apple', ripeness: 'Ripe'};
    const tree = (isDisabled: boolean) => (
      <ComplexSelector
        label="Fruit blend"
        value={initial}
        onChange={() => {}}
        changeAction={changeAction}
        triggerLabel="Apple Ripe"
        isDisabled={isDisabled}
        disabledMessage={isDisabled ? 'You need the Editor role' : undefined}
        data-testid="fruit-blend">
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
    const {rerender} = render(tree(false));
    const trigger = screen.getByRole('button', {name: 'Fruit blend'});
    const container = screen.getByTestId('fruit-blend');

    await user.click(trigger);
    await user.click(
      screen.getByRole('gridcell', {name: 'Banana Crisp', ...h}),
    );
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-busy', 'true');
    });

    rerender(tree(true));
    expect(trigger).toHaveAttribute('aria-busy', 'true');
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    expect(trigger).not.toBeDisabled();
    expect(
      within(container).getByRole('status', {name: 'Loading'}),
    ).toBeInTheDocument();
    const tooltip = screen.getByRole('tooltip', h);
    expect(trigger.getAttribute('aria-describedby')).toContain(tooltip.id);
    fireEvent.mouseEnter(container);
    await waitFor(() => {
      expect(tooltip).toHaveAttribute('popover-open');
    });

    await act(async () => {
      settlers.forEach(settle => settle());
    });
    await waitFor(() => {
      expect(trigger).not.toHaveAttribute('aria-busy');
    });
    expect(within(container).queryByRole('status')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    expect(trigger).not.toBeDisabled();
    expect(trigger.getAttribute('aria-describedby')).toContain(tooltip.id);
  });

  it('anchors the popup and the reason tooltip to the same container and keeps both, plus the open tip, across a rerender', async () => {
    const tree = (triggerLabel: string) => (
      <ComplexSelector
        label="View options"
        value={triggerLabel}
        triggerLabel={triggerLabel}
        isDisabled
        disabledMessage="You need the Editor role"
        data-testid="view-options">
        {() => <button type="button">Apply</button>}
      </ComplexSelector>
    );
    const {rerender} = render(tree('A'));
    const container = screen.getByTestId('view-options');
    const popup = screen.getByRole('dialog', h).closest('[popover]');
    const tooltip = screen.getByRole('tooltip', h);
    const anchorOf = (el: Element | null) =>
      /position-anchor:\s*([^;]+)/
        .exec(el?.getAttribute('style') ?? '')?.[1]
        .trim();

    // Two layers, two anchor names on one element: neither clobbers the other.
    const names = [...readAnchorNames(container)].sort();
    expect(names).toHaveLength(2);
    expect(new Set(names).size).toBe(2);
    expect(anchorOf(popup)).toBeDefined();
    expect(anchorOf(tooltip)).toBeDefined();
    expect(anchorOf(popup)).not.toBe(anchorOf(tooltip));
    expect(names).toContain(anchorOf(popup));
    expect(names).toContain(anchorOf(tooltip));

    fireEvent.mouseEnter(container);
    await waitFor(() => {
      expect(tooltip).toHaveAttribute('popover-open');
    });

    // The inline composed ref is recreated every render, so React detaches and
    // re-attaches both hooks. That churn must not close the tip, drop an
    // anchor, or lose the hover listeners.
    rerender(tree('B'));
    expect(screen.getByRole('tooltip', h)).toBe(tooltip);
    expect(tooltip).toHaveAttribute('popover-open');
    expect([...readAnchorNames(container)].sort()).toEqual(names);

    fireEvent.mouseLeave(container);
    await waitFor(() => {
      expect(tooltip).not.toHaveAttribute('popover-open');
    });
    fireEvent.mouseEnter(container);
    await waitFor(() => {
      expect(tooltip).toHaveAttribute('popover-open');
    });
  });

  it('restores focus to the aria-disabled trigger when the popup closes after the field was disabled mid-open', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const tree = (isDisabled: boolean) => (
      <ComplexSelector
        label="View options"
        value={[]}
        isDisabled={isDisabled}
        disabledMessage={isDisabled ? 'You need the Editor role' : undefined}
        onOpenChange={onOpenChange}>
        {() => <button type="button">Apply</button>}
      </ComplexSelector>
    );
    const {rerender} = render(tree(false));
    const trigger = screen.getByRole('button', {name: 'View options'});

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // jsdom does not run the popup's autofocus; put focus inside as a browser
    // would, so closing has something to restore from.
    act(() => screen.getByRole('button', {name: 'Apply', ...h}).focus());

    rerender(tree(true));
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    expect(trigger).not.toBeDisabled();

    // A keyboard-driven close restores keyboard focus, which a browser reports
    // as `:focus-visible`. jsdom's answer depends on what earlier tests
    // focused, so stand it up here.
    const realMatches = trigger.matches.bind(trigger);
    vi.spyOn(trigger, 'matches').mockImplementation((selector: string) =>
      selector === ':focus-visible' ? true : realMatches(selector),
    );

    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    // A natively disabled button could not take this focus restore; the
    // reason-bearing trigger can, and the reason surfaces on that focus.
    expect(trigger).toHaveFocus();
    await waitFor(() => {
      expect(screen.getByRole('tooltip', h)).toHaveAttribute('popover-open');
    });
  });

  it('reveals the reason on a touch tap without opening the popup', () => {
    render(
      <ComplexSelector
        label="View options"
        value={[]}
        isDisabled
        disabledMessage="You need the Editor role"
        data-testid="view-options">
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'View options'});
    const container = screen.getByTestId('view-options');
    const tooltip = screen.getByRole('tooltip', h);
    const popup = screen.getByRole('dialog', h).closest('[popover]');

    // A finger's arrival lands on the container (pointerenter does not
    // bubble); the press and the click it produces land on the button and
    // bubble up to the container's listeners.
    fireEvent.pointerEnter(container, {pointerType: 'touch'});
    fireEvent.pointerDown(trigger, {pointerType: 'touch'});
    fireEvent.pointerUp(trigger, {pointerType: 'touch'});
    fireEvent.mouseEnter(container);
    fireEvent.click(trigger);

    // Touch skips the hover delay: the reason is visible synchronously.
    expect(tooltip).toHaveAttribute('popover-open');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(popup).not.toHaveAttribute('popover-open');
    expect(popupShowCalls(popup)).toBe(0);

    // The next tap toggles the reason away.
    fireEvent.pointerDown(trigger, {pointerType: 'touch'});
    expect(tooltip).not.toHaveAttribute('popover-open');
    expect(popupShowCalls(popup)).toBe(0);
  });

  it('delivers a consumer onClick from the focusable-disabled trigger without opening, as Selector does', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const tree = (disabledMessage?: string) => (
      <ComplexSelector
        label="View options"
        value={[]}
        isDisabled
        disabledMessage={disabledMessage}
        onClick={onClick}>
        {() => <button type="button">Apply</button>}
      </ComplexSelector>
    );
    const {rerender} = render(tree());
    const trigger = screen.getByRole('button', {name: 'View options'});
    const popup = screen.getByRole('dialog', h).closest('[popover]');

    // Natively disabled: the click never happens.
    await user.click(trigger);
    expect(onClick).not.toHaveBeenCalled();

    // Focusable-disabled: the click happens and reaches the consumer, but
    // activation stays blocked.
    rerender(tree('You need the Editor role'));
    await user.click(trigger);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(popup).not.toHaveAttribute('popover-open');
  });

  it('keeps aria-disabled and the reason on the ghost toolbar trigger', async () => {
    const {container} = render(
      <ComplexSelector
        label="View options"
        value={[]}
        variant="ghost"
        startIcon="viewColumns"
        isDisabled
        disabledMessage="You need the Editor role"
        data-testid="view-options">
        {() => <button type="button">Apply</button>}
      </ComplexSelector>,
    );

    expect(container.querySelector('.astryx-complex-selector')).toHaveAttribute(
      'data-variant',
      'ghost',
    );
    const trigger = screen.getByRole('button', {name: 'View options'});
    expect(trigger).not.toBeDisabled();
    expect(trigger).toHaveAttribute('aria-disabled', 'true');

    const tooltip = screen.getByRole('tooltip', h);
    fireEvent.mouseEnter(screen.getByTestId('view-options'));
    await waitFor(() => {
      expect(tooltip).toHaveAttribute('popover-open');
    });
  });
});
