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

// Mock Popover API for jsdom — dispatch toggle events like real browsers
beforeAll(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
    const event = new Event('toggle', {bubbles: false});
    (event as unknown as ToggleEvent).newState = 'open';
    (event as unknown as ToggleEvent).oldState = 'closed';
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
    const event = new Event('toggle', {bubbles: false});
    (event as unknown as ToggleEvent).newState = 'closed';
    (event as unknown as ToggleEvent).oldState = 'open';
    this.dispatchEvent(event);
  });

  // Intercept :popover-open and :focus-visible (unsupported in jsdom)
  HTMLElement.prototype.matches = function (selector: string) {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    if (selector === ':focus-visible') {
      return this === document.activeElement;
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

  it('renders tooltip content in DOM', () => {
    render(
      <XDSTooltip content="Tooltip text">
        <button>Trigger</button>
      </XDSTooltip>,
    );
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('injects aria-describedby on trigger', () => {
    render(
      <XDSTooltip content="Tooltip text">
        <button>Trigger</button>
      </XDSTooltip>,
    );
    const trigger = screen.getByRole('button', {name: 'Trigger'});
    expect(trigger).toHaveAttribute('aria-describedby');
  });

  it('merges existing aria-describedby', () => {
    render(
      <XDSTooltip content="Tooltip text">
        <button aria-describedby="existing-id">Trigger</button>
      </XDSTooltip>,
    );
    const trigger = screen.getByRole('button', {name: 'Trigger'});
    const describedBy = trigger.getAttribute('aria-describedby');
    expect(describedBy).toContain('existing-id');
  });

  it('has role="tooltip" on popover element with matching id', () => {
    render(
      <XDSTooltip content="Tooltip text">
        <button>Trigger</button>
      </XDSTooltip>,
    );
    // Popover is hidden by default, so use hidden: true
    const tooltipEl = screen.getByRole('tooltip', {hidden: true});
    expect(tooltipEl).toBeInTheDocument();
    // The element with role="tooltip" must have the id referenced by aria-describedby
    const trigger = screen.getByRole('button', {name: 'Trigger'});
    const describedBy = trigger.getAttribute('aria-describedby');
    expect(tooltipEl.id).toBe(describedBy);
  });

  it('calls onOpenChange(true) when shown via hover', async () => {
    const onOpenChange = vi.fn();
    render(
      <XDSTooltip
        content="Tooltip text"
        onOpenChange={onOpenChange}
        delay={0}>
        <button>Trigger</button>
      </XDSTooltip>,
    );

    const trigger = screen.getByRole('button', {name: 'Trigger'});
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  it('calls onOpenChange(false) when hidden via mouse leave', async () => {
    const onOpenChange = vi.fn();
    render(
      <XDSTooltip
        content="Tooltip text"
        onOpenChange={onOpenChange}
        delay={0}>
        <button>Trigger</button>
      </XDSTooltip>,
    );

    const trigger = screen.getByRole('button', {name: 'Trigger'});
    fireEvent.mouseEnter(trigger);
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    fireEvent.mouseLeave(trigger);
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('respects isEnabled prop', async () => {
    const onOpenChange = vi.fn();
    render(
      <XDSTooltip
        content="Tooltip text"
        onOpenChange={onOpenChange}
        isEnabled={false}
        delay={0}>
        <button>Trigger</button>
      </XDSTooltip>,
    );

    const trigger = screen.getByRole('button', {name: 'Trigger'});
    fireEvent.mouseEnter(trigger);

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('supports text-only children with inline wrapper', () => {
    render(
      <XDSTooltip content="Tooltip text">Just text, no element</XDSTooltip>,
    );
    const wrapper = screen.getByText('Just text, no element');
    expect(wrapper.tagName).toBe('SPAN');
    expect(wrapper).toHaveAttribute('aria-describedby');
  });

  describe('Escape key behavior', () => {
    it('hides tooltip when Escape is pressed on trigger', async () => {
      vi.mocked(HTMLElement.prototype.hidePopover).mockClear();

      render(
        <XDSTooltip content="Tooltip text" delay={0}>
          <button>Trigger</button>
        </XDSTooltip>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});

      // Show the tooltip
      fireEvent.mouseEnter(trigger);
      await waitFor(() => {
        expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
      });

      // Press Escape on trigger
      fireEvent.keyDown(trigger, {key: 'Escape'});

      await waitFor(() => {
        expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
      });
    });

    it('stops propagation on Escape when tooltip is open', async () => {
      const parentKeyDown = vi.fn();

      render(
        <div onKeyDown={parentKeyDown}>
          <XDSTooltip content="Tooltip text" delay={0}>
            <button>Trigger</button>
          </XDSTooltip>
        </div>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});

      // Show the tooltip
      fireEvent.mouseEnter(trigger);
      await waitFor(() => {
        expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
      });

      // Press Escape — should not propagate to parent
      fireEvent.keyDown(trigger, {key: 'Escape'});

      await waitFor(() => {
        expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
      });
      expect(parentKeyDown).not.toHaveBeenCalled();
    });

    it('does not stop propagation when tooltip is not open', () => {
      const parentKeyDown = vi.fn();

      render(
        <div onKeyDown={parentKeyDown}>
          <XDSTooltip content="Tooltip text" delay={200}>
            <button>Trigger</button>
          </XDSTooltip>
        </div>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});

      // Press Escape without showing tooltip — should propagate to parent
      fireEvent.keyDown(trigger, {key: 'Escape'});
      expect(parentKeyDown).toHaveBeenCalled();
    });
  });

  describe('focus trigger', () => {
    it('shows tooltip on focus for focusable elements', async () => {
      const onOpenChange = vi.fn();
      render(
        <XDSTooltip content="Tooltip text" onOpenChange={onOpenChange}>
          <button>Trigger</button>
        </XDSTooltip>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});
      // Use .focus() so document.activeElement is set (required for :focus-visible mock)
      trigger.focus();

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('does not show on focus when focusTrigger="never"', async () => {
      const onOpenChange = vi.fn();
      render(
        <XDSTooltip
          content="Tooltip text"
          onOpenChange={onOpenChange}
          focusTrigger="never">
          <button>Trigger</button>
        </XDSTooltip>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});
      trigger.focus();

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('placement', () => {
    it('accepts different placements', () => {
      const {rerender} = render(
        <XDSTooltip content="Tooltip text" placement="below">
          <button>Trigger</button>
        </XDSTooltip>,
      );
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();

      rerender(
        <XDSTooltip content="Tooltip text" placement="start">
          <button>Trigger</button>
        </XDSTooltip>,
      );
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });
  });
});
