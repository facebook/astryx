// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useMenuHover.test.tsx
 * @input Uses vitest, @testing-library/react, TopNavMenu (a real consumer)
 * @output Unit tests for the shared hover-menu interaction contract
 * @position Testing; validates useMenuHover behavior for every menu that
 *           opens on hover — issue #3121
 *
 * The hook is exercised through TopNavMenu rather than a synthetic harness:
 * the contract that matters is what a consumer wires up (popover + trigger +
 * panel), and a harness would let the hook drift from real usage. The
 * per-component suites cover the same ground for the other consumers.
 *
 * Accessibility is the point of most of these: who holds focus after each way
 * of opening and closing, whether keyboard activation can reach an open menu,
 * and whether a pointer-less device can open one at all.
 *
 * SYNC: When useMenuHover changes, update tests to match new behavior
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {TopNavMenu} from '../TopNav/TopNavMenu';

const items = [
  {title: 'Analytics', description: 'Track user behavior', href: '/analytics'},
  {title: 'Messaging', description: 'Real-time comms', href: '/messaging'},
];

/**
 * Report a device with no hover-capable pointer (a touchscreen), overriding the
 * shared setup's desktop default.
 */
function mockPointerlessDevice() {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

function renderMenu() {
  render(<TopNavMenu label="Products" items={items} />);
  return screen.getByRole('button', {name: 'Products'});
}

function firstMenuItem() {
  return document.querySelector<HTMLElement>('[role="menuitem"]');
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// =============================================================================
// Hover → click guard — issue #3121
//
// A menu that opens on hover is already open under the cursor by the time the
// pointer arrives, so the click that naturally follows must confirm it rather
// than toggle it shut.
// =============================================================================

describe('useMenuHover — hover/click guard', () => {
  it('opens on hover after the show delay', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
    const trigger = renderMenu();

    await user.hover(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps the menu open when a hover-open is immediately clicked', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
    const trigger = renderMenu();

    await user.hover(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // The click that naturally follows the hover must NOT dismiss it.
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('pins a confirmed menu so leaving the trigger no longer closes it', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
    const trigger = renderMenu();

    await user.hover(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    await user.click(trigger);

    await user.unhover(trigger);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on a click that lands well after the hover-open', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
    const trigger = renderMenu();

    await user.hover(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    // Past the 500ms guard: this is a deliberate dismissal, not a follow-on.
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes a transient (hover-opened) menu when the pointer leaves', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
    const trigger = renderMenu();

    await user.hover(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    await user.unhover(trigger);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('re-entering the trigger of an open menu does not re-arm the guard', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
    const trigger = renderMenu();

    // Click-open pins the menu.
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Leaving and re-entering must not make it transient again, nor make the
    // next click "confirm" — otherwise the menu becomes undismissable.
    await user.unhover(trigger);
    await user.hover(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles cleanly for click-only interaction', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

// =============================================================================
// Focus — who holds it after each way of opening and closing
// =============================================================================

describe('useMenuHover — focus management', () => {
  it('leaves focus on the trigger for a hover-open', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
    const trigger = renderMenu();

    await user.hover(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // The pointer is driving; stealing focus would be hostile.
    expect(firstMenuItem()).not.toHaveFocus();
  });

  it('moves focus to the first item on a click-open, synchronously', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();

    await user.click(trigger);

    // No waitFor, no timer flush, no animation frame: the layer calls
    // showPopover() during the click and the items are already mounted, so
    // focus has landed by the time the click returns. A deferred focus would
    // fail this assertion — which is the point.
    expect(firstMenuItem()).toHaveFocus();
  });

  it('moves focus into the menu when a hover-open is confirmed by click', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
    const trigger = renderMenu();

    await user.hover(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(firstMenuItem()).not.toHaveFocus();

    // Confirming is a deliberate activation, so the confirmed menu is
    // indistinguishable from a click-opened one — including who holds focus.
    await user.click(trigger);
    expect(firstMenuItem()).toHaveFocus();
  });

  it('returns focus to the trigger when a click closes the menu', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();

    await user.click(trigger);
    expect(firstMenuItem()).toHaveFocus();

    await user.click(trigger);
    // Focus must not be left on the hidden menu, nor dropped to <body>.
    expect(trigger).toHaveFocus();
  });

  it('returns focus to the trigger on Escape', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();

    await user.click(trigger);
    expect(firstMenuItem()).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });
});

// =============================================================================
// Keyboard activation
// =============================================================================

describe('useMenuHover — keyboard activation', () => {
  it('opens on Enter and moves focus into the menu', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();
    trigger.focus();

    await user.keyboard('{Enter}');

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(firstMenuItem()).toHaveFocus();
  });

  it('opens on Space', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();
    trigger.focus();

    await user.keyboard(' ');

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('never toggles an open menu closed — it moves focus in instead', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
    const trigger = renderMenu();

    // A hover-open leaves focus on the trigger, which is the only state in
    // which a keyboard user can activate the trigger of an open menu. Closing
    // on Enter there would strand them: the menu they can see would be
    // unreachable by keyboard.
    await user.hover(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    trigger.focus();

    await user.keyboard('{Enter}');

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(firstMenuItem()).toHaveFocus();
  });

  it('arrow keys walk the menu items', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();

    await user.click(trigger);
    const menuItems =
      document.querySelectorAll<HTMLElement>('[role="menuitem"]');
    expect(menuItems[0]).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(menuItems[1]).toHaveFocus();
  });
});

// =============================================================================
// Pointer capability
// =============================================================================

describe('useMenuHover — devices without hover', () => {
  it('does not open on a synthetic mouseenter from a tap', async () => {
    mockPointerlessDevice();
    vi.useFakeTimers({shouldAdvanceTime: true});
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
    const trigger = renderMenu();

    // Touch taps emit a compatibility mouseenter. Opening on it would leave a
    // menu hanging open behind the tap that just activated the trigger.
    await user.hover(trigger);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('still opens and closes on click', async () => {
    mockPointerlessDevice();
    const user = userEvent.setup();
    const trigger = renderMenu();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

// =============================================================================
// Native light dismiss / invoker wiring
// =============================================================================

describe('useMenuHover — native invoker wiring', () => {
  it('registers the trigger as the panel it controls', () => {
    const trigger = renderMenu();

    // popoverTarget makes the trigger the panel's native invoker, which exempts
    // its own pointer interaction from the auto-popover light dismiss that
    // would otherwise close the menu before the click guard sees it. jsdom
    // implements neither, so this asserts the wiring, not the effect — the
    // behavior itself is browser-verified.
    expect(trigger).toHaveAttribute(
      'popovertarget',
      trigger.getAttribute('aria-controls'),
    );
  });
});
