// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tooltip.test.tsx
 * @input Uses vitest, @testing-library/react, Tooltip component
 * @output Unit tests for Tooltip component behavior
 * @position Testing; validates Tooltip.tsx implementation
 *
 * SYNC: When Tooltip.tsx changes, update tests to match new behavior
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterAll,
} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {Tooltip} from './Tooltip';
import {__resetInteractionModalityForTest} from '../utils/interactionModality';

// Store original matches to restore later
const originalMatches = HTMLElement.prototype.matches;

// Track popover open state per element
const popoverOpenState = new WeakMap<HTMLElement, boolean>();

// Mock Popover API for jsdom
beforeAll(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
  });

  // Only intercept :popover-open, delegate everything else to original
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    return originalMatches.call(this, selector);
  };
});

afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = originalMatches;
});

describe('Tooltip', () => {
  it('renders trigger element', () => {
    render(
      <Tooltip content="Tooltip text">
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', {name: 'Trigger'})).toBeInTheDocument();
  });

  it('gives the tooltip layer role="tooltip" linked from the trigger', () => {
    render(
      <Tooltip content="Tooltip text">
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    const layer = screen.getByRole('tooltip', {hidden: true});
    expect(layer).toHaveTextContent('Tooltip text');
    // ARIA tooltip pattern: trigger references the layer via aria-describedby.
    const trigger = screen.getByRole('button', {name: 'Trigger'});
    expect(trigger.getAttribute('aria-describedby')).toBe(layer.id);
  });

  it('calls onOpenChange(true) when shown via hover', async () => {
    const onOpenChange = vi.fn();
    render(
      <Tooltip content="Tooltip text" onOpenChange={onOpenChange} delay={0}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', {name: 'Trigger'});
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('isDefaultOpen', () => {
    it('shows tooltip on mount when isDefaultOpen is true', async () => {
      render(
        <Tooltip content="Default open tooltip" isDefaultOpen>
          <button type="button">Trigger</button>
        </Tooltip>,
      );

      // showPopover should be called on mount
      await waitFor(() => {
        expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
      });
    });

    it('calls onOpenChange(true) on mount when isDefaultOpen is true', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip
          content="Default open tooltip"
          isDefaultOpen
          onOpenChange={onOpenChange}>
          <button type="button">Trigger</button>
        </Tooltip>,
      );

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('does not show tooltip on mount when isDefaultOpen is false', async () => {
      vi.mocked(HTMLElement.prototype.showPopover).mockClear();
      render(
        <Tooltip content="Not default open">
          <button type="button">Trigger</button>
        </Tooltip>,
      );

      // Give it time to potentially fire
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
    });

    it('tooltip is still dismissible after isDefaultOpen', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip
          content="Dismissible tooltip"
          isDefaultOpen
          onOpenChange={onOpenChange}
          hideDelay={0}>
          <button type="button">Trigger</button>
        </Tooltip>,
      );

      // Wait for it to show
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });

      // Mouse leave should hide it
      const trigger = screen.getByRole('button', {name: 'Trigger'});
      fireEvent.mouseLeave(trigger);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('WCAG 1.4.13 — content on hover or focus', () => {
    it('dismisses on Escape while visible (dismissible)', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip content="Dismiss me" onOpenChange={onOpenChange} delay={0}>
          <button type="button">Trigger</button>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});
      fireEvent.mouseEnter(trigger);
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });

      fireEvent.keyDown(document, {key: 'Escape'});
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('ignores Escape during IME composition', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip content="Stay" onOpenChange={onOpenChange} delay={0}>
          <button type="button">Trigger</button>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});
      fireEvent.mouseEnter(trigger);
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
      onOpenChange.mockClear();

      fireEvent.keyDown(document, {key: 'Escape', isComposing: true});
      // Give any (incorrect) async hide a chance to run.
      await new Promise(r => setTimeout(r, 20));
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });

    it('stays open when the pointer moves onto the tooltip surface (hoverable)', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip content="Hover me" onOpenChange={onOpenChange} delay={0}>
          <button type="button">Trigger</button>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});
      fireEvent.mouseEnter(trigger);
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
      onOpenChange.mockClear();

      // Pointer leaves the trigger but enters the tooltip surface before the
      // hover-bridge grace period elapses — the tooltip must not hide.
      fireEvent.mouseLeave(trigger);
      const layer = screen.getByRole('tooltip', {hidden: true});
      fireEvent.mouseEnter(layer);

      await new Promise(r => setTimeout(r, 150));
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });
  });

  describe('press-to-dismiss', () => {
    it('hides the tooltip when the trigger is pressed', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip content="Copy link" onOpenChange={onOpenChange} delay={0}>
          <button type="button">Trigger</button>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});
      fireEvent.mouseEnter(trigger);
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });

      fireEvent.pointerDown(trigger);
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('does not press-dismiss a controlled tooltip', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip
          content="Controlled"
          isOpen
          onOpenChange={onOpenChange}
          delay={0}>
          <button type="button">Trigger</button>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
      onOpenChange.mockClear();

      fireEvent.pointerDown(trigger);
      // Give any (incorrect) async hide a chance to run.
      await new Promise(r => setTimeout(r, 20));
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });
  });

  describe('controlled', () => {
    // Escape asks a controlled tooltip to close by calling this same handler,
    // so a consumer who complies sees the request and then this echo. Pinning
    // the echo here keeps the two straight.
    it('echoes the close through onOpenChange when the consumer flips isOpen', async () => {
      const onOpenChange = vi.fn();
      const {rerender} = render(
        <Tooltip content="Pinned" isOpen onOpenChange={onOpenChange} delay={0}>
          <button type="button">Trigger</button>
        </Tooltip>,
      );
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
      onOpenChange.mockClear();

      rerender(
        <Tooltip
          content="Pinned"
          isOpen={false}
          onOpenChange={onOpenChange}
          delay={0}>
          <button type="button">Trigger</button>
        </Tooltip>,
      );

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });
  describe('touch', () => {
    // The modality is document-global; a tap in one case must not decide the
    // next one's answer.
    beforeEach(() => {
      __resetInteractionModalityForTest();
    });

    /** A tap: the pointer sequence a finger produces before hover is faked. */
    const tap = (element: HTMLElement) => {
      // A finger's arrival fires pointerenter too, and that is the path a pen
      // must not take — cover it here rather than starting at pointerdown.
      fireEvent.pointerEnter(element, {pointerType: 'touch'});
      fireEvent.pointerDown(element, {pointerType: 'touch'});
      fireEvent.pointerUp(element, {pointerType: 'touch'});
      // Touch synthesizes hover after the press; the tooltip must not act on it.
      fireEvent.mouseEnter(element);
    };

    it('opens on a tap when the trigger performs no action', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip content="Tooltip text" onOpenChange={onOpenChange} delay={200}>
          Abbreviation
        </Tooltip>,
      );

      tap(screen.getByText('Abbreviation'));

      // Immediately: a tap is a decision, not hover intent, so no delay applies.
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('stays shut on a tap when the trigger performs an action', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip content="Tooltip text" onOpenChange={onOpenChange} delay={0}>
          <button type="button">Save</button>
        </Tooltip>,
      );

      tap(screen.getByRole('button', {name: 'Save'}));

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(onOpenChange).not.toHaveBeenCalledWith(true);
    });

    it('opens on a tap of an action trigger when touchTrigger is "tap"', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip
          content="What this metric means"
          onOpenChange={onOpenChange}
          touchTrigger="tap"
          delay={0}>
          <button type="button">Info</button>
        </Tooltip>,
      );

      tap(screen.getByRole('button', {name: 'Info'}));

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('never opens on a tap when touchTrigger is "none"', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip
          content="Tooltip text"
          onOpenChange={onOpenChange}
          touchTrigger="none"
          delay={0}>
          Abbreviation
        </Tooltip>,
      );

      tap(screen.getByText('Abbreviation'));

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(onOpenChange).not.toHaveBeenCalledWith(true);
    });

    it('closes on a second tap of the trigger', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip content="Tooltip text" onOpenChange={onOpenChange} delay={0}>
          Abbreviation
        </Tooltip>,
      );

      const trigger = screen.getByText('Abbreviation');
      tap(trigger);
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });

      tap(trigger);
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('closes on a tap outside — the dismissal a tap-open owes the user', async () => {
      const onOpenChange = vi.fn();
      render(
        <>
          <Tooltip content="Tooltip text" onOpenChange={onOpenChange} delay={0}>
            Abbreviation
          </Tooltip>
          <button type="button">Elsewhere</button>
        </>,
      );

      tap(screen.getByText('Abbreviation'));
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });

      fireEvent.pointerDown(screen.getByRole('button', {name: 'Elsewhere'}), {
        pointerType: 'touch',
      });

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('still opens on a real mouse hover after a tap', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip content="Tooltip text" onOpenChange={onOpenChange} delay={0}>
          <button type="button">Save</button>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', {name: 'Save'});
      tap(trigger);
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(onOpenChange).not.toHaveBeenCalledWith(true);

      // A hybrid device: the same trigger, now under a mouse.
      fireEvent.pointerEnter(trigger, {pointerType: 'mouse'});
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('opens on a hovering pen, which is a hover and not a tap', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip content="Tooltip text" onOpenChange={onOpenChange} delay={0}>
          <button type="button">Save</button>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', {name: 'Save'});
      // A stylus in detection range: pointerenter with nothing in contact, on
      // a device where `(hover: hover)` matches. Reading that as touch would
      // bail out of the hover path and leave the user no tooltip at all.
      fireEvent.pointerEnter(trigger, {pointerType: 'pen', buttons: 0});
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('tap-opens when a pen lands on an inert trigger', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip content="Tooltip text" onOpenChange={onOpenChange} delay={200}>
          Abbreviation
        </Tooltip>,
      );

      const trigger = screen.getByText('Abbreviation');
      // Hovering first, as a real pen does — then contact, which is a tap.
      fireEvent.pointerEnter(trigger, {pointerType: 'pen', buttons: 0});
      fireEvent.pointerDown(trigger, {pointerType: 'pen'});
      fireEvent.pointerUp(trigger, {pointerType: 'pen'});

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('does not reopen from the focus a tapped text field takes', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip content="Tooltip text" onOpenChange={onOpenChange} delay={0}>
          <input type="text" aria-label="Amount" />
        </Tooltip>,
      );

      const trigger = screen.getByLabelText('Amount');
      // A tapped text field matches `:focus-visible` in a real browser —
      // deliberately, per Selectors 4, so typing has a visible home. jsdom
      // does not model that, so stand it up here; without it this case cannot
      // fail, whatever the focus path does.
      const realMatches = trigger.matches.bind(trigger);
      vi.spyOn(trigger, 'matches').mockImplementation((selector: string) =>
        selector === ':focus-visible' ? true : realMatches(selector),
      );

      // An `<input>` is an action trigger, so `auto` gives it the tap — and
      // the focus it takes must not put the tooltip back over the field the
      // user is about to type into.
      tap(trigger);
      fireEvent.focusIn(trigger);

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(onOpenChange).not.toHaveBeenCalledWith(true);
    });

    it('still opens on keyboard focus of a trigger a finger touched', async () => {
      const onOpenChange = vi.fn();
      render(
        <Tooltip content="Tooltip text" onOpenChange={onOpenChange} delay={0}>
          <input type="text" aria-label="Amount" />
        </Tooltip>,
      );

      const trigger = screen.getByLabelText('Amount');
      const realMatches = trigger.matches.bind(trigger);
      vi.spyOn(trigger, 'matches').mockImplementation((selector: string) =>
        selector === ':focus-visible' ? true : realMatches(selector),
      );

      tap(trigger);
      // Reaching for the keyboard ends the touch interaction; the guard is on
      // the gesture in flight, not on the device the trigger last saw.
      fireEvent.keyDown(document, {key: 'Tab'});
      fireEvent.focusIn(trigger);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });
  });
});
