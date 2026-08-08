// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file InfoTip.test.tsx
 * @input Uses vitest, @testing-library/react, @testing-library/user-event, InfoTip component
 * @output Unit tests for InfoTip trigger accessibility and tooltip behavior
 * @position Testing; validates InfoTip.tsx implementation
 *
 * SYNC: When InfoTip.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {InfoTip} from './InfoTip';

// Store original matches to restore later
const originalMatches = HTMLElement.prototype.matches;

// Track popover open state per element
const popoverOpenState = new WeakMap<HTMLElement, boolean>();

// Mock Popover API for jsdom, and :focus-visible for keyboard-focus tests
// (same harness as core Tooltip.test.tsx, plus :focus-visible)
beforeAll(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
  });

  // Intercept :popover-open and :focus-visible, delegate everything else
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    if (selector === ':focus-visible') {
      // Treat any focused element as keyboard-focused in tests
      return this === document.activeElement;
    }
    return originalMatches.call(this, selector);
  };
});

afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = originalMatches;
});

/** Focus the trigger the way a keyboard user would land on it. */
function focusTrigger(trigger: HTMLElement) {
  act(() => {
    trigger.focus();
  });
  fireEvent.focusIn(trigger);
}

describe('InfoTip', () => {
  it('renders a button trigger with the default accessible name', () => {
    render(<InfoTip content="Helpful context" />);
    expect(
      screen.getByRole('button', {name: 'More information'}),
    ).toBeInTheDocument();
  });

  it('uses a custom label as the accessible name', () => {
    render(
      <InfoTip content="30-day rolling average." label="About this metric" />,
    );
    const trigger = screen.getByRole('button', {name: 'About this metric'});
    expect(trigger).toHaveAttribute('aria-label', 'About this metric');
  });

  it('links the trigger to the tooltip layer via aria-describedby', () => {
    render(<InfoTip content="Helpful context" />);
    const layer = screen.getByRole('tooltip', {hidden: true});
    expect(layer).toHaveTextContent('Helpful context');
    const trigger = screen.getByRole('button', {name: 'More information'});
    expect(trigger.getAttribute('aria-describedby')).toBe(layer.id);
  });

  it('is reachable with Tab', async () => {
    const user = userEvent.setup();
    render(<InfoTip content="Helpful context" />);
    const trigger = screen.getByRole('button', {name: 'More information'});
    await user.tab();
    expect(trigger).toHaveFocus();
  });

  it('shows the tooltip on hover', async () => {
    vi.mocked(HTMLElement.prototype.showPopover).mockClear();
    render(<InfoTip content="Helpful context" />);
    const trigger = screen.getByRole('button', {name: 'More information'});

    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
    });
  });

  it('shows the tooltip on keyboard focus', async () => {
    vi.mocked(HTMLElement.prototype.showPopover).mockClear();
    render(<InfoTip content="Helpful context" />);
    const trigger = screen.getByRole('button', {name: 'More information'});

    focusTrigger(trigger);

    await waitFor(() => {
      expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
    });
    const layer = screen.getByRole('tooltip', {hidden: true});
    expect(popoverOpenState.get(layer)).toBe(true);
  });

  it('closes the tooltip on Escape', async () => {
    render(<InfoTip content="Helpful context" />);
    const trigger = screen.getByRole('button', {name: 'More information'});
    const layer = screen.getByRole('tooltip', {hidden: true});

    focusTrigger(trigger);
    await waitFor(() => {
      expect(popoverOpenState.get(layer)).toBe(true);
    });

    fireEvent.keyDown(trigger, {key: 'Escape'});

    await waitFor(() => {
      expect(popoverOpenState.get(layer)).toBe(false);
    });
  });

  it('re-opens after Escape once the trigger is left and re-hovered', async () => {
    render(<InfoTip content="Helpful context" />);
    const trigger = screen.getByRole('button', {name: 'More information'});
    const layer = screen.getByRole('tooltip', {hidden: true});

    focusTrigger(trigger);
    await waitFor(() => {
      expect(popoverOpenState.get(layer)).toBe(true);
    });

    fireEvent.keyDown(trigger, {key: 'Escape'});
    await waitFor(() => {
      expect(popoverOpenState.get(layer)).toBe(false);
    });

    // Leave (resets dismissal), then re-enter
    act(() => {
      trigger.blur();
    });
    fireEvent.focusOut(trigger);
    fireEvent.mouseLeave(trigger);

    fireEvent.mouseEnter(trigger);
    await waitFor(() => {
      expect(popoverOpenState.get(layer)).toBe(true);
    });
  });

  it('renders ReactNode tooltip content', () => {
    render(<InfoTip content={<span data-testid="rich-content">Rich</span>} />);
    expect(screen.getByTestId('rich-content')).toBeInTheDocument();
  });

  // Tap/click toggle — the touch affordance required by the RFC's a11y section.
  // Core's useTooltip suppresses hover-open under `(hover: none)` and gates
  // focus-open on `:focus-visible`, so without a click path a touch user has
  // no way at all to open the tooltip.
  describe('tap/click toggle', () => {
    it('opens the tooltip on click', async () => {
      render(<InfoTip content="Helpful context" />);
      const trigger = screen.getByRole('button', {name: 'More information'});
      const layer = screen.getByRole('tooltip', {hidden: true});

      fireEvent.click(trigger);

      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(true);
      });
    });

    it('closes the tooltip on a second click', async () => {
      render(<InfoTip content="Helpful context" />);
      const trigger = screen.getByRole('button', {name: 'More information'});
      const layer = screen.getByRole('tooltip', {hidden: true});

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(true);
      });

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(false);
      });
    });

    it('keeps a clicked tooltip pinned after the pointer leaves', async () => {
      render(<InfoTip content="Helpful context" />);
      const trigger = screen.getByRole('button', {name: 'More information'});
      const layer = screen.getByRole('tooltip', {hidden: true});

      fireEvent.mouseEnter(trigger);
      fireEvent.click(trigger);
      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(true);
      });

      fireEvent.mouseLeave(trigger);
      // Outlast core's 100ms HOVER_BRIDGE_DELAY hide timer.
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(popoverOpenState.get(layer)).toBe(true);
    });

    it('still closes on the next click after the pointer has left', async () => {
      render(<InfoTip content="Helpful context" />);
      const trigger = screen.getByRole('button', {name: 'More information'});
      const layer = screen.getByRole('tooltip', {hidden: true});

      fireEvent.mouseEnter(trigger);
      fireEvent.click(trigger);
      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(true);
      });

      // Leaving must not silently unpin: `auto` cannot close an open layer, so
      // an unpin here would leave the tip visible but make the next click
      // re-pin instead of dismissing it.
      fireEvent.mouseLeave(trigger);
      fireEvent.mouseEnter(trigger);
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(false);
      });
    });

    it('closes a pinned tooltip on Escape', async () => {
      render(<InfoTip content="Helpful context" />);
      const trigger = screen.getByRole('button', {name: 'More information'});
      const layer = screen.getByRole('tooltip', {hidden: true});

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(true);
      });

      fireEvent.keyDown(trigger, {key: 'Escape'});
      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(false);
      });
    });

    it('closes a pinned tooltip when focus leaves the trigger', async () => {
      render(<InfoTip content="Helpful context" />);
      const trigger = screen.getByRole('button', {name: 'More information'});
      const layer = screen.getByRole('tooltip', {hidden: true});

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(true);
      });

      fireEvent.focusOut(trigger);
      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(false);
      });
    });

    it('re-opens on click after being dismissed', async () => {
      render(<InfoTip content="Helpful context" />);
      const trigger = screen.getByRole('button', {name: 'More information'});
      const layer = screen.getByRole('tooltip', {hidden: true});

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(true);
      });
      fireEvent.click(trigger);
      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(false);
      });

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(true);
      });
    });
  });

  // Escape must dismiss the tooltip without also closing an enclosing dialog,
  // and must NOT be swallowed when there is no tooltip to dismiss.
  describe('Escape propagation', () => {
    it('swallows Escape while the tooltip is pinned open', async () => {
      const onDialogKeyDown = vi.fn();
      render(
        <div role="dialog" onKeyDown={onDialogKeyDown}>
          <InfoTip content="Helpful context" />
        </div>,
      );
      const trigger = screen.getByRole('button', {name: 'More information'});
      const layer = screen.getByRole('tooltip', {hidden: true});

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(true);
      });

      fireEvent.keyDown(trigger, {key: 'Escape'});

      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(false);
      });
      expect(onDialogKeyDown).not.toHaveBeenCalled();
    });

    it('lets Escape reach an enclosing dialog when the tooltip is closed', () => {
      const onDialogKeyDown = vi.fn();
      render(
        <div role="dialog" onKeyDown={onDialogKeyDown}>
          <InfoTip content="Helpful context" />
        </div>,
      );
      const trigger = screen.getByRole('button', {name: 'More information'});

      fireEvent.keyDown(trigger, {key: 'Escape'});

      expect(onDialogKeyDown).toHaveBeenCalled();
    });

    it('lets a second Escape reach an enclosing dialog after dismissing the tip', async () => {
      const onDialogKeyDown = vi.fn();
      render(
        <div role="dialog" onKeyDown={onDialogKeyDown}>
          <InfoTip content="Helpful context" />
        </div>,
      );
      const trigger = screen.getByRole('button', {name: 'More information'});
      const layer = screen.getByRole('tooltip', {hidden: true});

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(true);
      });

      // First Escape dismisses the tip and is swallowed.
      fireEvent.keyDown(trigger, {key: 'Escape'});
      await waitFor(() => {
        expect(popoverOpenState.get(layer)).toBe(false);
      });
      expect(onDialogKeyDown).not.toHaveBeenCalled();

      // Second Escape has no tip to dismiss, so the dialog gets it.
      fireEvent.keyDown(trigger, {key: 'Escape'});
      expect(onDialogKeyDown).toHaveBeenCalled();
    });
  });
});
