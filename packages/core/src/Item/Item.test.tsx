// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Item.test.tsx
 * @input Uses vitest, @testing-library/react, Item component
 * @output Unit tests for Item
 * @position Testing; validates Item component implementation
 *
 * SYNC: When Item component changes, update tests to match new behavior
 */

import {use, useRef} from 'react';
import {afterEach, beforeEach, describe, it, expect, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {rulesDeclaredFor} from '../__tests__/pressState';
import userEvent from '@testing-library/user-event';
import {Item} from './Item';
import {ItemDescriptionContext} from './ItemDescriptionContext';
import {emulateTouch} from './__tests__/emulateTouch';
import {TapGestureRecognizer, useGestureRecognizer} from '../gestures';
import {pointerQuery} from '../gestures/__tests__/pointerQuery';

/**
 * Item in delegation mode: `interactiveRef` points at a nested control that
 * owns the row's keyboard access and action. The row is an enlarged tap target
 * that forwards surface clicks to that control (useClickableContainer).
 */
function DelegatingItem({onToggle}: {onToggle?: () => void}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Item
      label="Row"
      interactiveRef={ref}
      startContent={
        <input
          ref={ref}
          type="checkbox"
          aria-label="Pick row"
          onChange={onToggle}
        />
      }
    />
  );
}

describe('Item', () => {
  // ===========================================================================
  // Basic rendering
  // ===========================================================================

  it('ids the rendered description and publishes it to slot content', () => {
    function Probe() {
      const describedBy = use(ItemDescriptionContext);
      return <span data-testid="probe">{describedBy ?? 'none'}</span>;
    }
    render(
      <Item
        label="Email"
        description="Receive notifications by email"
        startContent={<Probe />}
      />,
    );
    const description = screen.getByText('Receive notifications by email');
    expect(description.id).not.toBe('');
    expect(screen.getByTestId('probe')).toHaveTextContent(description.id);
    // The string description stays Item's own element. Wrapping it to carry an
    // id would make it a ReactNode and drop the single-line truncation.
    expect(description.children).toHaveLength(0);
  });

  it('publishes no description id when the description renders nothing', () => {
    function Probe() {
      const describedBy = use(ItemDescriptionContext);
      return <span data-testid="probe">{describedBy ?? 'none'}</span>;
    }
    for (const description of ['', false] as const) {
      const {unmount} = render(
        <Item
          label="Email"
          description={description}
          startContent={<Probe />}
        />,
      );
      expect(screen.getByTestId('probe')).toHaveTextContent('none');
      unmount();
    }
  });

  it('renders label text', () => {
    render(<Item label="Contact Name" />);
    expect(screen.getByText('Contact Name')).toBeInTheDocument();
  });

  it('renders label and description', () => {
    render(<Item label="Settings" description="Manage your preferences" />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your preferences')).toBeInTheDocument();
  });

  it('renders marker', () => {
    render(<Item label="Item" marker={<span data-testid="marker">•</span>} />);
    expect(screen.getByTestId('marker')).toBeInTheDocument();
  });

  it('renders startContent', () => {
    render(
      <Item label="Item" startContent={<span data-testid="avatar">A</span>} />,
    );
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <Item label="Item" endContent={<span data-testid="badge">3</span>} />,
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('renders all slots together', () => {
    render(
      <Item
        marker={<span data-testid="marker">•</span>}
        startContent={<span data-testid="start">S</span>}
        label="Label"
        description="Description"
        endContent={<span data-testid="end">E</span>}
      />,
    );
    expect(screen.getByTestId('marker')).toBeInTheDocument();
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('supports data-testid', () => {
    render(<Item label="Item" data-testid="my-item" />);
    expect(screen.getByTestId('my-item')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    const {container} = render(<Item label="Item" />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  // ===========================================================================
  // Ref forwarding
  // ===========================================================================

  it('forwards ref to the root element', () => {
    let refValue: HTMLElement | null = null;
    render(
      <Item
        label="Item"
        ref={el => {
          refValue = el;
        }}
      />,
    );
    expect(refValue).toBeInstanceOf(HTMLDivElement);
  });

  // ===========================================================================
  // Interactive — onClick (invisible button pattern)
  // ===========================================================================

  it('renders an invisible button when onClick is provided', () => {
    const onClick = vi.fn();
    const {container} = render(<Item label="Clickable" onClick={onClick} />);
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button?.textContent).toContain('Clickable');
  });

  it('fires onClick when invisible button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Item label="Clickable" onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClick when container area is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Item
        label="Clickable"
        onClick={onClick}
        data-testid="item"
        startContent={<span data-testid="start">S</span>}
      />,
    );
    await user.click(screen.getByTestId('start'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire item onClick when endContent interactive element is clicked', async () => {
    const user = userEvent.setup();
    const itemClick = vi.fn();
    const buttonClick = vi.fn();
    render(
      <Item
        label="Item"
        onClick={itemClick}
        endContent={
          <button type="button" onClick={buttonClick}>
            Action
          </button>
        }
      />,
    );
    await user.click(screen.getByText('Action'));
    expect(buttonClick).toHaveBeenCalledTimes(1);
    expect(itemClick).not.toHaveBeenCalled();
  });

  it('does not fire item onClick when startContent interactive element is clicked', async () => {
    const user = userEvent.setup();
    const itemClick = vi.fn();
    const buttonClick = vi.fn();
    render(
      <Item
        label="Item"
        onClick={itemClick}
        startContent={
          <button type="button" onClick={buttonClick}>
            Open
          </button>
        }
      />,
    );
    await user.click(screen.getByText('Open'));
    expect(buttonClick).toHaveBeenCalledTimes(1);
    expect(itemClick).not.toHaveBeenCalled();
  });

  it('invisible button is focusable via keyboard', async () => {
    const user = userEvent.setup();
    render(<Item label="Focusable" onClick={() => {}} />);
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('invisible button can be activated via keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Item label="Pressable" onClick={onClick} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render nested buttons — only one invisible button', () => {
    const {container} = render(<Item label="Item" onClick={() => {}} />);
    const buttons = container.querySelectorAll('div button');
    expect(buttons).toHaveLength(1);
  });

  // ===========================================================================
  // Interactive — interactiveRef (delegation to a nested control)
  // ===========================================================================

  it('renders no invisible button in interactiveRef (delegation) mode', () => {
    const {container} = render(<DelegatingItem />);
    // The nested control provides keyboard access — the row must not add a
    // second focusable control for the same action (WCAG 4.1.2).
    expect(container.querySelector('button')).not.toBeInTheDocument();
  });

  it('keeps the nested control as the only tab stop in interactiveRef mode', async () => {
    const user = userEvent.setup();
    render(<DelegatingItem />);
    await user.tab();
    expect(screen.getByRole('checkbox')).toHaveFocus();
    // Next tab leaves the item entirely — the row itself is not focusable.
    await user.tab();
    expect(screen.getByRole('checkbox')).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });

  it('delegates a row-surface click to the interactive control', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<DelegatingItem onToggle={onToggle} />);
    // Clicking the label (row surface) is forwarded to the checkbox.
    await user.click(screen.getByText('Row'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does not double-fire when the interactive control itself is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<DelegatingItem onToggle={onToggle} />);
    await user.click(screen.getByRole('checkbox'));
    // The row must not re-forward the control's own click back to it.
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('ignores onClick when interactiveRef is set (delegation wins, single tab stop)', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    function ItemWithBoth() {
      const ref = useRef<HTMLInputElement>(null);
      return (
        <Item
          label="Row"
          onClick={onClick}
          interactiveRef={ref}
          startContent={
            <input ref={ref} type="checkbox" aria-label="Pick row" />
          }
        />
      );
    }
    const {container} = render(<ItemWithBoth />);
    // No invisible button (onClick is ignored in delegation mode)...
    expect(container.querySelector('button')).not.toBeInTheDocument();
    // ...and the checkbox is still the sole tab stop.
    await user.tab();
    expect(screen.getByRole('checkbox')).toHaveFocus();
  });

  // ===========================================================================
  // Interactive — href (invisible anchor pattern)
  // ===========================================================================

  it('renders an invisible anchor when href is provided', () => {
    const {container} = render(<Item label="Link" href="/docs" />);
    const anchor = container.querySelector('a');
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute('href', '/docs');
    expect(anchor?.textContent).toContain('Link');
  });

  it('sets target on anchor when provided', () => {
    const {container} = render(
      <Item label="External" href="https://example.com" target="_blank" />,
    );
    const anchor = container.querySelector('a');
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('preserves existing rel tokens when target is blank', () => {
    const {container} = render(
      <Item
        label="External"
        href="https://example.com"
        target="_blank"
        rel="sponsored noopener"
      />,
    );
    const anchor = container.querySelector('a');
    expect(anchor).toHaveAttribute('rel', 'sponsored noopener noreferrer');
  });

  it('does not render button or anchor for static items', () => {
    const {container} = render(<Item label="Static" />);
    expect(container.querySelector('button')).not.toBeInTheDocument();
    expect(container.querySelector('a')).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Disabled state
  // ===========================================================================

  it('applies aria-disabled when isDisabled', () => {
    render(<Item label="Disabled" isDisabled data-testid="item" />);
    expect(screen.getByTestId('item')).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables the invisible button when isDisabled', () => {
    const {container} = render(
      <Item label="Disabled" onClick={() => {}} isDisabled />,
    );
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('does not fire onClick when disabled item is clicked', async () => {
    const onClick = vi.fn();
    render(
      <Item label="Disabled" onClick={onClick} isDisabled data-testid="item" />,
    );
    const item = screen.getByTestId('item');
    item.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not set aria-disabled when not disabled', () => {
    render(<Item label="Item" data-testid="item" />);
    expect(screen.getByTestId('item')).not.toHaveAttribute('aria-disabled');
  });

  // ===========================================================================
  // Selected state
  // ===========================================================================

  it('conveys selection via aria-current on the default div root', () => {
    // aria-selected is invalid ARIA on a generic div (axe: aria-allowed-attr),
    // so selection is exposed via aria-current, which is valid on any element.
    render(<Item label="Selected" isSelected data-testid="item" />);
    const item = screen.getByTestId('item');
    expect(item).not.toHaveAttribute('aria-selected');
    expect(item).toHaveAttribute('aria-current', 'true');
  });

  it('applies aria-selected (not aria-current) when the role permits it', () => {
    render(
      <Item label="Selected" isSelected role="option" data-testid="item" />,
    );
    const item = screen.getByTestId('item');
    expect(item).toHaveAttribute('aria-selected', 'true');
    // A permitted role uses aria-selected; aria-current would be redundant.
    expect(item).not.toHaveAttribute('aria-current');
  });

  it('falls back to aria-current when the role does not permit aria-selected', () => {
    render(
      <Item label="Selected" isSelected role="menuitem" data-testid="item" />,
    );
    const item = screen.getByTestId('item');
    expect(item).not.toHaveAttribute('aria-selected');
    expect(item).toHaveAttribute('aria-current', 'true');
  });

  it('applies neither aria-selected nor aria-current when not selected', () => {
    render(<Item label="Not Selected" role="option" data-testid="item" />);
    const item = screen.getByTestId('item');
    expect(item).not.toHaveAttribute('aria-selected');
    expect(item).not.toHaveAttribute('aria-current');
  });

  it('lets a consumer-provided aria-current win over the selection default', () => {
    render(
      <Item label="Step" isSelected aria-current="step" data-testid="item" />,
    );
    expect(screen.getByTestId('item')).toHaveAttribute('aria-current', 'step');
  });

  // ===========================================================================
  // Highlighted state
  // ===========================================================================

  it('renders with isHighlighted without errors', () => {
    render(<Item label="Highlighted" isHighlighted data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
  });

  // ===========================================================================
  // Marker, start, and end slot positions
  // ===========================================================================

  it('marker, startContent, and endContent are siblings to invisible button', () => {
    const {container} = render(
      <Item
        label="Item"
        onClick={() => {}}
        marker={<span data-testid="marker">•</span>}
        startContent={<span data-testid="start">S</span>}
        endContent={<span data-testid="end">E</span>}
      />,
    );
    const button = container.querySelector('button');
    const root = container.firstElementChild;
    expect(root?.querySelector('[data-testid="marker"]')).toBeInTheDocument();
    expect(root?.querySelector('[data-testid="start"]')).toBeInTheDocument();
    expect(root?.querySelector('[data-testid="end"]')).toBeInTheDocument();
    expect(
      button?.querySelector('[data-testid="marker"]'),
    ).not.toBeInTheDocument();
    expect(
      button?.querySelector('[data-testid="start"]'),
    ).not.toBeInTheDocument();
    expect(
      button?.querySelector('[data-testid="end"]'),
    ).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Density variants
  // ===========================================================================

  it('renders with balanced density by default', () => {
    render(<Item label="Item" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
    expect(screen.getByTestId('item')).toHaveAttribute(
      'data-density',
      'balanced',
    );
  });

  it('renders with compact density', () => {
    render(<Item label="Item" density="compact" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
  });

  it('renders with spacious density', () => {
    render(<Item label="Item" density="spacious" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
    expect(screen.getByTestId('item')).toHaveAttribute(
      'data-density',
      'spacious',
    );
  });

  // ===========================================================================
  // Alignment
  // ===========================================================================

  it('renders with center alignment by default', () => {
    render(<Item label="Item" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
  });

  it('renders with start alignment', () => {
    render(<Item label="Item" align="start" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
  });

  it('reflects the resolved alignment on the item theme target', () => {
    const {rerender} = render(<Item label="Item" data-testid="item" />);
    expect(screen.getByTestId('item')).toHaveAttribute('data-align', 'center');
    for (const align of ['center', 'start', 'first-line'] as const) {
      rerender(<Item label="Item" align={align} data-testid="item" />);
      const item = screen.getByTestId('item');
      expect(item).toHaveClass('astryx-item');
      expect(item).toHaveAttribute('data-align', align);
    }
  });

  it('aligns the row on first baselines only under first-line', () => {
    const {rerender} = render(<Item label="Item" data-testid="item" />);
    const declares = (value: string) =>
      rulesDeclaredFor(screen.getByTestId('item')).some(rule =>
        rule.includes(`align-items: ${value}`),
      );
    expect(declares('baseline')).toBe(false);
    rerender(<Item label="Item" align="start" data-testid="item" />);
    expect(declares('baseline')).toBe(false);
    rerender(<Item label="Item" align="first-line" data-testid="item" />);
    expect(declares('baseline')).toBe(true);
  });

  it('gives each first-line slot a strut with no accessible text', () => {
    render(
      <Item
        label="Item"
        align="first-line"
        startContent={<span data-testid="start">S</span>}
        endContent={<span data-testid="end">E</span>}
      />,
    );
    for (const id of ['start', 'end']) {
      const slot = screen.getByTestId(id).parentElement!;
      const before = rulesDeclaredFor(slot).filter(rule =>
        rule.slice(0, rule.indexOf('{')).includes('::before'),
      );
      expect(before.some(rule => rule.includes('/ ""'))).toBe(true);
    }
  });

  it('leaves center and start slots without a strut', () => {
    const {rerender} = render(
      <Item label="Item" startContent={<span data-testid="start">S</span>} />,
    );
    const hasStrut = () =>
      rulesDeclaredFor(screen.getByTestId('start').parentElement!).some(rule =>
        rule.slice(0, rule.indexOf('{')).includes('::before'),
      );
    expect(hasStrut()).toBe(false);
    rerender(
      <Item
        label="Item"
        align="start"
        startContent={<span data-testid="start">S</span>}
      />,
    );
    expect(hasStrut()).toBe(false);
  });

  // ===========================================================================
  // Description rendering
  // ===========================================================================

  it('does not render description when not provided', () => {
    render(<Item label="Label Only" />);
    expect(screen.getByText('Label Only')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('accepts ReactNode as description', () => {
    render(
      <Item
        label="Item"
        description={
          <div>
            <span>Rich</span> <span>description</span>
          </div>
        }
      />,
    );
    expect(screen.getByText('Rich')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('accepts ReactNode as label', () => {
    render(
      <Item
        label={
          <span>
            <b>Alice</b> commented
          </span>
        }
      />,
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/commented/)).toBeInTheDocument();
  });
  it('puts the label and description in one row when layout is inline', () => {
    const stacked = render(
      <Item label="Private" description="Only members can access" />,
    );
    const stackedRow = screen.getByText('Private').parentElement;
    stacked.unmount();

    render(
      <Item
        label="Private"
        description="Only members can access"
        layout="inline"
      />,
    );
    const inlineRow = screen.getByText('Private').parentElement;

    // Same container, different styling: the shared content box switches from
    // a column to a row, so its class list must differ from the stacked one.
    expect(inlineRow?.className).not.toBe(stackedRow?.className);
  });

  it('ellipsizes a ReactNode description when layout is inline', () => {
    // A stacked ReactNode description is left alone (it may wrap); an inline
    // one is one line by definition, so it truncates like a string does.
    const stacked = render(
      <Item
        label="Private"
        description={<span>Only members can access</span>}
      />,
    );
    const stackedDescription = screen.getByText('Only members can access')
      .parentElement?.className;
    stacked.unmount();

    render(
      <Item
        label="Private"
        description={<span>Only members can access</span>}
        layout="inline"
      />,
    );
    expect(
      screen.getByText('Only members can access').parentElement?.className,
    ).not.toBe(stackedDescription);
  });

  it('ignores inline layout when there is no description', () => {
    render(<Item label="Private" layout="inline" />);
    expect(screen.getByText('Private')).toBeInTheDocument();
  });
});

describe('swipeActions', () => {
  // The gesture system outlives a test (one per document) and keeps the time
  // of the touches it has seen; a document clock never runs backwards, so
  // each test's fake clock starts after the last one's.
  let epoch = 0;
  beforeEach(() => {
    // The suite answers as a phone (a coarse primary pointer), where Reduce
    // Motion cross-fades every change; `under a fine primary pointer` below
    // checks that a finger swipes there too and a mouse never does.
    emulateTouch();
    // The gesture reads touch times, and the springs run on the document
    // clock and finish on timers: fake them all and move them together.
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'Date',
        'performance',
      ],
    });
    epoch += 100_000;
    vi.advanceTimersByTime(epoch);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  interface Contact {
    id: number;
    x: number;
    y: number;
    target: Element;
  }

  /** The fingers down on the page, for each touch event's `touches`. */
  const down = new Map<number, Contact>();

  /**
   * A touch event as a phone sends it, stamped with the document clock. The
   * gesture system reads touches from touch events (jsdom has `ontouchstart`,
   * as a phone does), so a finger here is its touch events.
   */
  function sendTouch(
    type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
    contact: Contact,
    cancelable = type !== 'touchcancel',
  ): Event {
    const event = new Event(type, {
      bubbles: true,
      cancelable,
      composed: true,
    });
    const toTouch = (c: Contact) => ({
      identifier: c.id,
      clientX: c.x,
      clientY: c.y,
      target: c.target,
    });
    Object.defineProperty(event, 'changedTouches', {
      value: [toTouch(contact)],
    });
    Object.defineProperty(event, 'touches', {
      value: [...down.values()].map(toTouch),
    });
    Object.defineProperty(event, 'timeStamp', {value: performance.now()});
    contact.target.dispatchEvent(event);
    return event;
  }

  /**
   * One finger: `down` lands it, `move` slides it (16 ms per step, a frame),
   * `rest` holds it still, `up` lifts it (a frame later, or at once for a
   * flick that is still moving when it lifts). Each returns the event it
   * sent, so a test can ask whether the row cancelled it. A resting finger
   * keeps reporting where it is, which is what brings UIKit's velocity
   * filter (the gesture system's) down to rest: it never decays on its own.
   */
  function finger(target: Element, id = 1) {
    let contact: Contact = {id, x: 0, y: 10, target};
    const send = (
      type: Parameters<typeof sendTouch>[0],
      cancelable?: boolean,
    ) => {
      let event: Event | undefined;
      act(() => {
        event = sendTouch(type, contact, cancelable);
      });
      return event as Event;
    };
    return {
      down(x: number, y = 10) {
        void act(() => vi.advanceTimersByTime(16));
        contact = {id, x, y, target};
        down.set(id, contact);
        return send('touchstart');
      },
      /** `cancelable: false`: the browser is already panning or zooming with this finger. */
      move(x: number, y = contact.y, {cancelable = true} = {}) {
        void act(() => vi.advanceTimersByTime(16));
        contact = {...contact, x, y};
        down.set(id, contact);
        return send('touchmove', cancelable);
      },
      rest(ms = 320) {
        for (let t = 0; t < ms; t += 16) {
          void act(() => vi.advanceTimersByTime(16));
          send('touchmove');
        }
      },
      up({afterMs = 16} = {}) {
        void act(() => vi.advanceTimersByTime(afterMs));
        down.delete(id);
        return send('touchend');
      },
      cancel() {
        down.delete(id);
        return send('touchcancel');
      },
    };
  }
  afterEach(() => {
    down.clear();
  });

  /** Long enough for any settle to finish, and for what it lands to render. */
  const settled = async () => {
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
  };

  /**
   * The travel the row's transforms read, in physical px. The gesture writes
   * it once per frame, so a frame passes first.
   */
  const xOf = (row: HTMLElement) => {
    void act(() => vi.advanceTimersByTime(16));
    return parseFloat(
      row.style.getPropertyValue('--_item-swipe-travel') || '0',
    );
  };

  /** The panel of a side: the out-of-flow child on the root carrying it. */
  const panelOf = (row: HTMLElement, side: 'leading' | 'trailing') =>
    row.querySelector<HTMLElement>(`[data-swipe-panel="${side}"]`);
  const entriesOf = (row: HTMLElement, side: 'leading' | 'trailing') =>
    panelOf(row, side)?.firstElementChild as HTMLElement;

  /**
   * jsdom lays nothing out: give the row a width and each side's entries a
   * natural width of 72 px per entry, as the real panel measures them.
   */
  function layOut(row: HTMLElement) {
    Object.defineProperty(row, 'clientWidth', {configurable: true, value: 300});
    for (const side of ['leading', 'trailing'] as const) {
      const entries = panelOf(row, side) == null ? null : entriesOf(row, side);
      if (entries != null) {
        Object.defineProperty(entries, 'offsetWidth', {
          configurable: true,
          value: 72 * entries.childElementCount,
        });
      }
    }
  }

  type Entry = {
    label: string;
    onActivate: () => void;
    hasRemoval?: boolean;
    isDisabled?: boolean;
    variant?: 'neutral' | 'accent' | 'destructive';
  };

  function renderRow({
    leading = [{label: 'Unread', onActivate: vi.fn()}],
    trailing,
    behavior,
    onClick = vi.fn(),
  }: {
    leading?: Entry[];
    trailing?: Entry[];
    behavior?: 'reveal' | 'commit';
    onClick?: () => void;
  } = {}) {
    render(
      <Item
        label="Conversation"
        onClick={onClick}
        data-testid="row"
        swipeActions={{leading, trailing}}
        swipeBehavior={behavior}
      />,
    );
    const row = screen.getByTestId('row');
    layOut(row);
    return {row, onClick};
  }

  /**
   * A drag toward the leading side (rightward) by `travel` px of swipe, past
   * the 25 px the pan needs to begin, held still, then lifted.
   */
  function dragLeading(row: HTMLElement, travel: number) {
    const f = finger(row);
    f.down(10);
    f.move(20);
    f.move(35); // 25 px: the swipe begins here, at 0
    f.move(35 + travel / 2);
    f.move(35 + travel);
    f.rest();
    f.up();
    return f;
  }

  it('swipes on the first touch right after mount, with no import to wait for', async () => {
    // The first row with swipe actions in this file: a lazily loaded layer
    // would still be on its way here, and the touch would move nothing.
    const {row} = renderRow();
    dragLeading(row, 45);
    await settled();
    expect(xOf(row)).toBe(72);
  });

  it('is served on a role-less row and a listitem, and not on a row whose role forbids interactive descendants', () => {
    const actions = {leading: [{label: 'Unread', onActivate: vi.fn()}]};
    const {rerender} = render(
      <Item label="A" data-testid="row" swipeActions={actions} />,
    );
    expect(panelOf(screen.getByTestId('row'), 'leading')).not.toBeNull();
    rerender(
      <Item as="li" label="A" data-testid="row" swipeActions={actions} />,
    );
    expect(panelOf(screen.getByTestId('row'), 'leading')).not.toBeNull();
    for (const role of [
      'option',
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
    ]) {
      rerender(
        <Item role={role} label="A" data-testid="row" swipeActions={actions} />,
      );
      expect(panelOf(screen.getByTestId('row'), 'leading')).toBeNull();
    }
  });

  it('is not served on a row that is the enlarged target of a nested control, nor on a disabled row', () => {
    const actions = {leading: [{label: 'Unread', onActivate: vi.fn()}]};
    function Delegating() {
      const inputRef = useRef<HTMLInputElement>(null);
      return (
        <Item
          label="A"
          data-testid="row"
          interactiveRef={inputRef}
          startContent={<input ref={inputRef} type="radio" />}
          swipeActions={actions}
        />
      );
    }
    const {unmount} = render(<Delegating />);
    expect(panelOf(screen.getByTestId('row'), 'leading')).toBeNull();
    unmount();
    render(
      <Item label="A" data-testid="row" isDisabled swipeActions={actions} />,
    );
    expect(panelOf(screen.getByTestId('row'), 'leading')).toBeNull();
  });

  it('adds no element to a row without swipe actions, and no wrapper to one with them', () => {
    const {rerender} = render(
      <ul data-testid="list">
        <Item as="li" label="A" data-testid="row" />
      </ul>,
    );
    const before = screen.getByTestId('row').childElementCount;
    rerender(
      <ul data-testid="list">
        <Item
          as="li"
          label="A"
          data-testid="row"
          swipeActions={{trailing: [{label: 'Archive', onActivate: vi.fn()}]}}
        />
      </ul>,
    );
    const row = screen.getByTestId('row');
    // The root is the row; the list is its parent, so the `li` stays the
    // list's direct child. The panel is the one child the actions add.
    expect(row.tagName).toBe('LI');
    expect(row.parentElement).toBe(screen.getByTestId('list'));
    expect(row.childElementCount).toBe(before + 1);
    expect(panelOf(row, 'trailing')).toBe(row.lastElementChild);
    expect(panelOf(row, 'leading')).toBeNull();
  });

  it('keeps the panel out of the accessibility tree and the tab order at rest, with no pixel of it painted', () => {
    const {row} = renderRow();
    const panel = panelOf(row, 'leading') as HTMLElement;
    // Inert: not in the tree, not in the tab order, so the row keeps one tab
    // stop and a pointer that can hover never meets it.
    expect(panel).toHaveAttribute('inert');
    expect(
      screen.getByRole('button', {name: 'Unread'}).closest('[inert]'),
    ).toBe(panel);
    // Zero width with no padding of its own: a padded box at `width: 0` is
    // still as wide as its padding and would paint a sliver of the colour.
    expect(rulesDeclaredFor(panel).some(r => r.includes('padding'))).toBe(
      false,
    );
    // Its width is the travel toward its side, floored at zero; at rest the
    // travel is unset.
    expect(
      rulesDeclaredFor(panel).some(r => r.includes('width: max(0px')),
    ).toBe(true);
    expect(row.style.getPropertyValue('--_item-swipe-travel')).toBe('');
  });

  it("claims the touch at 8 px, before a browser would scroll it, and moves the row only past UIKit's 25 px, from 0", () => {
    const {row} = renderRow();
    const f = finger(row);
    f.down(10);
    // Short of the claim the scroller may still take the touch: the
    // default stands.
    expect(f.move(15).defaultPrevented).toBe(false);
    // 10 px, mostly sideways: the row's. Every further touchmove is
    // cancelled, which is what keeps a browser (iOS Safari commits at about
    // 10 px) from scrolling a drag that is not perfectly level.
    expect(f.move(20, 12).defaultPrevented).toBe(true);
    // The swipe itself has not begun: the row has not moved.
    expect(f.move(34, 13).defaultPrevented).toBe(true);
    expect(xOf(row)).toBe(0);
    // 25 px: the swipe begins, at 0 (the threshold's travel is not part of
    // it, as in UIKit).
    expect(f.move(35, 14).defaultPrevented).toBe(true);
    expect(xOf(row)).toBe(0);
    expect(f.move(55, 16).defaultPrevented).toBe(true);
    expect(xOf(row)).toBe(20);
    // The row owned the touch, so the lift is cancelled too: no click is
    // synthesized from it.
    expect(f.up().defaultPrevented).toBe(true);
  });

  it('counts the swipe from where the finger crossed the threshold, so coming back past the start moves nothing', () => {
    const {row} = renderRow();
    const f = finger(row);
    f.down(10);
    f.move(20);
    f.move(35);
    f.move(60);
    expect(xOf(row)).toBe(25);
    // Back to 10 px short of the touch-down point: the row is home, and
    // stays there rather than counting the threshold the other way.
    f.move(20);
    expect(xOf(row)).toBe(0);
    f.move(4);
    expect(xOf(row)).toBe(0);
    f.up();
  });

  describe('under a fine primary pointer (a touchscreen laptop, a mouse)', () => {
    // The rest of the suite answers as a phone; here the primary pointer is
    // fine. The gesture reads each touch's pointer (`spec:AST-057`): a finger
    // swipes the row whatever the primary pointer, and a mouse never does.
    beforeEach(() => {
      vi.unstubAllGlobals();
    });

    it('swipes under a finger, claiming the touch and resting open as on a phone', async () => {
      // A fine primary pointer in this context, before anything is checked.
      expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
      const {row} = renderRow();
      expect(panelOf(row, 'leading')).toHaveAttribute('inert');
      const f = finger(row);
      f.down(10);
      // Claimed at 8 px, before a browser would scroll it.
      expect(f.move(20).defaultPrevented).toBe(true);
      f.move(35);
      f.move(80);
      f.rest();
      f.up();
      await settled();
      expect(xOf(row)).toBe(72);
      expect(panelOf(row, 'leading')).not.toHaveAttribute('inert');
    });

    it('keeps every other recognizer on the gesture host inactive while a finger swipes the row (spec:AST-094 FR19; the row swipe reads each event, spec:AST-057)', async () => {
      expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
      const taps: string[] = [];
      function Other() {
        const ref = useRef<HTMLDivElement>(null);
        useGestureRecognizer(
          ref,
          () => new TapGestureRecognizer({name: 'test-other-tap'}),
          tap => {
            taps.push(tap.state);
          },
        );
        return <div ref={ref} data-testid="other" />;
      }
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const {row} = renderRow();
      render(<Other />);
      const t = finger(screen.getByTestId('other'), 3);
      t.down(20);
      t.up();
      // Not opted out of the gate: inactive where the primary pointer is fine.
      expect(taps).not.toContain('ended');
      // The row swipes under a finger beside it.
      dragLeading(row, 45);
      await settled();
      expect(xOf(row)).toBe(72);
      warn.mockRestore();
      // The control: on a phone's pointer the same tap is recognized.
      const coarse = pointerQuery(true);
      try {
        cleanup();
        taps.length = 0;
        render(<Other />);
        const u = finger(screen.getByTestId('other'), 4);
        u.down(20);
        u.up();
        expect(taps).toContain('ended');
      } finally {
        coarse.restore();
      }
    });

    it('never swipes under a mouse', async () => {
      expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
      const {row} = renderRow();
      const mouse = (type: string, x: number) =>
        act(() => {
          row.dispatchEvent(
            new PointerEvent(type, {
              bubbles: true,
              button: 0,
              buttons: type === 'pointerup' ? 0 : 1,
              clientX: x,
              clientY: 10,
              pointerId: 1,
              pointerType: 'mouse',
            }),
          );
        });
      mouse('pointerdown', 10);
      mouse('pointermove', 60);
      mouse('pointermove', 120);
      mouse('pointerup', 120);
      await settled();
      expect(xOf(row)).toBe(0);
      expect(panelOf(row, 'leading')).toHaveAttribute('inert');
    });
  });

  it('leaves the row as it was when a claimed touch lifts before the swipe begins', async () => {
    const {row} = renderRow();
    const f = finger(row);
    f.down(10);
    f.move(30);
    expect(f.up().defaultPrevented).toBe(true);
    expect(xOf(row)).toBe(0);
    expect(panelOf(row, 'leading')).toHaveAttribute('inert');
    // An open row stays open, its panel live.
    dragLeading(row, 45);
    await settled();
    expect(xOf(row)).toBe(72);
    const g = finger(row);
    g.down(150);
    g.move(135);
    g.up();
    await settled();
    expect(xOf(row)).toBe(72);
    expect(panelOf(row, 'leading')).not.toHaveAttribute('inert');
  });

  it('springs back when the browser cancels a swipe in progress', async () => {
    const onActivate = vi.fn();
    const {row} = renderRow({leading: [{label: 'Unread', onActivate}]});
    const f = finger(row);
    f.down(10);
    f.move(20);
    f.move(35);
    f.move(95);
    expect(xOf(row)).toBe(60);
    f.cancel();
    expect(xOf(row)).toBe(0);
    await settled();
    expect(xOf(row)).toBe(0);
    expect(panelOf(row, 'leading')).toHaveAttribute('inert');
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('leaves a mostly vertical drag to the scroller and never cancels its touchmove', () => {
    const {row} = renderRow();
    const f = finger(row);
    f.down(10, 10);
    expect(f.move(14, 40).defaultPrevented).toBe(false);
    expect(f.move(60, 200).defaultPrevented).toBe(false);
    expect(xOf(row)).toBe(0);
    expect(f.up().defaultPrevented).toBe(false);
  });

  it('ignores a mouse', () => {
    const {row} = renderRow();
    const mouse = (type: string, x: number) =>
      act(() => {
        row.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            button: 0,
            buttons: type === 'pointerup' ? 0 : 1,
            clientX: x,
            clientY: 10,
            pointerId: 1,
            pointerType: 'mouse',
          }),
        );
      });
    mouse('pointerdown', 10);
    mouse('pointermove', 60);
    mouse('pointermove', 120);
    expect(xOf(row)).toBe(0);
    mouse('pointerup', 120);
  });

  it('does not move toward a side without entries', () => {
    const {row} = renderRow({
      leading: [{label: 'Unread', onActivate: vi.fn()}],
    });
    const f = finger(row);
    f.down(200);
    f.move(180);
    expect(f.move(150).defaultPrevented).toBe(false);
    expect(xOf(row)).toBe(0);
    f.up();
  });

  describe('a pinch', () => {
    it('lets the touch go when a second finger lands before the swipe begins', () => {
      const {row} = renderRow();
      const first = finger(row, 1);
      const second = finger(row, 2);
      first.down(100);
      second.down(60);
      // The fingers spread apart; the first one travels toward the leading
      // side far past the threshold.
      first.move(130);
      second.move(30);
      expect(first.move(160).defaultPrevented).toBe(false);
      expect(xOf(row)).toBe(0);
      first.up();
      second.up();
    });

    it('lets the touch go when the second finger lands off the row and the browser zooms', () => {
      const {row} = renderRow();
      const first = finger(row, 1);
      const second = finger(document.body, 2);
      first.down(100);
      second.down(60, 200);
      // The browser starts its pinch: it cancels the fingers' pointers, as
      // Chromium does, and from here on no longer asks the page whether it
      // may (the moves arrive uncancelable).
      act(() => {
        const cancel = new PointerEvent('pointercancel', {
          bubbles: true,
          clientX: 100,
          clientY: 10,
          pointerId: 99,
          pointerType: 'touch',
        });
        Object.defineProperty(cancel, 'timeStamp', {value: performance.now()});
        row.dispatchEvent(cancel);
      });
      first.move(110, 10, {cancelable: false});
      first.move(130, 10, {cancelable: false});
      first.move(160, 10, {cancelable: false});
      expect(xOf(row)).toBe(0);
      first.up();
      second.up();
    });

    it('never starts a swipe from a second finger whose first finger is off the row: the pinch stays the page’s (spec:AST-094 FR10)', () => {
      const {row} = renderRow();
      // The first finger is somewhere else on the page; the second lands on
      // the row and travels sideways, past the claim and the swipe.
      const first = finger(document.body, 1);
      const second = finger(row, 2);
      first.down(60, 200);
      second.down(100);
      second.move(110);
      second.move(130);
      expect(second.move(160).defaultPrevented).toBe(false);
      expect(xOf(row)).toBe(0);
      second.up();
      first.up();
    });

    it('keeps a begun swipe when a second finger lands: the row stays on its finger, which it keeps from the browser (spec:AST-094 FR10)', async () => {
      const {row} = renderRow();
      const first = finger(row, 1);
      const second = finger(row, 2);
      first.down(10);
      first.move(20);
      first.move(35);
      first.move(55);
      expect(xOf(row)).toBe(20);
      second.down(200);
      // A second finger neither cancels nor redirects a claimed drag: the
      // row's finger is still the row's, its moves still cancelled.
      expect(first.move(75).defaultPrevented).toBe(true);
      expect(xOf(row)).toBe(40);
      second.up();
      first.rest();
      first.up();
      await settled();
      // Released held at 40 px of a 72 px panel: past half, it rests open.
      expect(xOf(row)).toBe(72);
    });
  });

  describe('reveal (the default)', () => {
    it('springs back when released short of half the panel', async () => {
      const {row} = renderRow();
      dragLeading(row, 30);
      // 30 px of a 72 px panel, released at rest: short.
      expect(xOf(row)).toBe(0);
      await settled();
      expect(xOf(row)).toBe(0);
      expect(panelOf(row, 'leading')).toHaveAttribute('inert');
    });

    it('rests open past half the panel, with every entry a real button, and fires a tapped entry', async () => {
      const onActivate = vi.fn();
      const onClick = vi.fn();
      const {row} = renderRow({
        leading: [{label: 'Unread', onActivate}],
        onClick,
      });
      dragLeading(row, 45);
      await settled();
      // Resting at the panel's width; the panel is live.
      expect(xOf(row)).toBe(72);
      const panel = panelOf(row, 'leading') as HTMLElement;
      expect(panel).not.toHaveAttribute('inert');
      const button = screen.getByRole('button', {name: 'Unread'});
      expect(button).toBeVisible();
      // A tap fires it at once; without `hasRemoval` the row closes.
      fireEvent.click(button);
      expect(onActivate).toHaveBeenCalledTimes(1);
      await settled();
      expect(xOf(row)).toBe(0);
      expect(panel).toHaveAttribute('inert');
      // The row's own primary never fired.
      expect(onClick).not.toHaveBeenCalled();
    });

    it('holds the row out after a tapped entry with hasRemoval', async () => {
      const onActivate = vi.fn();
      const {row} = renderRow({
        trailing: [{label: 'Archive', onActivate, hasRemoval: true}],
        leading: [],
      });
      const f = finger(row);
      f.down(200);
      f.move(185);
      f.move(170);
      f.move(150);
      f.move(130);
      f.rest();
      f.up();
      await settled();
      expect(xOf(row)).toBe(-72);
      fireEvent.click(screen.getByRole('button', {name: 'Archive'}));
      expect(onActivate).toHaveBeenCalledTimes(1);
      await settled();
      // Out past the edge it travelled toward, and staying there: the
      // caller removes the row, or it sits off-screen (their bug).
      expect(xOf(row)).toBe(-324);
      await settled();
      expect(xOf(row)).toBe(-324);
      // A row that is out takes no swipe.
      const g = finger(row);
      g.down(100);
      g.move(130);
      expect(g.move(160).defaultPrevented).toBe(false);
      g.up();
    });

    it('keeps the other side’s panel inert while the row rests open: only the open side’s entries are in the tab order and the accessibility tree', async () => {
      const {row} = renderRow({
        leading: [{label: 'Unread', onActivate: vi.fn()}],
        trailing: [
          {label: 'Delete', onActivate: vi.fn(), variant: 'destructive'},
        ],
      });
      dragLeading(row, 45);
      await settled();
      expect(xOf(row)).toBe(72);
      expect(panelOf(row, 'leading')).not.toHaveAttribute('inert');
      // The trailing panel is out of sight behind the row: nothing in it
      // takes focus or reaches assistive technology.
      expect(panelOf(row, 'trailing')).toHaveAttribute('inert');
    });

    it('closes a resting row on a pointer outside it, and on Escape with focus inside', async () => {
      const {row} = renderRow();
      const open = async () => {
        dragLeading(row, 45);
        await settled();
        expect(xOf(row)).toBe(72);
      };
      await open();
      // A drag on a neighbour is a pointer outside this row.
      fireEvent.pointerDown(document.body, {
        pointerId: 9,
        pointerType: 'touch',
      });
      await settled();
      expect(xOf(row)).toBe(0);
      await open();
      const button = screen.getByRole('button', {name: 'Unread'});
      button.focus();
      fireEvent.keyDown(button, {key: 'Escape'});
      await settled();
      expect(xOf(row)).toBe(0);
      // Focus lands on the row's own content, not on a now-inert button.
      expect(document.activeElement).toBe(
        screen.getByRole('button', {name: 'Conversation'}),
      );
    });

    it('fires the outermost entry and no other on a drag past the commit point, then springs back', async () => {
      const inner = vi.fn();
      const outer = vi.fn();
      const {row} = renderRow({
        leading: [
          {label: 'Unread', onActivate: inner},
          {label: 'Pin', onActivate: outer},
        ],
      });
      // Two entries: a 144 px panel; the commit point is 192 (panel + 48),
      // past half the 300 px row.
      dragLeading(row, 200);
      expect(outer).not.toHaveBeenCalled();
      // One beat: the slide out, then the entry fires.
      expect(xOf(row)).toBe(324);
      await settled();
      expect(outer).toHaveBeenCalledTimes(1);
      expect(inner).not.toHaveBeenCalled();
      // No `hasRemoval`: back home.
      await settled();
      expect(xOf(row)).toBe(0);
    });

    it('commits on a fling short of the commit point', async () => {
      const onActivate = vi.fn();
      const {row} = renderRow({leading: [{label: 'Unread', onActivate}]});
      const f = finger(row);
      f.down(10);
      f.move(20);
      f.move(35);
      f.move(55);
      // 45 px of swipe, still moving fast when it lifts.
      f.move(80);
      f.up({afterMs: 0});
      await settled();
      expect(onActivate).toHaveBeenCalledTimes(1);
    });

    it('lays the entries outermost last: at the leading edge the row of entries runs in reverse', () => {
      const {row} = renderRow({
        leading: [
          {label: 'Unread', onActivate: vi.fn()},
          {label: 'Pin', onActivate: vi.fn()},
        ],
        trailing: [
          {label: 'Archive', onActivate: vi.fn()},
          {label: 'Delete', onActivate: vi.fn(), variant: 'destructive'},
        ],
      });
      const leading = entriesOf(row, 'leading');
      const trailing = entriesOf(row, 'trailing');
      expect(
        rulesDeclaredFor(leading).some(r =>
          r.includes('flex-direction: row-reverse'),
        ),
      ).toBe(true);
      expect(
        rulesDeclaredFor(trailing).some(r =>
          r.includes('flex-direction: row-reverse'),
        ),
      ).toBe(false);
      // The panel wears its outermost entry's colour, so a slide-out fills
      // the row with it.
      const trackClasses = (panelOf(row, 'trailing') as HTMLElement).className;
      const deleteClasses = (trailing.lastElementChild as HTMLElement)
        .className;
      expect(trackClasses.split(' ').some(c => deleteClasses.includes(c))).toBe(
        true,
      );
    });
  });

  describe('commit', () => {
    it('slides out and fires on a release past the commit point; nothing rests', async () => {
      const onActivate = vi.fn();
      const {row} = renderRow({
        behavior: 'commit',
        leading: [{label: 'Unread', onActivate}],
      });
      const panel = panelOf(row, 'leading') as HTMLElement;
      // Presentational at all times: nothing in it is ever tappable.
      expect(panel).toHaveAttribute('aria-hidden', 'true');
      expect(panel.querySelector('button')).toBeNull();
      // One entry: 72 px panel; the commit point is half the 300 px row.
      dragLeading(row, 160);
      expect(xOf(row)).toBe(324);
      await settled();
      expect(onActivate).toHaveBeenCalledTimes(1);
      await settled();
      expect(xOf(row)).toBe(0);
      expect(panel).toHaveAttribute('aria-hidden', 'true');
    });

    it('springs back from any release short of the commit point, even past the panel', async () => {
      const onActivate = vi.fn();
      const {row} = renderRow({
        behavior: 'commit',
        leading: [{label: 'Unread', onActivate}],
      });
      dragLeading(row, 100);
      await settled();
      expect(onActivate).not.toHaveBeenCalled();
      expect(xOf(row)).toBe(0);
    });

    it('commits on a fling short of the commit point', async () => {
      const onActivate = vi.fn();
      const {row} = renderRow({
        behavior: 'commit',
        leading: [{label: 'Unread', onActivate}],
      });
      const f = finger(row);
      f.down(10);
      f.move(25);
      f.move(40);
      f.move(60);
      f.move(80);
      f.up({afterMs: 0});
      await settled();
      expect(onActivate).toHaveBeenCalledTimes(1);
    });

    it('holds out after a committed entry with hasRemoval', async () => {
      const onActivate = vi.fn();
      const {row} = renderRow({
        behavior: 'commit',
        leading: [{label: 'Archive', onActivate, hasRemoval: true}],
      });
      dragLeading(row, 160);
      await settled();
      expect(onActivate).toHaveBeenCalledTimes(1);
      await settled();
      expect(xOf(row)).toBe(324);
    });

    it('warns in development when a committing side has more than one entry', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        renderRow({
          behavior: 'commit',
          leading: [
            {label: 'Unread', onActivate: vi.fn()},
            {label: 'Pin', onActivate: vi.fn()},
          ],
        });
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('swipeBehavior="commit"'),
        );
      } finally {
        warn.mockRestore();
      }
    });
  });

  it('reads the direction logically under RTL: leading is toward the inline end, and the sign rides the root', async () => {
    // jsdom resolves `direction` only on the element that carries `dir`; a
    // browser inherits it down to the row, so resolve that inheritance by
    // hand for this test.
    const original = window.getComputedStyle.bind(window);
    const spy = vi
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((element, pseudo) => {
        const style = original(element, pseudo ?? undefined);
        if (element.closest('[dir="rtl"]') != null) {
          Object.defineProperty(style, 'direction', {
            configurable: true,
            value: 'rtl',
          });
        }
        return style;
      });
    try {
      const onActivate = vi.fn();
      render(
        <div dir="rtl">
          <Item
            label="Conversation"
            onClick={vi.fn()}
            data-testid="row"
            swipeActions={{leading: [{label: 'Unread', onActivate}]}}
          />
        </div>,
      );
      const row = screen.getByTestId('row');
      layOut(row);
      // Toward the inline end is leftward: the finger moves to smaller x.
      const f = finger(row);
      f.down(200);
      f.move(190);
      f.move(175);
      f.move(155);
      f.move(135);
      // Physical travel is negative; the transforms multiply by the sign.
      expect(xOf(row)).toBe(-40);
      expect(row.style.getPropertyValue('--_item-swipe-dir')).toBe('-1');
      f.rest();
      f.up();
      await settled();
      expect(xOf(row)).toBe(-72);
      // Rightward from a closed row is toward the inline start: no trailing
      // entries, so it is not claimed.
      fireEvent.pointerDown(document.body, {
        pointerId: 9,
        pointerType: 'touch',
      });
      await settled();
      expect(xOf(row)).toBe(0);
      const g = finger(row);
      g.down(10);
      g.move(40);
      expect(g.move(70).defaultPrevented).toBe(false);
      expect(xOf(row)).toBe(0);
      g.up();
    } finally {
      spy.mockRestore();
    }
  });
});
