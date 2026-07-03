// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tooltip.test.tsx
 * @input Uses vitest, @testing-library/react, Tooltip component
 * @output Unit tests for Tooltip component behavior
 * @position Testing; validates Tooltip.tsx implementation
 *
 * SYNC: When Tooltip.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {Tooltip} from './Tooltip';

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
});
