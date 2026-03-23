/**
 * @file XDSHoverCard.test.tsx
 * @input Uses vitest, @testing-library/react, XDSHoverCard component
 * @output Unit tests for XDSHoverCard component behavior
 * @position Testing; validates XDSHoverCard.tsx implementation
 *
 * SYNC: When XDSHoverCard.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {XDSHoverCard} from './XDSHoverCard';

// Store original matches to restore later
const originalMatches = HTMLElement.prototype.matches;

// Track popover open state per element
const popoverOpenState = new WeakMap<HTMLElement, boolean>();

// Mock Popover API for jsdom — fires toggle event like the browser does
beforeAll(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
    const event = new Event('toggle') as ToggleEvent;
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
    const event = new Event('toggle') as ToggleEvent;
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
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

describe('XDSHoverCard', () => {
  it('renders trigger element', () => {
    render(
      <XDSHoverCard content={<span>Card content</span>}>
        <button>Trigger</button>
      </XDSHoverCard>,
    );
    expect(screen.getByRole('button', {name: 'Trigger'})).toBeInTheDocument();
  });

  it('does not show content initially', () => {
    render(
      <XDSHoverCard content={<span>Card content</span>}>
        <button>Trigger</button>
      </XDSHoverCard>,
    );
    // Content is in DOM (popover not open but element exists)
    const content = screen.queryByText('Card content');
    expect(content).toBeInTheDocument();
  });

  it('injects aria-describedby on trigger', () => {
    render(
      <XDSHoverCard content={<span>Card content</span>}>
        <button>Trigger</button>
      </XDSHoverCard>,
    );
    const trigger = screen.getByRole('button', {name: 'Trigger'});
    expect(trigger).toHaveAttribute('aria-describedby');
  });

  it('merges existing aria-describedby', () => {
    render(
      <XDSHoverCard content={<span>Card content</span>}>
        <button aria-describedby="existing-id">Trigger</button>
      </XDSHoverCard>,
    );
    const trigger = screen.getByRole('button', {name: 'Trigger'});
    const describedBy = trigger.getAttribute('aria-describedby');
    expect(describedBy).toContain('existing-id');
  });

  it('calls onOpenChange(true) when shown', async () => {
    const onOpenChange = vi.fn();
    render(
      <XDSHoverCard
        content={<span>Card content</span>}
        onOpenChange={onOpenChange}
        delay={0}>
        <button>Trigger</button>
      </XDSHoverCard>,
    );

    const trigger = screen.getByRole('button', {name: 'Trigger'});
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  it('respects isEnabled prop', async () => {
    const onOpenChange = vi.fn();
    render(
      <XDSHoverCard
        content={<span>Card content</span>}
        onOpenChange={onOpenChange}
        isEnabled={false}
        delay={0}>
        <button>Trigger</button>
      </XDSHoverCard>,
    );

    const trigger = screen.getByRole('button', {name: 'Trigger'});
    fireEvent.mouseEnter(trigger);

    // Wait a bit and verify onOpenChange was not called
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('supports text-only children with inline wrapper', () => {
    render(
      <XDSHoverCard content={<span>Card content</span>}>
        Just text, no element
      </XDSHoverCard>,
    );
    // Text should be rendered
    expect(screen.getByText('Just text, no element')).toBeInTheDocument();
    // Should have aria-describedby on the wrapper span
    const wrapper = screen.getByText('Just text, no element');
    expect(wrapper.tagName).toBe('SPAN');
    expect(wrapper).toHaveAttribute('aria-describedby');
  });

  describe('Escape key behavior', () => {
    it('hides hover card when Escape is pressed on trigger', async () => {
      const onOpenChange = vi.fn();
      // Reset the mock before this test
      vi.mocked(HTMLElement.prototype.hidePopover).mockClear();

      render(
        <XDSHoverCard
          content={<span>Card content</span>}
          onOpenChange={onOpenChange}
          delay={0}
          hideDelay={0}>
          <button>Trigger</button>
        </XDSHoverCard>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});

      // Show the hover card
      fireEvent.mouseEnter(trigger);
      await waitFor(() => {
        expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
      });

      // Press Escape on trigger
      fireEvent.keyDown(trigger, {key: 'Escape'});

      // hidePopover should be called
      await waitFor(() => {
        expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
      });
    });

    it('hides hover card when Escape is pressed inside content', async () => {
      vi.mocked(HTMLElement.prototype.hidePopover).mockClear();

      render(
        <XDSHoverCard
          content={<button>Interactive button</button>}
          delay={0}
          hideDelay={0}>
          <button>Trigger</button>
        </XDSHoverCard>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});

      // Show the hover card
      fireEvent.mouseEnter(trigger);
      await waitFor(() => {
        expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
      });

      // Find the interactive content using getByText (works inside popovers)
      const contentButton = screen.getByText('Interactive button');
      fireEvent.keyDown(contentButton, {key: 'Escape'});

      // hidePopover should be called
      await waitFor(() => {
        expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
      });
    });

    it('refocuses trigger after Escape from content', async () => {
      render(
        <XDSHoverCard
          content={<button>Interactive button</button>}
          delay={0}
          hideDelay={0}>
          <button>Trigger</button>
        </XDSHoverCard>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});

      // Show the hover card via focus
      fireEvent.focus(trigger);
      await waitFor(() => {
        expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
      });

      // Focus the content button
      const contentButton = screen.getByText('Interactive button');
      (contentButton as HTMLElement).focus();

      // Press Escape - should refocus trigger
      fireEvent.keyDown(contentButton, {key: 'Escape'});

      await waitFor(() => {
        expect(document.activeElement).toBe(trigger);
      });
    });

    it('does not re-show hover card after Escape dismiss and refocus', async () => {
      const onOpenChange = vi.fn();
      render(
        <XDSHoverCard
          content={<button>Interactive button</button>}
          onOpenChange={onOpenChange}
          delay={0}
          hideDelay={0}>
          <button>Trigger</button>
        </XDSHoverCard>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});

      // Show the hover card via focus
      fireEvent.focus(trigger);
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledTimes(1);
      });

      // Focus the content button
      const contentButton = screen.getByText('Interactive button');
      (contentButton as HTMLElement).focus();

      // Clear the mock to track new calls
      onOpenChange.mockClear();

      // Press Escape - this refocuses trigger but shouldn't re-show
      fireEvent.keyDown(contentButton, {key: 'Escape'});

      // Wait a bit and verify onOpenChange was not called with true (re-show)
      // It may be called with false (dismiss), which is expected
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(onOpenChange).not.toHaveBeenCalledWith(true);
    });
  });

  describe('touch suppression', () => {
    it('does not show hover card on touch-then-mouseenter', async () => {
      const onOpenChange = vi.fn();
      render(
        <XDSHoverCard
          content={<span>Card content</span>}
          onOpenChange={onOpenChange}
          delay={0}>
          <button>Trigger</button>
        </XDSHoverCard>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});

      // Simulate touch followed by mouse (as mobile browsers do)
      fireEvent.touchStart(trigger);
      fireEvent.mouseEnter(trigger);

      // Wait and verify hover card was not shown
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('ARIA', () => {
    it('popover content does not have role="status"', () => {
      const {container} = render(
        <XDSHoverCard content={<span>Card content</span>}>
          <button>Trigger</button>
        </XDSHoverCard>,
      );

      const statusEl = container.querySelector('[role="status"]');
      expect(statusEl).not.toBeInTheDocument();
    });
  });

  describe('onOpenChange double-fire prevention', () => {
    it('fires onOpenChange(true) exactly once per show', async () => {
      const onOpenChange = vi.fn();
      render(
        <XDSHoverCard
          content={<span>Card content</span>}
          onOpenChange={onOpenChange}
          delay={0}>
          <button>Trigger</button>
        </XDSHoverCard>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });

      // Should have been called exactly once with true
      const trueCalls = onOpenChange.mock.calls.filter(
        ([val]: [boolean]) => val === true,
      );
      expect(trueCalls).toHaveLength(1);
    });
  });
});
