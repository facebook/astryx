/**
 * @file XDSTooltip.test.tsx
 * @input Uses vitest, @testing-library/react, XDSTooltip component
 * @output Unit tests for XDSTooltip component behavior
 * @position Testing; validates XDSTooltip.tsx implementation
 *
 * SYNC: When XDSTooltip.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {XDSTooltip} from './XDSTooltip';

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
  HTMLElement.prototype.matches = function (selector: string) {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    return originalMatches.call(this, selector);
  };
});

afterAll(() => {
  HTMLElement.prototype.matches = originalMatches;
});

describe('XDSTooltip', () => {
  it('renders trigger element', () => {
    render(
      <XDSTooltip content="Tooltip text">
        <button>Trigger</button>
      </XDSTooltip>,
    );
    expect(screen.getByRole('button', {name: 'Trigger'})).toBeInTheDocument();
  });

  it('calls onOpenChange(true) when shown via hover', async () => {
    const onOpenChange = vi.fn();
    render(
      <XDSTooltip content="Tooltip text" onOpenChange={onOpenChange} delay={0}>
        <button>Trigger</button>
      </XDSTooltip>,
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
        <XDSTooltip content="Default open tooltip" isDefaultOpen>
          <button>Trigger</button>
        </XDSTooltip>,
      );

      // showPopover should be called on mount
      await waitFor(() => {
        expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
      });
    });

    it('calls onOpenChange(true) on mount when isDefaultOpen is true', async () => {
      const onOpenChange = vi.fn();
      render(
        <XDSTooltip
          content="Default open tooltip"
          isDefaultOpen
          onOpenChange={onOpenChange}>
          <button>Trigger</button>
        </XDSTooltip>,
      );

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('does not show tooltip on mount when isDefaultOpen is false', async () => {
      vi.mocked(HTMLElement.prototype.showPopover).mockClear();
      render(
        <XDSTooltip content="Not default open">
          <button>Trigger</button>
        </XDSTooltip>,
      );

      // Give it time to potentially fire
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
    });

    it('tooltip is still dismissible after isDefaultOpen', async () => {
      const onOpenChange = vi.fn();
      render(
        <XDSTooltip
          content="Dismissible tooltip"
          isDefaultOpen
          onOpenChange={onOpenChange}
          hideDelay={0}>
          <button>Trigger</button>
        </XDSTooltip>,
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
});
