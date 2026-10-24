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
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
  expect,
  vi,
} from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {rulesDeclaredFor} from '../__tests__/pressState';
import userEvent from '@testing-library/user-event';
import {Item} from './Item';
import {ItemDescriptionContext} from './ItemDescriptionContext';
import {emulateIosIdiom} from './__tests__/emulateIosIdiom';

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
  // The panels and the gesture are loaded lazily (React.lazy + Suspense), so
  // the first row with swipe actions renders them a tick after it mounts.
  // Mount one once up front: the resolved module is cached on the lazy
  // component, and every row below renders its panels synchronously. The
  // module is imported first: a cold import compiles the gesture and motion
  // modules it brings, which can outlast waitFor's one second on a busy
  // machine, while the import itself is awaited for as long as it takes.
  beforeAll(async () => {
    await import('./ItemSwipeLayer');
    render(
      <Item
        label="Warm"
        data-testid="warm"
        swipeActions={{leading: [{label: 'Unread', onActivate: () => {}}]}}
      />,
    );
    await waitFor(() => {
      expect(
        screen.getByTestId('warm').querySelector('[data-swipe-panel]'),
      ).not.toBeNull();
    });
    cleanup();
  });

  // The gesture system outlives a test (one per document) and keeps the time
  // of the touches it has seen; a document clock never runs backwards, so
  // each test's fake clock starts after the last one's.
  let epoch = 0;
  beforeEach(() => {
    // The swipe is iOS's under a finger on iOS (useTouchIdiom); the suite
    // runs there, and `outside iOS` below runs today's row.
    emulateIosIdiom();
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
  const entriesOf = (row: HTMLElement, side: 'leading' | 'trailing') =>
    trackOf(row, side)?.firstElementChild as HTMLElement;

  /**
   * jsdom lays nothing out: give the row a width and each side's entries a
   * natural width of 72 px per entry, as the real panel measures them. The
   * entries are two groups: the others, then the outermost on its own.
   */
  function layOut(row: HTMLElement) {
    Object.defineProperty(row, 'clientWidth', {configurable: true, value: 300});
    for (const side of ['leading', 'trailing'] as const) {
      const entries = panelOf(row, side) == null ? null : entriesOf(row, side);
      if (entries != null) {
        const [inner, outer] = Array.from(entries.children);
        Object.defineProperty(entries, 'offsetWidth', {
          configurable: true,
          value: 72 * (inner.childElementCount + outer.childElementCount),
        });
        Object.defineProperty(outer, 'offsetWidth', {
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
    // the entries stay pinned at the outer edge (144 px of entries).
    expect(xOf(panelOf(row, 'leading'))).toBe(-60);
    expect(xOf(trackOf(row, 'leading'))).toBe(60);
    expect(xOf(entriesOf(row, 'leading'))).toBe(144 - 60);
    // No layout property is ever written.
    for (const element of [
      row,
      panelOf(row, 'leading'),
      trackOf(row, 'leading'),
      entriesOf(row, 'leading'),
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

  describe("outside iOS (Android, any finger outside iOS): today's row", () => {
    // The rest of the suite emulates iOS; here the page answers as Chrome on
    // an Android phone does: a finger, no -webkit-touch-callout.
    beforeEach(() => {
      vi.unstubAllGlobals();
    });

    it("claims at 8 px and moves the row from the touch-down: no dead zone before UIKit's 25 px", () => {
      const {row} = renderRow();
      const f = finger(row);
      f.down(10);
      expect(f.move(15).defaultPrevented).toBe(false);
      // Claimed: the row is at the finger's travel since it landed.
      expect(f.move(20, 12).defaultPrevented).toBe(true);
      expect(xOf(row)).toBe(10);
      f.move(34, 13);
      expect(xOf(row)).toBe(24);
      // Back past the touch-down point: home, never the other side.
      f.move(4);
      expect(xOf(row)).toBe(0);
      expect(f.up().defaultPrevented).toBe(true);
    });

    it("follows the finger one for one, and a release past half the panel settles open on CSS's ease-out over 200 ms", async () => {
      const {row} = renderRow();
      const f = finger(row);
      f.down(10);
      f.move(20);
      // No tracking spring: the row is where the finger says, at once.
      f.move(60);
      expect(xOf(row)).toBe(50);
      // Held still, so the release is slow: where it is decides.
      f.rest();
      f.up();
      // Past half the 72 px panel: open. jsdom has no compositor, so the
      // end state is written at once; the curve's clock is the landing,
      // 200 ms out (UIKit's spring lands after 0.92 s).
      expect(xOf(row)).toBe(72);
      await act(async () => {
        vi.advanceTimersByTime(150);
      });
      expect(panelOf(row, 'leading')).toHaveAttribute('inert');
      await act(async () => {
        vi.advanceTimersByTime(80);
      });
      expect(panelOf(row, 'leading')).not.toHaveAttribute('inert');
    });

    it('fires the outermost entry on a fling, as the row always has', async () => {
      const onActivate = vi.fn();
      const {row} = renderRow({leading: [{label: 'Unread', onActivate}]});
      const f = finger(row);
      f.down(10);
      f.move(20);
      f.move(40);
      f.move(80);
      f.up({afterMs: 0});
      await settled();
      expect(onActivate).toHaveBeenCalledTimes(1);
    });

    it('leaves an open row open on a tap on its content, which clicks the row, and on a scroll; a touch elsewhere still closes it', async () => {
      const {row, onClick} = renderRow();
      dragLeading(row, 45);
      await settled();
      expect(xOf(row)).toBe(72);
      // Still a pressable surface while open, as it always was.
      expect(row).toHaveAttribute('data-astryx-pressable');
      const content = screen.getByRole('button', {name: 'Conversation'});
      const f = finger(content, 2);
      f.down(150);
      // Nothing takes the touch: the browser clicks the row (jsdom makes no
      // click from touch events, so the test clicks as the browser would).
      expect(f.up().defaultPrevented).toBe(false);
      fireEvent.click(content);
      expect(onClick).toHaveBeenCalledTimes(1);
      await settled();
      expect(xOf(row)).toBe(72);
      fireEvent.scroll(row.parentElement as HTMLElement);
      await settled();
      expect(xOf(row)).toBe(72);
      fireEvent.pointerDown(document.body);
      await settled();
      expect(xOf(row)).toBe(0);
    });

    it("arms past its own commit point with resistance and fires on release, with no full swipe's run-ahead", async () => {
      const onActivate = vi.fn();
      const {row} = renderRow({leading: [{label: 'Unread', onActivate}]});
      const f = finger(row);
      f.down(10);
      f.move(20);
      f.move(100);
      // The commit point: 48 px past the 72 px panel, or half the 300 px
      // row, whichever is further: 150 px.
      f.move(160);
      expect(xOf(row)).toBe(150);
      // Past it the row resists (0.35 per px) instead of running ahead to
      // UIKit's confirmation offset.
      f.move(260);
      expect(xOf(row)).toBeCloseTo(185);
      f.rest();
      f.up();
      await settled();
      expect(onActivate).toHaveBeenCalledTimes(1);
    });

    it('settles at once under Reduce Motion, as the row always has', async () => {
      const matchMedia = window.matchMedia.bind(window);
      vi.stubGlobal('matchMedia', (query: string) => {
        const list = matchMedia(query);
        return query === '(prefers-reduced-motion: reduce)'
          ? {...list, matches: true}
          : list;
      });
      const {row} = renderRow();
      const f = finger(row);
      f.down(10);
      f.move(20);
      f.move(60);
      f.rest();
      f.up();
      // Landed in the frame it was released in: no 200 ms clock.
      await act(async () => {
        vi.advanceTimersByTime(16);
      });
      expect(xOf(row)).toBe(72);
      expect(panelOf(row, 'leading')).not.toHaveAttribute('inert');
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

    it('keeps a swipe the row already owns when a second finger lands', async () => {
      const {row} = renderRow();
      const first = finger(row, 1);
      const second = finger(row, 2);
      first.down(10);
      first.move(20);
      first.move(35);
      first.move(55);
      expect(xOf(row)).toBe(20);
      second.down(200);
      expect(first.move(75).defaultPrevented).toBe(true);
      expect(xOf(row)).toBe(40);
      first.rest();
      first.up();
      second.up();
      await settled();
      // Past half the 72 px panel: resting open.
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

    describe('the full swipe', () => {
      const twoEntries = () =>
        renderRow({
          leading: [
            {label: 'Unread', onActivate: vi.fn()},
            {label: 'Pin', onActivate: vi.fn()},
          ],
        });
      /** The two groups of a side's entries: the others, and the outermost. */
      const groupsOf = (row: HTMLElement) => {
        const [inner, outer] = Array.from(entriesOf(row, 'leading').children);
        return {inner: inner as HTMLElement, outer: outer as HTMLElement};
      };

      it('lets the entries ride the row past the open width, the outermost stretching to the edge', () => {
        const {row} = twoEntries();
        const f = finger(row);
        f.down(10);
        f.move(20);
        f.move(35);
        f.move(35 + 100);
        // Short of the open width: pinned at the outer edge.
        expect(xOf(entriesOf(row, 'leading'))).toBe(144 - 100);
        f.move(35 + 200);
        // Past it: beside the row, the track's colour filling out to the edge.
        expect(xOf(entriesOf(row, 'leading'))).toBe(0);
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
        // Backed out: the look undone, the row on the finger again.
        f.move(35 + 200);
        expect(xOf(row)).toBe(200);
        expect(xOf(outer)).toBe(0);
        expect(inner.style.getPropertyValue('opacity')).toBe('1');
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
      // The track wears its outermost entry's colour, so a slide-out fills
      // the row with it. The outermost is alone in the group at the outer end.
      const trackClasses = trackOf(row, 'trailing').className;
      const deleteClasses = (
        trailing.lastElementChild?.firstElementChild as HTMLElement
      ).className;
      expect(trackClasses.split(' ').some(c => deleteClasses.includes(c))).toBe(
        true,
      );
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
      expect(xOf(entriesOf(row, 'leading'))).toBe(-72 + 40);
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

describe('controlProps', () => {
  it('reaches the invisible button: states, relations, marks, key handling and the roving tabIndex', async () => {
    const onKeyDown = vi.fn();
    render(
      <Item
        label="Views"
        onClick={vi.fn()}
        controlProps={{
          'aria-expanded': true,
          'aria-haspopup': 'menu',
          'aria-controls': 'views-menu',
          'data-nav-id': 'row-1',
          onKeyDown,
          tabIndex: -1,
        }}
      />,
    );
    const control = screen.getByRole('button', {name: 'Views'});
    expect(control).toHaveAttribute('aria-expanded', 'true');
    expect(control).toHaveAttribute('aria-haspopup', 'menu');
    expect(control).toHaveAttribute('aria-controls', 'views-menu');
    expect(control).toHaveAttribute('data-nav-id', 'row-1');
    expect(control).toHaveAttribute('tabindex', '-1');
    // The root carries none of them.
    const root = control.parentElement as HTMLElement;
    expect(root).not.toHaveAttribute('aria-expanded');
    expect(root).not.toHaveAttribute('data-nav-id');
    fireEvent.keyDown(control, {key: 'ArrowDown'});
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    // The control is still the row's button: type and click are the row's.
    expect(control).toHaveAttribute('type', 'button');
  });

  it('reaches the invisible anchor, and the row keeps the address, the target and the rel', () => {
    render(
      <Item
        label="Message"
        href="/m/1"
        target="_blank"
        controlProps={{
          'aria-describedby': 'hint',
          'data-nav-id': 'row-2',
          tabIndex: 0,
        }}
      />,
    );
    const link = screen.getByRole('link', {name: 'Message'});
    expect(link).toHaveAttribute('href', '/m/1');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('aria-describedby', 'hint');
    expect(link).toHaveAttribute('data-nav-id', 'row-2');
    expect(link).toHaveAttribute('tabindex', '0');
  });

  it('gives a name of its own to the control, not the root', () => {
    render(
      <Item
        label={<span aria-hidden="true">★</span>}
        onClick={vi.fn()}
        controlProps={{'aria-label': 'Star this message'}}
      />,
    );
    expect(
      screen.getByRole('button', {name: 'Star this message'}),
    ).toBeInTheDocument();
  });

  it('a disabled row keeps its own tabIndex and aria-disabled over the caller\x27s', () => {
    render(
      <Item
        label="Message"
        href="/m/1"
        isDisabled
        controlProps={{tabIndex: 0, 'aria-disabled': false}}
      />,
    );
    // A disabled anchor is out of the tab order and says so.
    const link = screen.getByText('Message').closest('a') as HTMLElement;
    expect(link).toHaveAttribute('tabindex', '-1');
    expect(link).toHaveAttribute('aria-disabled', 'true');
  });

  const LinkRoot = ({href, children, ...rest}: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );

  it('lands on the root when the root is the link, without a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(
        <Item
          as={LinkRoot}
          role="menuitem"
          label="Docs"
          href="/docs"
          controlProps={{'data-nav-id': 'row-3', 'aria-keyshortcuts': 'd'}}
        />,
      );
      const root = screen.getByRole('menuitem', {name: 'Docs'});
      expect(root.tagName).toBe('A');
      expect(root).toHaveAttribute('data-nav-id', 'row-3');
      expect(root).toHaveAttribute('aria-keyshortcuts', 'd');
      // The root is the control, so nothing is ignored and nothing warns.
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it('a link root keeps the anchor path\x27s precedence: the caller\x27s aria-current, aria-disabled and tabIndex on an enabled row', () => {
    render(
      <Item
        as={LinkRoot}
        role="menuitem"
        label="Docs"
        href="/docs"
        controlProps={{
          'aria-current': 'page',
          'aria-disabled': false,
          tabIndex: 0,
        }}
      />,
    );
    const root = screen.getByRole('menuitem', {name: 'Docs'});
    expect(root).toHaveAttribute('aria-current', 'page');
    expect(root).toHaveAttribute('aria-disabled', 'false');
    expect(root).toHaveAttribute('tabindex', '0');
  });

  it('a disabled link root says so and leaves the tab order over the caller\x27s tabIndex', () => {
    render(
      <Item
        as={LinkRoot}
        role="menuitem"
        label="Docs"
        href="/docs"
        isDisabled
        controlProps={{tabIndex: 0, 'aria-disabled': false}}
      />,
    );
    const root = screen.getByRole('menuitem', {name: 'Docs'});
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root).toHaveAttribute('tabindex', '-1');
    expect(root).not.toHaveAttribute('href');
  });

  it('on a link root, controlProps are written after the root\x27s props on a shared attribute', () => {
    render(
      <Item
        as={LinkRoot}
        role="menuitem"
        label="Docs"
        href="/docs"
        aria-current="true"
        tabIndex={-1}
        data-nav-id="root"
        controlProps={{
          'aria-current': 'page',
          tabIndex: 0,
          'data-nav-id': 'control',
        }}
      />,
    );
    const root = screen.getByRole('menuitem', {name: 'Docs'});
    expect(root).toHaveAttribute('aria-current', 'page');
    expect(root).toHaveAttribute('tabindex', '0');
    expect(root).toHaveAttribute('data-nav-id', 'control');
  });

  it('a link root that passes no controlProps renders what it always did, enabled and disabled', () => {
    const {rerender} = render(
      <Item
        as={LinkRoot}
        role="menuitem"
        label="Docs"
        href="/docs"
        aria-disabled="false"
        tabIndex={-1}
      />,
    );
    const root = screen.getByRole('menuitem', {name: 'Docs'});
    // As before the bag existed: the row writes aria-disabled only when
    // disabled (a root prop of "false" is dropped), and the root's tabIndex
    // is the caller's.
    expect(root).not.toHaveAttribute('aria-disabled');
    expect(root).toHaveAttribute('tabindex', '-1');
    rerender(<Item as={LinkRoot} role="menuitem" label="Docs" href="/docs" />);
    expect(root).not.toHaveAttribute('aria-disabled');
    expect(root).not.toHaveAttribute('tabindex');
    rerender(
      <Item
        as={LinkRoot}
        role="menuitem"
        label="Docs"
        href="/docs"
        isDisabled
      />,
    );
    // A disabled link root: aria-disabled from the row, no tabindex written.
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root).not.toHaveAttribute('tabindex');
    expect(root).not.toHaveAttribute('href');
  });

  it('a disabled onClick row given no controlProps renders the button it always did', () => {
    render(<Item label="Views" onClick={vi.fn()} isDisabled />);
    const button = screen.getByText('Views').closest('button') as HTMLElement;
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('aria-disabled');
    expect(button).not.toHaveAttribute('tabindex');
  });

  it('a link root with onClick and no role puts the bag on the root only, never on the inner button', () => {
    const onKeyDown = vi.fn();
    render(
      <Item
        as={LinkRoot}
        label="Docs"
        href="/docs"
        onClick={vi.fn()}
        controlProps={{id: 'docs-row', 'data-nav-id': 'row-4', onKeyDown}}
      />,
    );
    const root = screen.getByRole('link', {name: /Docs/});
    const button = screen.getByRole('button', {name: 'Docs'});
    expect(root).toHaveAttribute('id', 'docs-row');
    expect(root).toHaveAttribute('data-nav-id', 'row-4');
    expect(button).not.toHaveAttribute('id');
    expect(button).not.toHaveAttribute('data-nav-id');
    expect(document.querySelectorAll('#docs-row')).toHaveLength(1);
    // One keydown on the button bubbles to the root once: one call.
    fireEvent.keyDown(button, {key: 'ArrowDown'});
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it('a disabled onClick row keeps tabIndex -1 and aria-disabled on its button over the caller\x27s', () => {
    render(
      <Item
        label="Views"
        onClick={vi.fn()}
        isDisabled
        controlProps={{tabIndex: 0, 'aria-disabled': false}}
      />,
    );
    const button = screen.getByText('Views').closest('button') as HTMLElement;
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('tabindex', '-1');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('a link root with an interactiveRef renders no control: the bag is ignored and the warning fires', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      function Delegating() {
        const inputRef = useRef<HTMLInputElement>(null);
        return (
          <Item
            as={LinkRoot}
            role="menuitem"
            label="Pick"
            href="/pick"
            interactiveRef={inputRef}
            startContent={
              <input ref={inputRef} type="checkbox" aria-label="Pick" />
            }
            controlProps={{
              'data-nav-id': 'x',
              tabIndex: 0,
              'aria-current': 'page',
            }}
          />
        );
      }
      render(<Delegating />);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('controlProps'),
      );
      const root = screen.getByRole('menuitem', {name: /Pick/});
      expect(root).not.toHaveAttribute('data-nav-id');
      expect(root).not.toHaveAttribute('tabindex');
      expect(root).not.toHaveAttribute('aria-current');
    } finally {
      warn.mockRestore();
    }
  });

  it('warns in development, and lands nowhere, when the row renders no control', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const {unmount} = render(
        <Item
          role="menuitem"
          label="Views"
          onClick={vi.fn()}
          controlProps={{'aria-expanded': true}}
        />,
      );
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('controlProps'),
      );
      expect(screen.getByRole('menuitem')).not.toHaveAttribute('aria-expanded');
      unmount();
      warn.mockClear();
      function Delegating() {
        const inputRef = useRef<HTMLInputElement>(null);
        return (
          <Item
            label="Pick"
            interactiveRef={inputRef}
            startContent={
              <input ref={inputRef} type="checkbox" aria-label="Pick" />
            }
            controlProps={{'data-nav-id': 'x'}}
          />
        );
      }
      render(<Delegating />);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('controlProps'),
      );
      expect(document.querySelector('[data-nav-id]')).toBeNull();
    } finally {
      warn.mockRestore();
    }
  });

  it('does not warn when the control is rendered', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(
        <Item
          label="Views"
          onClick={vi.fn()}
          controlProps={{'aria-expanded': false}}
        />,
      );
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});

describe('role="row" (a grid row)', () => {
  function renderGridRow(
    props: Partial<React.ComponentProps<typeof Item>> = {},
  ) {
    render(
      <div role="grid" aria-label="Inbox">
        <Item
          role="row"
          data-testid="row"
          marker={<span data-testid="marker">•</span>}
          startContent={<input type="checkbox" aria-label="Select message" />}
          label="Message one"
          description="A snippet"
          endContent={<button type="button">More</button>}
          {...props}
        />
      </div>,
    );
    return screen.getByTestId('row');
  }

  it('renders every part as a gridcell, the label cell holding the link the controlProps reach', () => {
    const row = renderGridRow({
      href: '/m/1',
      controlProps: {tabIndex: 0, 'data-nav-id': 'm-1'},
    });
    expect(row).toHaveAttribute('role', 'row');
    const cells = Array.from(row.children);
    expect(cells.length).toBe(4);
    for (const cell of cells) {
      expect(cell).toHaveAttribute('role', 'gridcell');
    }
    expect(screen.getByTestId('marker').closest('[role="gridcell"]')).toBe(
      cells[0],
    );
    expect(
      screen
        .getByRole('checkbox', {name: 'Select message'})
        .closest('[role="gridcell"]'),
    ).toBe(cells[1]);
    const link = screen.getByRole('link', {name: /Message one/});
    expect(link.closest('[role="gridcell"]')).toBe(cells[2]);
    // The anchor is a plain link inside its cell: no role of its own, and
    // the grid's roving focus marks ride it.
    expect(link).not.toHaveAttribute('role');
    expect(link).toHaveAttribute('tabindex', '0');
    expect(link).toHaveAttribute('data-nav-id', 'm-1');
    expect(
      screen.getByRole('button', {name: 'More'}).closest('[role="gridcell"]'),
    ).toBe(cells[3]);
  });

  it('holds a button in the label cell for onClick, and fires it', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const row = renderGridRow({onClick});
    const button = screen.getByRole('button', {name: /Message one/});
    expect(button.closest('[role="gridcell"]')?.parentElement).toBe(row);
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('a static row keeps the label in a cell with no control', () => {
    const row = renderGridRow();
    const cells = Array.from(row.children);
    expect(cells.every(cell => cell.getAttribute('role') === 'gridcell')).toBe(
      true,
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Message one').closest('[role="gridcell"]')).toBe(
      cells[2],
    );
  });

  it('selection is the row\x27s aria-selected, never aria-current', () => {
    const row = renderGridRow({href: '/m/1', isSelected: true});
    expect(row).toHaveAttribute('aria-selected', 'true');
    expect(row).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link')).not.toHaveAttribute('aria-selected');
  });

  it('a row with no parts beyond the label is one gridcell', () => {
    render(
      <div role="grid" aria-label="List">
        <Item role="row" data-testid="row" label="Only" />
      </div>,
    );
    const row = screen.getByTestId('row');
    expect(row.children.length).toBe(1);
    expect(row.firstElementChild).toHaveAttribute('role', 'gridcell');
  });

  it('does not warn about controlProps: the row renders its control', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      renderGridRow({href: '/m/1', controlProps: {tabIndex: -1}});
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it('leaves every other role as before: no cells, no control', () => {
    render(
      <ul role="menu">
        <Item
          role="menuitem"
          data-testid="row"
          label="Views"
          onClick={vi.fn()}
          startContent={<span>i</span>}
        />
      </ul>,
    );
    const row = screen.getByTestId('row');
    expect(
      Array.from(row.children).some(c => c.getAttribute('role') === 'gridcell'),
    ).toBe(false);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('swipe actions in a grid row', () => {
  beforeEach(() => {
    emulateIosIdiom();
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
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** One finger's touch event, stamped with the document clock. */
  function touch(
    type: 'touchstart' | 'touchmove' | 'touchend',
    target: Element,
    x: number,
  ) {
    void act(() => vi.advanceTimersByTime(16));
    const event = new Event(type, {bubbles: true, cancelable: true});
    const contact = {identifier: 1, clientX: x, clientY: 10, target};
    Object.defineProperty(event, 'changedTouches', {value: [contact]});
    Object.defineProperty(event, 'touches', {
      value: type === 'touchend' ? [] : [contact],
    });
    Object.defineProperty(event, 'timeStamp', {value: performance.now()});
    act(() => {
      target.dispatchEvent(event);
    });
  }

  it('is served under role="row": the panel is a gridcell, inert at rest and live with its buttons when the row rests open', async () => {
    const onActivate = vi.fn();
    render(
      <div role="grid" aria-label="Inbox">
        <Item
          role="row"
          data-testid="row"
          label="Message one"
          href="/m/1"
          startContent={<input type="checkbox" aria-label="Select" />}
          swipeActions={{
            trailing: [{label: 'Archive', onActivate, hasRemoval: true}],
          }}
        />
      </div>,
    );
    const row = screen.getByTestId('row');
    Object.defineProperty(row, 'clientWidth', {configurable: true, value: 300});
    const panel = row.querySelector(
      '[data-swipe-panel="trailing"]',
    ) as HTMLElement;
    expect(panel).toHaveAttribute('role', 'gridcell');
    expect(panel).toHaveAttribute('inert');
    // Every child of the row is a cell, the panel included.
    expect(
      Array.from(row.children).every(
        c => c.getAttribute('role') === 'gridcell',
      ),
    ).toBe(true);
    const entries = panel.firstElementChild?.firstElementChild as HTMLElement;
    Object.defineProperty(entries, 'offsetWidth', {
      configurable: true,
      value: 72,
    });
    touch('touchstart', row, 200);
    touch('touchmove', row, 185);
    touch('touchmove', row, 170);
    touch('touchmove', row, 150);
    touch('touchmove', row, 130);
    void act(() => vi.advanceTimersByTime(200));
    touch('touchend', row, 130);
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(row.style.getPropertyValue('translate')).toBe('-72px 0px');
    expect(panel).not.toHaveAttribute('inert');
    const archive = screen.getByRole('button', {name: 'Archive'});
    expect(archive.closest('[role="gridcell"]')).toBe(panel);
    fireEvent.click(archive);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('is not served under a role that forbids interactive descendants', () => {
    render(
      <ul role="listbox" aria-label="Options">
        <Item
          role="option"
          data-testid="row"
          label="Option"
          swipeActions={{trailing: [{label: 'Archive', onActivate: vi.fn()}]}}
        />
      </ul>,
    );
    expect(
      screen.getByTestId('row').querySelector('[data-swipe-panel]'),
    ).toBeNull();
  });
});
