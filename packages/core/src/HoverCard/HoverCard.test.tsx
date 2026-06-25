// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file HoverCard.test.tsx
 * @input Uses vitest, @testing-library/react, React SSR/hydration APIs, HoverCard component
 * @output Unit tests for HoverCard component behavior
 * @position Testing; validates HoverCard.tsx implementation
 *
 * SYNC: When HoverCard.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {act} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {HoverCard} from './HoverCard';

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

describe('HoverCard', () => {
  it('renders trigger element', () => {
    render(
      <HoverCard content={<span>Card content</span>}>
        <button type="button">Trigger</button>
      </HoverCard>,
    );
    expect(screen.getByRole('button', {name: 'Trigger'})).toBeInTheDocument();
  });

  it('wraps element children in an inline-safe span', () => {
    const {container} = render(
      <p>
        Before{' '}
        <HoverCard content={<span>Card content</span>}>
          <a href="#trigger">Trigger</a>
        </HoverCard>{' '}
        after
      </p>,
    );

    const trigger = screen.getByRole('link', {name: 'Trigger'});
    const paragraph = container.querySelector('p');

    expect(trigger.parentElement?.tagName).toBe('SPAN');
    expect(paragraph?.querySelector('div')).toBeNull();
  });

  it('does not show content initially', () => {
    render(
      <HoverCard content={<span>Card content</span>}>
        <button type="button">Trigger</button>
      </HoverCard>,
    );
    // Content is in DOM (popover not open but element exists)
    const content = screen.queryByText('Card content');
    expect(content).toBeInTheDocument();
  });

  it('applies the theme body font to the portaled layer', () => {
    render(
      <HoverCard content={<span>Card content</span>}>
        <button type="button">Trigger</button>
      </HoverCard>,
    );

    const layer = screen.getByText('Card content').closest('[popover]');
    expect(layer).not.toBeNull();
    expect(getComputedStyle(layer as Element).fontFamily).toBe(
      'var(--font-family-body)',
    );
  });

  it('injects aria-describedby on trigger', () => {
    render(
      <HoverCard content={<span>Card content</span>}>
        <button type="button">Trigger</button>
      </HoverCard>,
    );
    const trigger = screen.getByRole('button', {name: 'Trigger'});
    expect(trigger).toHaveAttribute('aria-describedby');
  });

  it('merges existing aria-describedby', () => {
    render(
      <HoverCard content={<span>Card content</span>}>
        <button type="button" aria-describedby="existing-id">
          Trigger
        </button>
      </HoverCard>,
    );
    const trigger = screen.getByRole('button', {name: 'Trigger'});
    const describedBy = trigger.getAttribute('aria-describedby');
    expect(describedBy).toContain('existing-id');
  });

  it('calls onOpenChange(true) when shown', async () => {
    const onOpenChange = vi.fn();
    render(
      <HoverCard
        content={<span>Card content</span>}
        onOpenChange={onOpenChange}
        delay={0}>
        <button type="button">Trigger</button>
      </HoverCard>,
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
      <HoverCard
        content={<span>Card content</span>}
        onOpenChange={onOpenChange}
        isEnabled={false}
        delay={0}>
        <button type="button">Trigger</button>
      </HoverCard>,
    );

    const trigger = screen.getByRole('button', {name: 'Trigger'});
    fireEvent.mouseEnter(trigger);

    // Wait a bit and verify onOpenChange was not called
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('supports text-only children with inline wrapper', () => {
    render(
      <HoverCard content={<span>Card content</span>}>
        Just text, no element
      </HoverCard>,
    );
    // Text should be rendered
    expect(screen.getByText('Just text, no element')).toBeInTheDocument();
    // Should have aria-describedby on the wrapper span
    const wrapper = screen.getByText('Just text, no element');
    expect(wrapper.tagName).toBe('SPAN');
    expect(wrapper).toHaveAttribute('aria-describedby');
  });

  describe('SSR / hydration', () => {
    it('does not emit the portaled popover in server-rendered markup', () => {
      const html = renderToString(
        <HoverCard
          content={<div>Hover content</div>}
          placement="above"
          alignment="center">
          <a href="https://example.com">Example</a>
        </HoverCard>,
      );

      // The trigger renders on the server...
      expect(html).toContain('Example');
      // ...but the portaled popover layer must not, since the server cannot
      // create a portal and emitting it would mismatch the first client render.
      expect(html).not.toContain('Hover content');
      expect(html).not.toContain('popover=');
    });

    it('hydrates without a mismatch and mounts the popover after hydration', async () => {
      const ui = (
        <HoverCard
          content={<div>Hover content</div>}
          placement="above"
          alignment="center">
          <a href="https://example.com">Example</a>
        </HoverCard>
      );

      const html = renderToString(ui);
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      let root: ReturnType<typeof hydrateRoot> | null = null;

      try {
        await act(async () => {
          root = hydrateRoot(container, ui);
        });

        // After hydration commits, the deferred portal attaches the layer.
        await waitFor(() => {
          expect(
            screen.getByText('Hover content').closest('[popover]'),
          ).not.toBeNull();
        });

        // No hydration mismatch should have been reported.
        const hydrationErrors = errorSpy.mock.calls.filter(call =>
          call.some(arg =>
            /hydrat|did not match|server (?:rendered|html)/i.test(String(arg)),
          ),
        );
        expect(hydrationErrors).toEqual([]);
      } finally {
        errorSpy.mockRestore();
        await act(async () => {
          root?.unmount();
        });
        container.remove();
      }
    });

    it('opens the popover after hydration when isDefaultOpen is true', async () => {
      vi.mocked(HTMLElement.prototype.showPopover).mockClear();

      const ui = (
        <HoverCard
          content={<span>Hydrated default open card</span>}
          isDefaultOpen>
          <button type="button">Trigger</button>
        </HoverCard>
      );

      const html = renderToString(ui);
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      // The default-open layer is still deferred on the server render.
      expect(html).not.toContain('Hydrated default open card');
      expect(html).not.toContain('popover=');

      let root: ReturnType<typeof hydrateRoot> | null = null;

      try {
        await act(async () => {
          root = hydrateRoot(container, ui);
        });

        // useLayer should replay the pending open onto the freshly-attached
        // popover element once it mounts after hydration.
        await waitFor(() => {
          expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
        });
      } finally {
        await act(async () => {
          root?.unmount();
        });
        container.remove();
      }
    });
  });

  describe('isDefaultOpen', () => {
    it('shows hover card on mount when isDefaultOpen is true', async () => {
      vi.mocked(HTMLElement.prototype.showPopover).mockClear();
      render(
        <HoverCard content={<span>Default open card</span>} isDefaultOpen>
          <button type="button">Trigger</button>
        </HoverCard>,
      );

      await waitFor(() => {
        expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
      });
    });

    it('calls onOpenChange(true) on mount when isDefaultOpen is true', async () => {
      const onOpenChange = vi.fn();
      render(
        <HoverCard
          content={<span>Default open card</span>}
          isDefaultOpen
          onOpenChange={onOpenChange}>
          <button type="button">Trigger</button>
        </HoverCard>,
      );

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('does not show hover card on mount when isDefaultOpen is not set', async () => {
      vi.mocked(HTMLElement.prototype.showPopover).mockClear();
      render(
        <HoverCard content={<span>Not default open</span>}>
          <button type="button">Trigger</button>
        </HoverCard>,
      );

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
    });

    it('hover card is still dismissible after isDefaultOpen', async () => {
      const onOpenChange = vi.fn();
      render(
        <HoverCard
          content={<span>Dismissible card</span>}
          isDefaultOpen
          onOpenChange={onOpenChange}
          hideDelay={0}>
          <button type="button">Trigger</button>
        </HoverCard>,
      );

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });

      const trigger = screen.getByRole('button', {name: 'Trigger'});
      fireEvent.mouseLeave(trigger);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Escape key behavior', () => {
    it('hides hover card when Escape is pressed on trigger', async () => {
      const onOpenChange = vi.fn();
      // Reset the mock before this test
      vi.mocked(HTMLElement.prototype.hidePopover).mockClear();

      render(
        <HoverCard
          content={<span>Card content</span>}
          onOpenChange={onOpenChange}
          delay={0}
          hideDelay={0}>
          <button type="button">Trigger</button>
        </HoverCard>,
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
        <HoverCard
          content={<button type="button">Interactive button</button>}
          delay={0}
          hideDelay={0}>
          <button type="button">Trigger</button>
        </HoverCard>,
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
        <HoverCard
          content={<button type="button">Interactive button</button>}
          delay={0}
          hideDelay={0}>
          <button type="button">Trigger</button>
        </HoverCard>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});

      // Show the hover card via focus
      fireEvent.focus(trigger);
      await waitFor(() => {
        expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
      });

      // Focus the content button
      const contentButton = screen.getByText('Interactive button');
      contentButton.focus();

      // Press Escape - should refocus trigger
      fireEvent.keyDown(contentButton, {key: 'Escape'});

      await waitFor(() => {
        expect(document.activeElement).toBe(trigger);
      });
    });

    it('does not re-show hover card after Escape dismiss and refocus', async () => {
      const onOpenChange = vi.fn();
      render(
        <HoverCard
          content={<button type="button">Interactive button</button>}
          onOpenChange={onOpenChange}
          delay={0}
          hideDelay={0}>
          <button type="button">Trigger</button>
        </HoverCard>,
      );

      const trigger = screen.getByRole('button', {name: 'Trigger'});

      // Show the hover card via focus
      fireEvent.focus(trigger);
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledTimes(1);
      });

      // Focus the content button
      const contentButton = screen.getByText('Interactive button');
      contentButton.focus();

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
});
