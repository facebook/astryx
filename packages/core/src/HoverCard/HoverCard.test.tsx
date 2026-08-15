// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file HoverCard.test.tsx
 * @input Uses vitest, @testing-library/react, HoverCard component
 * @output Unit tests for HoverCard component behavior
 * @position Testing; validates HoverCard.tsx implementation
 *
 * SYNC: When HoverCard.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {hydrateRoot} from 'react-dom/client';
import {StrictMode} from 'react';
import {Button} from '../Button/Button';
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

  it('exposes the floating layer as role="group" when no label is provided', async () => {
    render(
      <HoverCard content={<span>Card content</span>} delay={0}>
        <button type="button">Trigger</button>
      </HoverCard>,
    );
    // A group may validly be unnamed; an unnamed dialog may not. Without a
    // label the layer must not claim the dialog role.
    const group = screen.getByRole('group', {hidden: true});
    expect(group).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog', {hidden: true})).toBeNull();

    fireEvent.mouseEnter(screen.getByRole('button', {name: 'Trigger'}));
    await waitFor(() => expect(group).toHaveTextContent('Card content'));
  });

  it('exposes the floating layer as a named dialog when label is provided', async () => {
    render(
      <HoverCard
        content={<span>Card content</span>}
        label="Profile preview"
        delay={0}>
        <button type="button">Trigger</button>
      </HoverCard>,
    );
    // The layer is hidden while closed, so assert the accessible name via the
    // aria-label attribute on the role-carrying element (same pattern as the
    // Popover dialogLabel test) — accname computation returns '' for hidden
    // elements.
    const dialog = screen.getByRole('dialog', {hidden: true});
    expect(dialog).toHaveAttribute('aria-label', 'Profile preview');
    expect(dialog).toBeEmptyDOMElement();
    expect(screen.queryByRole('group', {hidden: true})).toBeNull();

    fireEvent.mouseEnter(screen.getByRole('button', {name: 'Trigger'}));
    await waitFor(() => expect(dialog).toHaveTextContent('Card content'));
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

  it('renders the floating layer with inline-safe markup (no block elements in a paragraph)', () => {
    // HoverCard renders its floating layer inline (no portal), so the layer
    // must be phrasing content to stay valid — and stay put on hydration —
    // inside a <p>. Assert the layer popover element is a <span> and that the
    // paragraph contains no <div> descendants at all.
    const {container} = render(
      <p>
        Before{' '}
        <HoverCard content={<span>Card content</span>}>
          <a href="#trigger">Trigger</a>
        </HoverCard>{' '}
        after
      </p>,
    );

    const paragraph = container.querySelector('p');
    const layer = container.querySelector('[popover]');

    expect(layer).not.toBeNull();
    expect(layer?.tagName).toBe('SPAN');
    // The whole layer subtree lives inside the paragraph with no block boxes.
    expect(paragraph?.contains(layer as Node)).toBe(true);
    expect(paragraph?.querySelector('div')).toBeNull();
  });

  it('does not render content initially', () => {
    render(
      <HoverCard content={<span>Card content</span>}>
        <button type="button">Trigger</button>
      </HoverCard>,
    );
    expect(screen.queryByText('Card content')).toBeNull();
  });

  it('portals paragraph content before showing and removes it after hiding', async () => {
    vi.mocked(HTMLElement.prototype.showPopover).mockClear();
    let contentWasPresentAtShow = false;
    vi.mocked(HTMLElement.prototype.showPopover).mockImplementationOnce(
      function (this: HTMLElement) {
        contentWasPresentAtShow =
          this.textContent?.includes('Block card content') ?? false;
        popoverOpenState.set(this, true);
      },
    );
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const {container} = render(
      <p>
        Before{' '}
        <HoverCard
          content={<div>Block card content</div>}
          delay={0}
          hideDelay={0}>
          Trigger
        </HoverCard>{' '}
        after
      </p>,
    );

    const trigger = screen.getByText('Trigger');
    const paragraph = container.querySelector('p');
    const initialLayer = paragraph?.querySelector('[popover]');
    expect(screen.queryByText('Block card content')).toBeNull();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(initialLayer).not.toBeNull();

    fireEvent.mouseEnter(trigger);
    await waitFor(() => {
      const content = screen.getByText('Block card content');
      const portaledLayer = content.closest('[popover]');

      expect(portaledLayer?.parentElement).toBe(document.body);
      expect(portaledLayer?.tagName).toBe('DIV');
      expect(paragraph?.contains(content)).toBe(false);
      expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
      expect(contentWasPresentAtShow).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    fireEvent.mouseLeave(trigger);
    await waitFor(() => {
      expect(screen.queryByText('Block card content')).toBeNull();
    });

    consoleErrorSpy.mockRestore();
  });

  it('does not portal block content when the layer is outside a paragraph', async () => {
    const {container} = render(
      <HoverCard content={<div>Block card content</div>} delay={0}>
        <button type="button">Trigger</button>
      </HoverCard>,
    );

    fireEvent.mouseEnter(screen.getByRole('button', {name: 'Trigger'}));

    await waitFor(() => {
      const layer = screen.getByText('Block card content').closest('[popover]');
      expect(layer?.parentElement).toBe(container);
    });
  });

  it('forwards computed CSS variables to a paragraph portal', async () => {
    const variables = new Map([
      ['--color-neutral', 'rgb(1, 2, 3)'],
      ['--color-text-primary', 'rgb(250, 251, 252)'],
    ]);
    const getComputedStyleSpy = vi
      .spyOn(window, 'getComputedStyle')
      .mockImplementation(
        () =>
          ({
            length: variables.size,
            item: (index: number) => Array.from(variables.keys())[index] ?? '',
            getPropertyValue: (property: string) =>
              variables.get(property) ?? '',
            direction: 'rtl',
            writingMode: 'vertical-rl',
          }) as CSSStyleDeclaration,
      );

    const {container} = render(
      <p>
        <HoverCard
          content={<Button label="View profile">View profile</Button>}
          delay={0}>
          Trigger
        </HoverCard>
      </p>,
    );

    expect(screen.queryByRole('button', {name: 'View profile'})).toBeNull();

    fireEvent.mouseEnter(screen.getByText('Trigger'));

    await waitFor(() => {
      const button = screen.getByRole('button', {name: 'View profile'});
      const layer = button.closest('[popover]');

      expect(layer?.parentElement).toBe(document.body);
      expect(container.querySelector('p')?.contains(button)).toBe(false);
      expect(layer).toHaveStyle({
        '--color-neutral': 'rgb(1, 2, 3)',
        '--color-text-primary': 'rgb(250, 251, 252)',
      });
      expect(layer).toHaveStyle({direction: 'rtl', writingMode: 'vertical-rl'});
    });

    getComputedStyleSpy.mockRestore();
  });

  it('applies the theme body font to the floating layer', () => {
    render(
      <HoverCard content={<span>Card content</span>}>
        <button type="button">Trigger</button>
      </HoverCard>,
    );

    const layer = screen.getByRole('group', {hidden: true});
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
      vi.mocked(HTMLElement.prototype.showPopover).mockClear();
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
      vi.mocked(HTMLElement.prototype.showPopover).mockClear();
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
      vi.mocked(HTMLElement.prototype.showPopover).mockClear();
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

  describe('SSR / hydration', () => {
    // Regression coverage for the hydration mismatch (#3107). The floating
    // layer used to be portaled into document.body behind a
    // `typeof document !== 'undefined'` gate: the server rendered nothing while
    // the first client render emitted the portal, so the two trees disagreed.
    //
    // The layer is now rendered inline as inline-safe phrasing markup (a
    // `<span popover>`), identically on the server and the client, so there is
    // nothing for hydration to mismatch.

    it('renders the floating layer in server markup (no document gate)', () => {
      const html = renderToString(
        <HoverCard content={<span>Card content</span>}>
          <button type="button">Trigger</button>
        </HoverCard>,
      );

      // The phrasing-safe popover shell is present in server output, while
      // arbitrary consumer content is deferred until the card is requested.
      expect(html).toContain('popover="manual"');
      expect(html).not.toContain('Card content');
      // ...and it is a <span> (inline-safe), not a <div>.
      expect(html).toMatch(/<span[^>]*popover="manual"/);
    });

    it('omits block hover card content from server markup inside a paragraph', () => {
      const html = renderToString(
        <p>
          Before{' '}
          <HoverCard content={<div>Block card content</div>}>
            <a href="#trigger">Trigger</a>
          </HoverCard>{' '}
          after
        </p>,
      );

      // The empty popover shell is phrasing-safe; consumer content does not
      // reach the parser until an interaction requests the card.
      expect(html).not.toContain('<div');
      expect(html).not.toContain('Block card content');
      expect(html).toMatch(/<span[^>]*popover="manual"/);
    });

    it('server markup matches the first client render (no hydration mismatch)', async () => {
      const tree = (
        <StrictMode>
          <p>
            Glossary:{' '}
            <HoverCard content={<div>Definition</div>}>
              <a href="#term">term</a>
            </HoverCard>
            .
          </p>
        </StrictMode>
      );

      const serverHTML = renderToString(tree);

      const container = document.createElement('div');
      container.innerHTML = serverHTML;
      document.body.appendChild(container);

      // Capture any hydration diagnostics. React reports hydration mismatches
      // both through console.error and through onRecoverableError.
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const recoverableErrors: unknown[] = [];

      let root: ReturnType<typeof hydrateRoot>;
      await act(async () => {
        root = hydrateRoot(container, tree, {
          onRecoverableError: error => {
            recoverableErrors.push(error);
          },
        });
      });

      const hydrationErrors = consoleErrorSpy.mock.calls.filter(call =>
        String(call[0] ?? '')
          .toLowerCase()
          .includes('hydrat'),
      );

      expect(hydrationErrors).toEqual([]);
      expect(recoverableErrors).toEqual([]);

      await act(async () => {
        root.unmount();
      });
      consoleErrorSpy.mockRestore();
      container.remove();
    });

    it('hydrates a default-open hover card without a mismatch', async () => {
      vi.mocked(HTMLElement.prototype.showPopover).mockClear();

      const tree = (
        <HoverCard content={<span>Default open</span>} isDefaultOpen>
          <button type="button">Trigger</button>
        </HoverCard>
      );

      const serverHTML = renderToString(tree);
      // isDefaultOpen must not leak the open state into SSR markup — the open
      // call happens in an effect after hydration, so the server output is the
      // same closed markup the first client render produces.
      expect(serverHTML).toContain('popover="manual"');

      const container = document.createElement('div');
      container.innerHTML = serverHTML;
      document.body.appendChild(container);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const recoverableErrors: unknown[] = [];

      let root: ReturnType<typeof hydrateRoot>;
      await act(async () => {
        root = hydrateRoot(container, tree, {
          onRecoverableError: error => {
            recoverableErrors.push(error);
          },
        });
      });

      const hydrationErrors = consoleErrorSpy.mock.calls.filter(call =>
        String(call[0] ?? '')
          .toLowerCase()
          .includes('hydrat'),
      );
      expect(hydrationErrors).toEqual([]);
      expect(recoverableErrors).toEqual([]);

      // The card opens after hydration via the mount effect.
      await waitFor(() => {
        expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
      });

      await act(async () => {
        root.unmount();
      });
      consoleErrorSpy.mockRestore();
      container.remove();
    });
  });
});
