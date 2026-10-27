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

  /** Answer `prefers-reduced-motion: reduce` on top of the page's other answers. */
  const reduceMotion = () => {
    const matchMedia = window.matchMedia.bind(window);
    vi.stubGlobal('matchMedia', (query: string) => {
      const list = matchMedia(query);
      return query === '(prefers-reduced-motion: reduce)'
        ? {...list, matches: true}
        : list;
    });
  };

  /**
   * Where a moving part is going: the animator writes each part's resting
   * value inline (jsdom runs no Web Animations, so that is all it writes).
   */
  const xOf = (element: Element | null) =>
    parseFloat(
      (element as HTMLElement | null)?.style.getPropertyValue('translate') ||
        '0',
    );

  /** The window of a side: the out-of-flow child of the root carrying it. */
  const panelOf = (row: HTMLElement, side: 'leading' | 'trailing') =>
    row.querySelector<HTMLElement>(`[data-swipe-panel="${side}"]`);
  const trackOf = (row: HTMLElement, side: 'leading' | 'trailing') =>
    panelOf(row, side)?.firstElementChild as HTMLElement;
  /** A side's entries: the track's children, each its own moving element. */
  const entriesOf = (row: HTMLElement, side: 'leading' | 'trailing') =>
    Array.from(trackOf(row, side)?.children ?? []) as HTMLElement[];

  /**
   * jsdom lays nothing out: give the row a width and each entry a natural
   * width of 72 px, as the real panel measures them.
   */
  function layOut(row: HTMLElement) {
    Object.defineProperty(row, 'clientWidth', {configurable: true, value: 300});
    for (const side of ['leading', 'trailing'] as const) {
      if (panelOf(row, side) == null) {
        continue;
      }
      for (const entry of entriesOf(row, side)) {
        Object.defineProperty(entry, 'offsetWidth', {
          configurable: true,
          value: 72,
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
    const {unmount} = render(
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
    return {row, onClick, unmount};
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
    // The window clips to the row's resting box and takes no touch; the
    // track that paints sits beside it at rest, so nothing shows.
    const windowRules = rulesDeclaredFor(panel).join(';');
    expect(windowRules).toContain('overflow: clip');
    expect(windowRules).toContain('pointer-events: none');
    const trackRules = rulesDeclaredFor(trackOf(row, 'leading')).join(';');
    expect(trackRules).toContain('inset-inline-end: 100%');
    expect(trackRules).not.toContain('padding');
    // Nothing moved: the root carries no translation of the swipe's.
    expect(row.style.getPropertyValue('translate')).toBe('');
  });

  it('moves only by transforms: the root, and a window, a track and entries that can never drift apart', () => {
    const {row} = renderRow({
      leading: [
        {label: 'Unread', onActivate: vi.fn()},
        {label: 'Pin', onActivate: vi.fn()},
      ],
    });
    const f = finger(row);
    f.down(10);
    f.move(20);
    f.move(35);
    f.move(95);
    // 60 px of swipe toward the leading side (rightward).
    expect(xOf(row)).toBe(60);
    // The window stays over the resting box; the track moves with the row;
    // every entry stays pinned at the outer edge (144 px of entries), as one
    // block with no wrapper.
    expect(xOf(panelOf(row, 'leading'))).toBe(-60);
    expect(xOf(trackOf(row, 'leading'))).toBe(60);
    expect(entriesOf(row, 'leading').map(xOf)).toEqual([144 - 60, 144 - 60]);
    // No layout property is ever written.
    for (const element of [
      row,
      panelOf(row, 'leading'),
      trackOf(row, 'leading'),
      ...entriesOf(row, 'leading'),
    ]) {
      const style = (element as HTMLElement).style;
      expect(style.width).toBe('');
      expect(style.left).toBe('');
      expect(style.transform).toBe('');
    }
    f.up();
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
    expect(row.style.getPropertyValue('translate')).toBe('');
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
    // Back to 10 px short of the touch-down point: the row heads home, and
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

    it('closes a row a finger opened on a tap on its content, as on a phone', async () => {
      expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
      const {row, onClick} = renderRow();
      dragLeading(row, 45);
      await settled();
      expect(xOf(row)).toBe(72);
      const f = finger(screen.getByRole('button', {name: 'Conversation'}), 2);
      f.down(150);
      // Taken at the lift: no click reaches the row.
      expect(f.up().defaultPrevented).toBe(true);
      await settled();
      expect(xOf(row)).toBe(0);
      expect(onClick).not.toHaveBeenCalled();
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
    expect(row.style.getPropertyValue('translate')).toBe('');
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
    expect(row.style.getPropertyValue('translate')).toBe('');
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
    expect(row.style.getPropertyValue('translate')).toBe('');
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
    expect(row.style.getPropertyValue('translate')).toBe('');
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
      expect(row.style.getPropertyValue('translate')).toBe('');
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
      expect(row.style.getPropertyValue('translate')).toBe('');
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

    it('fires a tapped entry while the row is still springing open: the row is open from its release', async () => {
      const onActivate = vi.fn();
      const onClick = vi.fn();
      const {row} = renderRow({
        leading: [{label: 'Unread', onActivate}],
        onClick,
      });
      dragLeading(row, 45);
      // Released past half the panel 16 ms ago: the settle has hundreds of
      // milliseconds left, yet the row already counts as open, so its panel
      // is live and an entry tapped now fires.
      const panel = panelOf(row, 'leading') as HTMLElement;
      expect(panel).not.toHaveAttribute('inert');
      fireEvent.click(screen.getByRole('button', {name: 'Unread'}));
      expect(onActivate).toHaveBeenCalledTimes(1);
      await settled();
      expect(xOf(row)).toBe(0);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('opens on a flick from short of half the panel, and fires nothing', async () => {
      const onActivate = vi.fn();
      const {row} = renderRow({leading: [{label: 'Unread', onActivate}]});
      const f = finger(row);
      f.down(10);
      f.move(25);
      f.move(40);
      // 12 px of swipe, still moving at about 850 px/s when it lifts: the
      // release projects far past half the panel.
      f.move(52);
      f.up({afterMs: 0});
      await settled();
      expect(xOf(row)).toBe(72);
      expect(onActivate).not.toHaveBeenCalled();
    });

    it('closes an open row on a flick back, even from past half the panel', async () => {
      const {row} = renderRow();
      dragLeading(row, 45);
      await settled();
      expect(xOf(row)).toBe(72);
      const f = finger(row);
      f.down(150);
      f.move(140);
      f.move(125); // 25 px: the swipe begins where the row is
      f.move(110);
      f.up({afterMs: 0});
      await settled();
      expect(xOf(row)).toBe(0);
    });

    it('catches a settling row where it is, without a jump', async () => {
      const {row} = renderRow();
      const f = finger(row);
      f.down(10);
      f.move(25);
      f.move(40);
      f.move(55);
      f.up({afterMs: 0});
      // A flick: the row is on its way to 72 px. A finger lands 100 ms in.
      void act(() => vi.advanceTimersByTime(100));
      const g = finger(row);
      g.down(150);
      g.move(160);
      g.move(175);
      // The swipe began: the row heads for where it was when the finger
      // caught it, neither back to 15 nor on to 72.
      const caught = xOf(row);
      expect(caught).toBeGreaterThan(15);
      expect(caught).toBeLessThan(72);
      g.move(185);
      expect(xOf(row)).toBeCloseTo(caught + 10, 5);
      g.rest();
      g.up();
      await settled();
      expect(xOf(row)).toBe(72);
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

    it('cross-fades a release under Reduce Motion instead of springing: it lands when the fade is over', async () => {
      // design:reduced-motion DR2 governs where UIKit keeps its spring: the
      // finger's own drag is direct manipulation, what its release starts
      // cross-fades.
      reduceMotion();
      const {row} = renderRow();
      dragLeading(row, 45);
      await act(async () => {
        vi.advanceTimersByTime(16);
      });
      // Mid-fade the row has not travelled: it lands at the bottom of the
      // dip. It is open from its release, as after a spring, so its panel is
      // already live.
      expect(xOf(row)).toBe(45);
      expect(panelOf(row, 'leading')).not.toHaveAttribute('inert');
      await act(async () => {
        vi.advanceTimersByTime(534);
      });
      expect(xOf(row)).toBe(72);
      expect(panelOf(row, 'leading')).not.toHaveAttribute('inert');
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

    it('closes a resting row on a tap on its own content, and the tap activates nothing', async () => {
      const {row, onClick} = renderRow();
      dragLeading(row, 45);
      await settled();
      expect(xOf(row)).toBe(72);
      const f = finger(screen.getByRole('button', {name: 'Conversation'}), 2);
      f.down(150);
      // Taken at the lift: its touchend is cancelled, so the browser makes no
      // click on the row.
      expect(f.up().defaultPrevented).toBe(true);
      await settled();
      expect(xOf(row)).toBe(0);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('counts a row open from the release that opens it: a tap while it settles open closes it', async () => {
      const {row, onClick} = renderRow();
      dragLeading(row, 45);
      // The spring is still on its way to rest open.
      const f = finger(screen.getByRole('button', {name: 'Conversation'}), 2);
      f.down(150);
      expect(f.up().defaultPrevented).toBe(true);
      await settled();
      expect(xOf(row)).toBe(0);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('takes no press while open: the root is no pressable surface from the release that opens it until it closes', async () => {
      const {row} = renderRow();
      expect(row).toHaveAttribute('data-astryx-pressable');
      dragLeading(row, 45);
      // Settling open already counts as open.
      expect(row).not.toHaveAttribute('data-astryx-pressable');
      await settled();
      expect(xOf(row)).toBe(72);
      expect(row).not.toHaveAttribute('data-astryx-pressable');
      const f = finger(screen.getByRole('button', {name: 'Conversation'}), 2);
      f.down(150);
      f.up();
      // Closing: a pressable surface again, for the next tap.
      expect(row).toHaveAttribute('data-astryx-pressable');
      await settled();
      expect(xOf(row)).toBe(0);
    });

    it('leaves a tap on a resting entry to the entry, and a tap on a closed row to the row', async () => {
      const {row} = renderRow();
      let f = finger(screen.getByRole('button', {name: 'Conversation'}), 2);
      f.down(150);
      expect(f.up().defaultPrevented).toBe(false);
      dragLeading(row, 45);
      await settled();
      f = finger(screen.getByRole('button', {name: 'Unread'}), 3);
      f.down(30);
      expect(f.up().defaultPrevented).toBe(false);
      expect(xOf(row)).toBe(72);
    });

    it('stays open on a scroll while focus is inside it, which may be the browser bringing a focused entry into view', async () => {
      const {row} = renderRow();
      dragLeading(row, 45);
      await settled();
      const entry = screen.getByRole('button', {name: 'Unread'});
      act(() => {
        entry.focus();
      });
      fireEvent.scroll(row.parentElement as HTMLElement);
      await settled();
      expect(xOf(row)).toBe(72);
      expect(document.activeElement).toBe(entry);
    });

    it('closes a resting row when anything holding it scrolls, and not for another scroller', async () => {
      const {row} = renderRow();
      dragLeading(row, 45);
      await settled();
      const elsewhere = document.createElement('div');
      document.body.append(elsewhere);
      fireEvent.scroll(elsewhere);
      await settled();
      expect(xOf(row)).toBe(72);
      // The row's parent stands in for the list: it scrolls, the row closes.
      fireEvent.scroll(row.parentElement as HTMLElement);
      await settled();
      expect(xOf(row)).toBe(0);
      elsewhere.remove();
    });

    it('fires the outermost entry and no other on a confirmed full swipe, then springs back', async () => {
      const inner = vi.fn();
      const outer = vi.fn();
      const {row} = renderRow({
        leading: [
          {label: 'Unread', onActivate: inner},
          {label: 'Pin', onActivate: outer},
        ],
      });
      // Two entries: a 144 px panel. The full swipe confirms 0.69 of the way
      // from it to 271 px (the 300 px row less 29): about 232 px.
      dragLeading(row, 240);
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

    it('starts every part of a release that continues the drag on one clock, so the window, track and entries stay in step with the row', async () => {
      // A browser's animations: one from rest starts when a frame commits it;
      // one that continues motion starts where its call pins it.
      const created: {
        target: Element;
        startTime: number | null;
        commit: (at: number) => void;
      }[] = [];
      HTMLElement.prototype.animate = function (this: HTMLElement) {
        let resolveReady: () => void = () => {};
        const ready = new Promise<void>(resolve => {
          resolveReady = resolve;
        });
        const record = {
          target: this as Element,
          startTime: null as number | null,
          commit(at: number) {
            if (record.startTime == null) {
              record.startTime = at;
            }
            resolveReady();
          },
        };
        created.push(record);
        return {
          get startTime() {
            return record.startTime;
          },
          set startTime(value: number | null) {
            record.startTime = value;
            resolveReady();
          },
          get playState() {
            return 'running';
          },
          ready,
          cancel() {},
        } as unknown as Animation;
      };
      try {
        const {row} = renderRow();
        const f = finger(row);
        f.down(10);
        f.move(20);
        f.move(35);
        f.move(65);
        // A frame starts the drag's first springs.
        const at = performance.now();
        for (const animation of created) {
          animation.commit(at);
        }
        await act(async () => {});
        f.move(80);
        // Touch events are tasks of their own.
        await act(async () => {});
        // The finger lifts while the row still moves, and each call takes
        // time on a real page: the clock moves between calls.
        let clock = performance.now();
        const now = vi
          .spyOn(performance, 'now')
          .mockImplementation(() => (clock += 0.4));
        const from = created.length;
        try {
          f.up();
        } finally {
          now.mockRestore();
        }
        const parts = [
          row,
          panelOf(row, 'leading'),
          trackOf(row, 'leading'),
          ...entriesOf(row, 'leading'),
        ];
        const starts = parts.map(part => {
          const mine = created.slice(from).filter(a => a.target === part);
          return mine[mine.length - 1]?.startTime;
        });
        expect(typeof starts[0]).toBe('number');
        expect(new Set(starts).size).toBe(1);
      } finally {
        Reflect.deleteProperty(HTMLElement.prototype, 'animate');
      }
    });

    describe('the full swipe', () => {
      const twoEntries = () =>
        renderRow({
          leading: [
            {label: 'Unread', onActivate: vi.fn()},
            {label: 'Pin', onActivate: vi.fn()},
          ],
        });
      /** A side's two entries: the other one, and the outermost. */
      const groupsOf = (row: HTMLElement) => {
        const [inner, outer] = entriesOf(row, 'leading');
        return {inner, outer};
      };

      it('lets the entries ride the row past the open width, the outermost stretching to the edge', () => {
        const {row} = twoEntries();
        const f = finger(row);
        f.down(10);
        f.move(20);
        f.move(35);
        f.move(35 + 100);
        // Short of the open width: every entry pinned at the outer edge.
        expect(entriesOf(row, 'leading').map(xOf)).toEqual([44, 44]);
        f.move(35 + 200);
        // Past it: beside the row, the outermost entry's colour filling out
        // to the edge.
        expect(entriesOf(row, 'leading').map(xOf)).toEqual([0, 0]);
        f.up();
      });

      it("confirms on the finger's travel: the row runs ahead to the confirmation offset, the outermost entry covers the space, and the others fade", () => {
        const {row} = twoEntries();
        const {inner, outer} = groupsOf(row);
        const f = finger(row);
        f.down(10);
        f.move(20);
        f.move(35);
        f.move(35 + 220);
        // Not yet: the row follows the finger.
        expect(xOf(row)).toBe(220);
        expect(xOf(outer)).toBe(0);
        f.move(35 + 240);
        // Confirmed: ahead to 271 px (the 300 px row less 29), the outermost
        // slid past the other to the row's edge, the other faded.
        expect(xOf(row)).toBe(271);
        expect(xOf(outer)).toBe(72);
        expect(inner.style.getPropertyValue('opacity')).toBe('0');
        // Backed out: the look undone (at identity the animator leaves the
        // element's style), the row on the finger again.
        f.move(35 + 200);
        expect(xOf(row)).toBe(200);
        expect(xOf(outer)).toBe(0);
        expect(Number(inner.style.getPropertyValue('opacity') || '1')).toBe(1);
        f.up();
      });

      it('closes a swipe that confirmed and backed out, even at rest past half the panel, and fires nothing', async () => {
        const onActivate = vi.fn();
        const {row} = renderRow({leading: [{label: 'Unread', onActivate}]});
        const f = finger(row);
        f.down(10);
        f.move(20);
        f.move(35);
        f.move(35 + 230);
        f.move(35 + 150);
        f.rest();
        f.up();
        await settled();
        expect(xOf(row)).toBe(0);
        expect(onActivate).not.toHaveBeenCalled();
      });

      it('fires from a confirmed release whatever its velocity, even moving back', async () => {
        const onActivate = vi.fn();
        const {row} = renderRow({leading: [{label: 'Unread', onActivate}]});
        const f = finger(row);
        f.down(10);
        f.move(20);
        f.move(35);
        f.move(35 + 150);
        f.move(35 + 260);
        // Coming back fast, still past the confirm point when it lifts.
        f.move(35 + 240);
        f.move(35 + 222);
        f.up({afterMs: 0});
        await settled();
        expect(onActivate).toHaveBeenCalledTimes(1);
      });

      it('never confirms toward a disabled outermost entry', async () => {
        const onActivate = vi.fn();
        const {row} = renderRow({
          leading: [{label: 'Unread', onActivate, isDisabled: true}],
        });
        const f = finger(row);
        f.down(10);
        f.move(20);
        f.move(35);
        f.move(35 + 260);
        // No run ahead: the row stays on the finger.
        expect(xOf(row)).toBe(260);
        f.rest();
        f.up();
        await settled();
        expect(onActivate).not.toHaveBeenCalled();
        // A slow release past half the panel rests open.
        expect(xOf(row)).toBe(72);
      });

      it("fires the outermost entry once the row's content has left its box, long before the slide-out comes to rest", async () => {
        const outer = vi.fn();
        const {row} = renderRow({
          leading: [
            {label: 'Unread', onActivate: vi.fn()},
            {label: 'Pin', onActivate: outer},
          ],
        });
        // Confirmed (the confirm point is 231.6 px for the 144 px panel on
        // the 300 px row), the row runs ahead to 271 px, inside its box:
        // nothing has fired yet.
        dragLeading(row, 250);
        expect(outer).not.toHaveBeenCalled();
        // UIKit calls the handler at the lift; the row fires once its
        // content has left its box (300 px), a fraction of a second into a
        // slide-out whose tail toward 324 px lasts most of a second.
        await act(async () => {
          vi.advanceTimersByTime(450);
        });
        expect(outer).toHaveBeenCalledTimes(1);
      });

      it("fires at once when the release is already past the row's edge", () => {
        const outer = vi.fn();
        const {row} = renderRow({
          leading: [
            {label: 'Unread', onActivate: vi.fn()},
            {label: 'Pin', onActivate: outer},
          ],
        });
        const f = finger(row);
        f.down(10);
        f.move(20);
        f.move(35);
        f.move(35 + 160);
        f.move(35 + 330);
        f.rest(1200);
        expect(xOf(row)).toBeGreaterThan(300);
        f.up();
        expect(outer).toHaveBeenCalledTimes(1);
      });

      it("fires a slide-out the browser starts late once the row's content has left its box, timed from that start", async () => {
        // Like a browser on a busy page: an animation starts only when a frame
        // commits it, and until then the row is where it was on screen.
        const pending: {commit: (at: number) => void}[] = [];
        HTMLElement.prototype.animate = function () {
          let start: number | null = null;
          let cancelled = false;
          let resolveReady: () => void = () => {};
          let rejectReady: (error: Error) => void = () => {};
          const ready = new Promise<void>((resolve, reject) => {
            resolveReady = resolve;
            rejectReady = reject;
          });
          const animation = {
            get startTime() {
              return start;
            },
            set startTime(value: number | null) {
              start = value;
              resolveReady();
            },
            get playState() {
              return cancelled ? 'idle' : 'running';
            },
            ready,
            commit(at: number) {
              if (!cancelled && start == null) {
                start = at;
              }
              resolveReady();
            },
            cancel() {
              cancelled = true;
              rejectReady(new Error('AbortError'));
            },
          };
          pending.push(animation);
          return animation as unknown as Animation;
        };
        try {
          const outer = vi.fn();
          const {row} = renderRow({
            leading: [
              {label: 'Unread', onActivate: vi.fn()},
              {label: 'Pin', onActivate: outer},
            ],
          });
          // A confirmed full swipe released held still: the slide-out starts
          // from rest, and no frame has started it yet.
          dragLeading(row, 240);
          await act(async () => {
            vi.advanceTimersByTime(600);
          });
          expect(outer).not.toHaveBeenCalled();
          // The browser starts it now; it fires once the row's content has
          // left its box.
          const at = performance.now();
          for (const animation of pending) {
            animation.commit(at);
          }
          await act(async () => {
            vi.advanceTimersByTime(450);
          });
          expect(outer).toHaveBeenCalledTimes(1);
        } finally {
          Reflect.deleteProperty(HTMLElement.prototype, 'animate');
        }
      });

      it("drops a slide-out's pending fire when the row leaves, after a second slide-out replaced the first", async () => {
        const outer = vi.fn();
        const {row, unmount} = renderRow({
          leading: [
            {label: 'Unread', onActivate: vi.fn()},
            {label: 'Pin', onActivate: outer},
          ],
        });
        // When each slide-out's fire is due.
        const due: number[] = [];
        const schedule = window.setTimeout;
        vi.spyOn(window, 'setTimeout').mockImplementation(((
          callback: TimerHandler,
          delay?: number,
          ...rest: unknown[]
        ) => {
          if (
            typeof callback === 'function' &&
            callback.name === 'fireIfStill'
          ) {
            due.push(performance.now() + (delay ?? 0));
          }
          return schedule(callback, delay, ...rest);
        }) as typeof window.setTimeout);
        // Confirmed past about 232 px: out it goes, its fire pending.
        dragLeading(row, 240);
        await act(async () => {});
        // A finger catches the sliding row, backs it out of the full swipe,
        // and confirms it again before the first fire is due.
        const f = finger(row, 2);
        f.down(150);
        f.move(140);
        f.move(110);
        f.move(80);
        f.move(20);
        expect(xOf(row)).toBeLessThan(232);
        f.move(140);
        expect(xOf(row)).toBe(271);
        f.up();
        // Each fire is timed from its slide-out's start, read when it resolves.
        await act(async () => {});
        expect(due).toHaveLength(2);
        expect(due[0]).toBeLessThan(due[1]);
        // The first comes due (the catch cancelled it); then the row leaves
        // while the second is pending.
        await act(async () => {
          vi.advanceTimersByTime(due[0] - performance.now() + 1);
        });
        unmount();
        await act(async () => {
          vi.advanceTimersByTime(3000);
        });
        expect(outer).not.toHaveBeenCalled();
      });

      it("a disabled outermost entry's fill beside it takes the disabled entry's look", () => {
        const {row} = renderRow({
          trailing: [
            {label: 'Archive', onActivate: vi.fn()},
            {
              label: 'Delete',
              onActivate: vi.fn(),
              variant: 'destructive',
              isDisabled: true,
            },
          ],
        });
        // The disabled entry is its colour at half strength, and so is the
        // fill painted beside it (its own pseudo-element, under the entry's
        // filter): never the full colour of a verb that cannot fire. Its
        // opacity stays free for the full swipe's fade, and a disabled
        // outermost entry never confirms, so the track's fill never shows.
        const [, outer] = entriesOf(row, 'trailing');
        const rules = rulesDeclaredFor(outer);
        expect(rules.some(r => /filter: opacity\(0?\.5\)/.test(r))).toBe(true);
        expect(
          rules.some(
            r =>
              r.includes('::after') && r.includes('background-color: inherit'),
          ),
        ).toBe(true);
      });
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
      const leading = trackOf(row, 'leading');
      const trailing = trackOf(row, 'trailing');
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
      // The outermost entry is the last one, at the outer end; its colour is
      // painted beside it out to the outer edge (a pseudo-element, no
      // element), so a slide-out fills the row with it. The track keeps the
      // same colour as its confirm fill, hidden until a full swipe confirms.
      const [archiveEntry, deleteEntry] = entriesOf(row, 'trailing');
      expect(deleteEntry).toHaveTextContent('Delete');
      const outerFill = (entry: HTMLElement) =>
        rulesDeclaredFor(entry).some(
          r => r.includes('::after') && r.includes('background-color: inherit'),
        );
      expect(outerFill(deleteEntry)).toBe(true);
      expect(outerFill(archiveEntry)).toBe(false);
      expect(
        rulesDeclaredFor(trailing).some(
          r =>
            r.includes('::before') &&
            r.includes('background-color: var(--color-error'),
        ),
      ).toBe(true);
    });
  });

  describe('commit', () => {
    it('slides out and fires on a confirmed full swipe; nothing rests', async () => {
      const onActivate = vi.fn();
      const {row} = renderRow({
        behavior: 'commit',
        leading: [{label: 'Unread', onActivate}],
      });
      const panel = panelOf(row, 'leading') as HTMLElement;
      // Presentational at all times: nothing in it is ever tappable.
      expect(panel).toHaveAttribute('aria-hidden', 'true');
      expect(panel.querySelector('button')).toBeNull();
      // One entry: a 72 px panel; the full swipe confirms at about 209 px.
      dragLeading(row, 220);
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

    it('never fires on a flick short of the commit point', async () => {
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
      expect(onActivate).not.toHaveBeenCalled();
      expect(xOf(row)).toBe(0);
    });

    it('holds out after a committed entry with hasRemoval', async () => {
      const onActivate = vi.fn();
      const {row} = renderRow({
        behavior: 'commit',
        leading: [{label: 'Archive', onActivate, hasRemoval: true}],
      });
      dragLeading(row, 220);
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

  it('gives the root back its own translation when the swipe actions go', () => {
    const {row} = renderRow();
    const f = finger(row);
    f.down(10);
    f.move(20);
    f.move(35);
    f.move(65);
    expect(xOf(row)).toBe(30);
    f.up();
    cleanup();
    render(<Item label="Conversation" data-testid="row" />);
    expect(screen.getByTestId('row').style.getPropertyValue('translate')).toBe(
      '',
    );
  });

  it('reads the direction logically under RTL: leading is toward the inline end', async () => {
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
      // Physical travel is negative, and the panel parts mirror it.
      expect(xOf(row)).toBe(-40);
      expect(xOf(panelOf(row, 'leading'))).toBe(40);
      expect(xOf(entriesOf(row, 'leading')[0])).toBe(-72 + 40);
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
