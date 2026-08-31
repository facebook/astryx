// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Drawer.test.tsx
 * @input Uses vitest, @testing-library/react, Drawer component
 * @output Unit tests for Drawer component behavior
 * @position Lab testing; validates Drawer.tsx implementation
 *
 * SYNC: When Drawer.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
  within,
} from '@testing-library/react';
import {Profiler, useEffect, useRef, useState} from 'react';
import {Drawer} from './Drawer';

// Mock dialog methods since they're not fully implemented in jsdom
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });

  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Drawer', () => {
  it('renders children when open', () => {
    render(
      <Drawer isOpen onOpenChange={() => {}} label="Host details">
        Drawer content
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Drawer content')).toBeInTheDocument();
  });

  it('does not show when isOpen is false', () => {
    render(
      <Drawer isOpen={false} onOpenChange={() => {}} label="Host details">
        Hidden content
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog', {hidden: true});
    expect(dialog).not.toHaveAttribute('open');
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  it('applies the accessible label', () => {
    render(
      <Drawer isOpen onOpenChange={() => {}} label="Host details">
        Content
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Host details');
  });

  describe('Escape key', () => {
    it('calls onOpenChange(false) on Escape keydown', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer isOpen onOpenChange={handleOpenChange} label="Details">
          Content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('calls onOpenChange(false) on Escape in non-modal mode (no native cancel)', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer
          isOpen
          onOpenChange={handleOpenChange}
          label="Details"
          modality="nonModal">
          Content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('prevents the native cancel event and routes through onOpenChange(false)', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer isOpen onOpenChange={handleOpenChange} label="Details">
          Content
        </Drawer>,
      );
      const cancelEvent = new Event('cancel', {cancelable: true});
      fireEvent(screen.getByRole('dialog'), cancelEvent);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
      expect(cancelEvent.defaultPrevented).toBe(true);
    });

    it('ignores other keys', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer isOpen onOpenChange={handleOpenChange} label="Details">
          Content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Enter'});
      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('consumer event handlers', () => {
    it('composes a consumer onKeyDown with built-in Escape handling', () => {
      const handleKeyDown = vi.fn();
      const handleOpenChange = vi.fn();
      render(
        <Drawer
          isOpen
          onOpenChange={handleOpenChange}
          label="Details"
          onKeyDown={handleKeyDown}>
          Content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('lets a consumer preventDefault opt out of built-in Escape handling', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer
          isOpen
          onOpenChange={handleOpenChange}
          label="Details"
          onKeyDown={event => event.preventDefault()}>
          Content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('scrim click', () => {
    it('calls onOpenChange(false) when the ::backdrop (dialog element itself) is clicked', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer isOpen onOpenChange={handleOpenChange} label="Details">
          Content
        </Drawer>,
      );
      fireEvent.click(screen.getByRole('dialog'));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not close when drawer content is clicked', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer isOpen onOpenChange={handleOpenChange} label="Details">
          <button type="button">Inside</button>
        </Drawer>,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Inside'}));
      expect(handleOpenChange).not.toHaveBeenCalled();
    });

    it('does not close on self-click when non-modal (no scrim to click)', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer
          isOpen
          onOpenChange={handleOpenChange}
          label="Details"
          modality="nonModal">
          Content
        </Drawer>,
      );
      fireEvent.click(screen.getByRole('dialog'));
      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('close and focus restore', () => {
    function Harness() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open inspector
          </button>
          <Drawer isOpen={isOpen} onOpenChange={setIsOpen} label="Inspector">
            <button type="button" onClick={() => setIsOpen(false)}>
              Close inspector
            </button>
          </Drawer>
        </>
      );
    }

    it('delays dialog.close() so the exit transition can play', () => {
      vi.useFakeTimers();
      try {
        render(<Harness />);
        fireEvent.click(screen.getByRole('button', {name: 'Open inspector'}));
        const dialog = screen.getByRole('dialog', {hidden: true});
        expect(dialog).toHaveAttribute('open');

        fireEvent.click(screen.getByRole('button', {name: 'Close inspector'}));
        // Still open while the slide-out transition plays
        expect(dialog).toHaveAttribute('open');
        act(() => {
          vi.advanceTimersByTime(250);
        });
        expect(dialog).toHaveAttribute('open');
        act(() => {
          vi.advanceTimersByTime(300);
        });
        expect(dialog).not.toHaveAttribute('open');
      } finally {
        vi.useRealTimers();
      }
    });

    it('closes as soon as the slide-out transition ends', () => {
      vi.useFakeTimers();
      try {
        render(<Harness />);
        fireEvent.click(screen.getByRole('button', {name: 'Open inspector'}));
        const dialog = screen.getByRole('dialog', {hidden: true});

        fireEvent.click(screen.getByRole('button', {name: 'Close inspector'}));
        expect(dialog).toHaveAttribute('open');

        // The transition is authoritative — no need to wait out the backstop.
        act(() => {
          fireEvent.transitionEnd(dialog, {propertyName: 'transform'});
        });
        expect(dialog).not.toHaveAttribute('open');
      } finally {
        vi.useRealTimers();
      }
    });

    it('keeps sliding while a transitionend for another property arrives', () => {
      vi.useFakeTimers();
      try {
        render(<Harness />);
        fireEvent.click(screen.getByRole('button', {name: 'Open inspector'}));
        const dialog = screen.getByRole('dialog', {hidden: true});

        fireEvent.click(screen.getByRole('button', {name: 'Close inspector'}));
        act(() => {
          fireEvent.transitionEnd(dialog, {propertyName: 'opacity'});
        });
        expect(dialog).toHaveAttribute('open');
      } finally {
        vi.useRealTimers();
      }
    });

    it('restores focus to the trigger element on close', () => {
      vi.useFakeTimers();
      try {
        render(<Harness />);
        const trigger = screen.getByRole('button', {name: 'Open inspector'});
        trigger.focus();
        fireEvent.click(trigger);

        fireEvent.click(screen.getByRole('button', {name: 'Close inspector'}));
        act(() => {
          vi.advanceTimersByTime(300);
        });
        expect(trigger).toHaveFocus();
      } finally {
        vi.useRealTimers();
      }
    });

    it('can be re-opened after closing', () => {
      vi.useFakeTimers();
      try {
        render(<Harness />);
        const dialog = screen.getByRole('dialog', {hidden: true});

        fireEvent.click(screen.getByRole('button', {name: 'Open inspector'}));
        expect(dialog).toHaveAttribute('open');

        fireEvent.click(screen.getByRole('button', {name: 'Close inspector'}));
        act(() => {
          vi.advanceTimersByTime(300);
        });
        expect(dialog).not.toHaveAttribute('open');

        fireEvent.click(screen.getByRole('button', {name: 'Open inspector'}));
        act(() => {
          vi.advanceTimersByTime(300);
        });
        expect(dialog).toHaveAttribute('open');
      } finally {
        vi.useRealTimers();
      }
    });
  });

  it('focuses the element with data-autofocus on open', () => {
    render(
      <Drawer isOpen onOpenChange={() => {}} label="Details">
        <button type="button">First</button>
        <button type="button" data-autofocus>
          Second
        </button>
      </Drawer>,
    );
    expect(screen.getByRole('button', {name: 'Second'})).toHaveFocus();
  });

  it('renders the side as a data attribute for theming', () => {
    render(
      <Drawer isOpen onOpenChange={() => {}} label="Details" side="start">
        Content
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('data-side', 'start');
  });

  describe('sides', () => {
    it.each(['start', 'end'] as const)(
      'renders side="%s" with the matching data attribute',
      side => {
        render(
          <Drawer isOpen onOpenChange={() => {}} label="Details" side={side}>
            Content
          </Drawer>,
        );
        expect(screen.getByRole('dialog')).toHaveAttribute('data-side', side);
      },
    );
  });

  describe('width', () => {
    it('applies the default 400px inline budget', () => {
      render(
        <Drawer isOpen onOpenChange={() => {}} label="Details">
          Content
        </Drawer>,
      );
      expect(screen.getByRole('dialog').getAttribute('style')).toContain(
        '400px',
      );
    });

    it('accepts a number of pixels', () => {
      render(
        <Drawer isOpen onOpenChange={() => {}} label="Details" width={320}>
          Content
        </Drawer>,
      );
      expect(screen.getByRole('dialog').getAttribute('style')).toContain(
        '320px',
      );
    });

    it('accepts any CSS length string', () => {
      render(
        <Drawer isOpen onOpenChange={() => {}} label="Details" width="50%">
          Content
        </Drawer>,
      );
      expect(screen.getByRole('dialog').getAttribute('style')).toContain('50%');
    });

    it('preserves a 56px page reveal without exceeding the width budget on mobile', () => {
      render(
        <Drawer isOpen onOpenChange={() => {}} label="Details">
          Content
        </Drawer>,
      );
      // Desktop budget and mobile cap are both emitted as custom properties;
      // the media query itself is compiled CSS that jsdom cannot evaluate,
      // so assert both values reach the element.
      const style = screen.getByRole('dialog').getAttribute('style') ?? '';
      expect(style).toContain('400px');
      expect(style).toContain('min(400px, calc(100dvw - 56px))');
    });

    it('covers the full viewport on mobile with isFullWidthOnMobile', () => {
      render(
        <Drawer
          isOpen
          onOpenChange={() => {}}
          label="Details"
          isFullWidthOnMobile>
          Content
        </Drawer>,
      );
      const style = screen.getByRole('dialog').getAttribute('style') ?? '';
      expect(style).toContain('100dvw');
      expect(style).not.toContain('100dvw - 56px');
    });
  });

  describe('close button', () => {
    it('renders a close button by default when modal', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer isOpen onOpenChange={handleOpenChange} label="Details">
          Content
        </Drawer>,
      );
      const closeButton = screen.getByRole('button', {name: 'Close'});
      fireEvent.click(closeButton);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('renders a close button by default when non-modal', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer
          isOpen
          onOpenChange={handleOpenChange}
          label="Details"
          modality="nonModal">
          Content
        </Drawer>,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Close'}));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('hides the close button with hasCloseButton={false}', () => {
      render(
        <Drawer
          isOpen
          onOpenChange={() => {}}
          label="Details"
          hasCloseButton={false}>
          Content
        </Drawer>,
      );
      expect(
        screen.queryByRole('button', {name: 'Close'}),
      ).not.toBeInTheDocument();
    });

    it('keeps the close button when hasCloseButton is explicitly true in non-modal mode', () => {
      render(
        <Drawer
          isOpen
          onOpenChange={() => {}}
          label="Details"
          modality="nonModal"
          hasCloseButton>
          Content
        </Drawer>,
      );
      expect(screen.getByRole('button', {name: 'Close'})).toBeInTheDocument();
    });
  });

  describe('LIFO stacking', () => {
    it('Escape only closes the last-opened drawer', () => {
      const closeFirst = vi.fn();
      const closeSecond = vi.fn();
      render(
        <>
          <Drawer
            isOpen
            onOpenChange={closeFirst}
            label="First"
            modality="nonModal">
            First content
          </Drawer>
          <Drawer
            isOpen
            onOpenChange={closeSecond}
            label="Second"
            modality="nonModal">
            Second content
          </Drawer>
        </>,
      );

      // Escape inside the first (bottom-of-stack) drawer is ignored.
      fireEvent.keyDown(screen.getByRole('dialog', {name: 'First'}), {
        key: 'Escape',
      });
      expect(closeFirst).not.toHaveBeenCalled();
      expect(closeSecond).not.toHaveBeenCalled();

      // Escape inside the last-opened drawer closes it.
      fireEvent.keyDown(screen.getByRole('dialog', {name: 'Second'}), {
        key: 'Escape',
      });
      expect(closeSecond).toHaveBeenCalledWith(false);
      expect(closeFirst).not.toHaveBeenCalled();
    });

    function StackHarness() {
      const [outerOpen, setOuterOpen] = useState(true);
      const [innerOpen, setInnerOpen] = useState(true);
      return (
        <>
          <Drawer
            isOpen={outerOpen}
            onOpenChange={setOuterOpen}
            label="Outer"
            modality="nonModal">
            Outer content
          </Drawer>
          <Drawer
            isOpen={innerOpen}
            onOpenChange={setInnerOpen}
            label="Inner"
            modality="nonModal">
            Inner content
          </Drawer>
        </>
      );
    }

    it('closes stacked drawers innermost-first', () => {
      vi.useFakeTimers();
      try {
        render(<StackHarness />);
        const outer = screen.getByRole('dialog', {name: 'Outer'});
        const inner = screen.getByRole('dialog', {name: 'Inner'});

        fireEvent.keyDown(inner, {key: 'Escape'});
        // Inner unregistered when isOpen flipped — outer is now the top.
        fireEvent.keyDown(outer, {key: 'Escape'});
        act(() => {
          vi.advanceTimersByTime(300);
        });
        expect(inner).not.toHaveAttribute('open');
        expect(outer).not.toHaveAttribute('open');
      } finally {
        vi.useRealTimers();
      }
    });

    it('unregisters unmounted drawers so the remaining one becomes top', () => {
      const closeFirst = vi.fn();
      const {rerender} = render(
        <>
          <Drawer
            isOpen
            onOpenChange={closeFirst}
            label="First"
            modality="nonModal">
            First content
          </Drawer>
          <Drawer
            isOpen
            onOpenChange={() => {}}
            label="Second"
            modality="nonModal">
            Second content
          </Drawer>
        </>,
      );
      rerender(
        <Drawer
          isOpen
          onOpenChange={closeFirst}
          label="First"
          modality="nonModal">
          First content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog', {name: 'First'}), {
        key: 'Escape',
      });
      expect(closeFirst).toHaveBeenCalledWith(false);
    });
  });

  describe('exit anchoring', () => {
    it('slides out to the side it opened from, even if the prop flips', () => {
      // The common consumer shape: `side` is derived from the same state that
      // drives isOpen, so it reverts to the default the moment the drawer
      // closes. The panel must still leave by the edge it came in from.
      function Harness() {
        const [side, setSide] = useState<'start' | 'end' | null>(null);
        return (
          <>
            <button type="button" onClick={() => setSide('start')}>
              Open from start
            </button>
            <Drawer
              isOpen={side != null}
              onOpenChange={isOpen => !isOpen && setSide(null)}
              label="Filters"
              side={side ?? 'end'}>
              Content
            </Drawer>
          </>
        );
      }
      render(<Harness />);
      fireEvent.click(screen.getByRole('button', {name: 'Open from start'}));
      const dialog = screen.getByRole('dialog', {hidden: true});
      expect(dialog).toHaveAttribute('data-side', 'start');

      fireEvent.keyDown(dialog, {key: 'Escape'});
      // Mid-exit: the live prop is now 'end', the anchor must still be 'start'.
      expect(dialog).toHaveAttribute('data-side', 'start');
    });
  });

  describe('bounded to a container', () => {
    function BoundedHarness({
      modality,
      hasScrim,
      isOpen = true,
    }: {
      modality?: 'modal' | 'nonModal';
      hasScrim?: boolean;
      isOpen?: boolean;
    }) {
      const containerRef = useRef<HTMLDivElement>(null);
      const [, force] = useState(0);
      // One re-render so the ref is populated for the portal.
      useEffect(() => {
        force(1);
      }, []);
      // The Drawer is deliberately NOT a JSX child of the container — the
      // point of containerRef is that the panel goes there regardless of
      // where it is declared.
      return (
        <>
          <div
            ref={containerRef}
            data-testid="pane"
            style={{position: 'relative', width: 600, height: 400}}>
            <span>pane content</span>
          </div>
          <Drawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            label="Row details"
            modality={modality}
            hasScrim={hasScrim}
            containerRef={containerRef}>
            Bounded content
          </Drawer>
        </>
      );
    }

    let onOpenChange: (isOpen: boolean) => void;
    beforeEach(() => {
      onOpenChange = vi.fn();
    });

    it('renders the panel inside the container, not the document body', () => {
      render(<BoundedHarness />);
      const pane = screen.getByTestId('pane');
      const dialog = screen.getByRole('dialog');
      expect(pane).toContainElement(dialog);
    });

    it('never uses the top layer, even with a scrim', () => {
      render(<BoundedHarness />);
      expect(HTMLDialogElement.prototype.show).toHaveBeenCalled();
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    });

    it('is not aria-modal — the page behind stays live', () => {
      render(<BoundedHarness />);
      expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal');
    });

    it('renders its own scrim, because ::backdrop needs the top layer', () => {
      const {rerender} = render(<BoundedHarness />);
      const pane = screen.getByTestId('pane');
      const scrim = pane.querySelector('[data-drawer-scrim]');
      expect(scrim).not.toBeNull();

      fireEvent.click(scrim as Element);
      expect(onOpenChange).toHaveBeenCalledWith(false);

      rerender(<BoundedHarness modality="nonModal" />);
      expect(
        screen.getByTestId('pane').querySelector('[data-drawer-scrim]'),
      ).toBeNull();
    });

    it('wraps the panel in a clip box, so the container is never scrolled', () => {
      // overflow:hidden would make the container a scroll container, and the
      // browser's focus scroll-into-view would then scroll it by exactly the
      // entry transform — freezing the panel while the page content flies.
      render(<BoundedHarness />);
      const dialog = screen.getByRole('dialog');
      const clip = dialog.parentElement as HTMLElement;
      expect(window.getComputedStyle(clip).overflow).toBe('clip');
      expect(screen.getByTestId('pane')).toContainElement(clip);
    });

    it('closes on Escape', () => {
      render(<BoundedHarness />);
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('renders nothing before the container ref resolves', () => {
      function Unresolved() {
        const containerRef = useRef<HTMLDivElement>(null);
        return (
          <Drawer
            isOpen
            onOpenChange={() => {}}
            label="Details"
            containerRef={containerRef}>
            Content
          </Drawer>
        );
      }
      render(<Unresolved />);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('pins the clip box to the scrollport, not to the scrolled content', () => {
      // An absolutely positioned child of a scroll container resolves against
      // the SCROLLED padding box, so `inset: 0` alone rides the content: in
      // Chromium, scrolling the pane 0 -> 180px carried the panel from y=44
      // to y=-136. The clip box offsets itself by the scroll position to
      // stay put.
      render(<BoundedHarness />);
      const pane = screen.getByTestId('pane');
      const clip = screen.getByRole('dialog').parentElement as HTMLElement;

      // jsdom does not lay out, so drive the geometry directly — the effect
      // reads exactly these four properties.
      Object.defineProperty(pane, 'clientWidth', {
        value: 600,
        configurable: true,
      });
      Object.defineProperty(pane, 'clientHeight', {
        value: 400,
        configurable: true,
      });
      pane.scrollTop = 180;
      pane.scrollLeft = 0;
      fireEvent.scroll(pane);

      expect(clip.style.transform).toBe('translate(0px, 180px)');
      // Sized to the scrollport, so it covers what the user can see rather
      // than the full scroll height.
      expect(clip.style.blockSize).toBe('400px');
      expect(clip.style.inlineSize).toBe('600px');
    });

    it('makes the container inert when modal, so keyboard matches pointer', () => {
      // Bounded mode's modal enforcement: the container is the area taken out
      // of play. Dimming alone blocked only the pointer, so two reverse Tabs
      // out of the panel landed on the dimmed opener and Enter fired a
      // control no click could reach.
      render(<BoundedHarness />);
      const pane = screen.getByTestId('pane');
      const content = pane.querySelector('span') as HTMLElement;
      expect(content).toHaveAttribute('inert');

      // The panel itself is inside the container and must stay live.
      const clip = screen.getByRole('dialog').parentElement as HTMLElement;
      expect(clip).not.toHaveAttribute('inert');
    });

    it('leaves the container live when non-modal', () => {
      // The negative control: a non-modal bounded drawer leaves its
      // container alone.
      render(<BoundedHarness modality="nonModal" />);
      const content = screen
        .getByTestId('pane')
        .querySelector('span') as HTMLElement;
      expect(content).not.toHaveAttribute('inert');
    });

    it('inerts pane content inserted after the drawer opened', async () => {
      // A pane is live content: a row streams in, a menu opens, a lazy panel
      // resolves. Stamping `inert` once at open leaves every one of those
      // focusable behind a scrim that already blocks the pointer — the same
      // keyboard/pointer split one layer down. Reported on #5550.
      render(<BoundedHarness />);
      const pane = screen.getByTestId('pane');
      expect(pane.querySelector('span')).toHaveAttribute('inert');

      const late = document.createElement('button');
      late.textContent = 'streamed in';
      await act(async () => {
        pane.appendChild(late);
        // MutationObserver delivers on a microtask.
        await Promise.resolve();
      });

      expect(late).toHaveAttribute('inert');
    });

    it('hands back only what it inerted, including the late arrivals', async () => {
      render(<BoundedHarness />);
      const pane = screen.getByTestId('pane');
      // Something the drawer must not touch: already inert for its own
      // reason before the drawer ever opened.
      const preInert = document.createElement('div');
      preInert.setAttribute('inert', '');
      const late = document.createElement('button');
      await act(async () => {
        pane.appendChild(preInert);
        pane.appendChild(late);
        await Promise.resolve();
      });
      expect(late).toHaveAttribute('inert');

      // Closing gives back the drawer's own, and leaves the other alone.
      await act(async () => {
        cleanup();
      });
      expect(late).not.toHaveAttribute('inert');
      expect(preInert).toHaveAttribute('inert');
    });

    it('keeps the container inert through the exit transition', () => {
      const {rerender} = render(<BoundedHarness isOpen />);
      const content = screen
        .getByTestId('pane')
        .querySelector('span') as HTMLElement;
      expect(content).toHaveAttribute('inert');

      rerender(<BoundedHarness isOpen={false} />);
      expect(content).toHaveAttribute('inert');

      fireEvent.transitionEnd(screen.getByRole('dialog', {hidden: true}), {
        propertyName: 'transform',
      });
      expect(content).not.toHaveAttribute('inert');
    });

    describe('two bounded drawers in one container', () => {
      function PairHarness({
        isFrontOpen,
        isBackOpen = true,
        frontModality = 'modal',
      }: {
        isFrontOpen: boolean;
        isBackOpen?: boolean;
        frontModality?: 'modal' | 'nonModal';
      }) {
        const containerRef = useRef<HTMLDivElement>(null);
        const [, force] = useState(0);
        useEffect(() => {
          force(1);
        }, []);
        return (
          <>
            <div
              ref={containerRef}
              data-testid="pane"
              style={{position: 'relative', width: 600, height: 400}}>
              <span>pane content</span>
            </div>
            <Drawer
              isOpen={isBackOpen}
              onOpenChange={onOpenChange}
              label="Back drawer"
              containerRef={containerRef}>
              <button>back control</button>
            </Drawer>
            <Drawer
              isOpen={isFrontOpen}
              onOpenChange={onOpenChange}
              label="Front drawer"
              modality={frontModality}
              containerRef={containerRef}>
              <button>front control</button>
            </Drawer>
          </>
        );
      }

      /** The portal wrapper this drawer owns: its ancestor directly under the host. */
      function clipOf(label: string): HTMLElement {
        const host = screen.getByTestId('pane');
        let node = screen.getByRole('dialog', {name: label}) as HTMLElement;
        while (node.parentElement != null && node.parentElement !== host) {
          node = node.parentElement;
        }
        return node;
      }

      it('leaves the front drawer interactive and inerts the one behind it', () => {
        // Each bounded modal used to inert every child of the host except its
        // own clip wrapper, so two of them inerted each other and the front
        // panel — the one the user is looking at — went dead to pointer and
        // keyboard.
        render(<PairHarness isFrontOpen />);

        expect(clipOf('Front drawer')).not.toHaveAttribute('inert');
        expect(clipOf('Back drawer')).toHaveAttribute('inert');
        // The container behind both is still out of play.
        expect(
          screen.getByTestId('pane').querySelector('span'),
        ).toHaveAttribute('inert');
      });

      it('hands enforcement back to the drawer behind when the front one goes', () => {
        const {rerender} = render(<PairHarness isFrontOpen />);
        expect(clipOf('Back drawer')).toHaveAttribute('inert');

        rerender(<PairHarness isFrontOpen={false} />);
        // Still enforcing mid-exit: the front panel is on screen for the whole
        // slide-out, so the drawer behind it must not go live under it.
        expect(clipOf('Back drawer')).toHaveAttribute('inert');

        fireEvent.transitionEnd(
          screen.getByRole('dialog', {name: 'Front drawer', hidden: true}),
          {propertyName: 'transform'},
        );

        expect(clipOf('Back drawer')).not.toHaveAttribute('inert');
        // And it is enforcing again, rather than merely un-inerted.
        expect(
          screen.getByTestId('pane').querySelector('span'),
        ).toHaveAttribute('inert');
      });

      it('keeps the container blocked when the drawer behind closes first', () => {
        // Enforcement has a single owner, and the cleanup hands back only what
        // that owner inerted. If both drawers enforced, whichever applied
        // first would own the container's children and the second would skip
        // them as already-inert — so the first one closing would release the
        // container while a modal drawer is still open over it.
        const {rerender} = render(<PairHarness isFrontOpen />);
        const paneContent = screen
          .getByTestId('pane')
          .querySelector('span') as HTMLElement;
        expect(paneContent).toHaveAttribute('inert');

        // Watched rather than sampled: a release that is repaired on the next
        // render leaves the end state correct while the container is live for
        // a frame underneath a modal drawer, which is the actual defect.
        const releases: Array<string | null> = [];
        const observer = new MutationObserver(records => {
          for (const record of records) {
            if (record.oldValue !== null) {
              releases.push(record.oldValue);
            }
          }
        });
        observer.observe(paneContent, {
          attributes: true,
          attributeFilter: ['inert'],
          attributeOldValue: true,
        });

        act(() => {
          rerender(<PairHarness isFrontOpen isBackOpen={false} />);
          fireEvent.transitionEnd(
            screen.getByRole('dialog', {name: 'Back drawer', hidden: true}),
            {propertyName: 'transform'},
          );
        });
        observer.takeRecords().forEach(record => {
          if (record.oldValue !== null) {
            releases.push(record.oldValue);
          }
        });
        observer.disconnect();

        expect(releases).toEqual([]);
        expect(paneContent).toHaveAttribute('inert');
        expect(clipOf('Front drawer')).not.toHaveAttribute('inert');
      });

      it('does not inert a non-modal drawer opened on top of a modal one', () => {
        // A modal drawer puts what is BEHIND it out of play. A drawer opened
        // in front of it is not behind it, whatever its own modality.
        render(<PairHarness isFrontOpen frontModality="nonModal" />);

        expect(clipOf('Front drawer')).not.toHaveAttribute('inert');
        expect(
          screen.getByTestId('pane').querySelector('span'),
        ).toHaveAttribute('inert');
      });
    });

    it('does not reach into a second container with its own drawer', () => {
      // Enforcement is scoped to the host, so two bounded drawers in
      // different containers are independent — neither inerts the other.
      function TwoPanes() {
        const firstRef = useRef<HTMLDivElement>(null);
        const secondRef = useRef<HTMLDivElement>(null);
        const [, force] = useState(0);
        useEffect(() => {
          force(1);
        }, []);
        return (
          <>
            <div
              ref={firstRef}
              data-testid="pane-one"
              style={{position: 'relative'}}>
              <span>one content</span>
            </div>
            <div
              ref={secondRef}
              data-testid="pane-two"
              style={{position: 'relative'}}>
              <span>two content</span>
            </div>
            <Drawer
              isOpen
              onOpenChange={onOpenChange}
              label="First drawer"
              containerRef={firstRef}>
              First
            </Drawer>
            <Drawer
              isOpen
              onOpenChange={onOpenChange}
              label="Second drawer"
              containerRef={secondRef}>
              Second
            </Drawer>
          </>
        );
      }
      render(<TwoPanes />);

      for (const testId of ['pane-one', 'pane-two']) {
        const host = screen.getByTestId(testId);
        expect(host.querySelector('span')).toHaveAttribute('inert');
        const dialog = within(host).getByRole('dialog');
        let clip = dialog as HTMLElement;
        while (clip.parentElement != null && clip.parentElement !== host) {
          clip = clip.parentElement;
        }
        expect(clip).not.toHaveAttribute('inert');
      }
    });

    it('follows the container when the element behind the ref is replaced', async () => {
      // The ref object never changes identity, so a dep array on it cannot
      // see this. Swapping the element used to leave the drawer `isOpen`
      // with no dialog anywhere.
      function SwappingHarness() {
        const containerRef = useRef<HTMLDivElement>(null);
        const [which, setWhich] = useState<'a' | 'b'>('a');
        const [, force] = useState(0);
        useEffect(() => {
          force(1);
        }, []);
        return (
          <>
            {/* Keyed, so React unmounts one and mounts the other rather
                than reconciling a single div and swapping its attributes —
                without the key there is no swap to survive. */}
            <div
              key={which}
              ref={containerRef}
              data-testid={`pane-${which}`}
              style={{position: 'relative'}}
            />
            <button onClick={() => setWhich('b')}>swap</button>
            <Drawer
              isOpen
              onOpenChange={() => {}}
              label="Row details"
              containerRef={containerRef}>
              Bounded content
            </Drawer>
          </>
        );
      }
      render(<SwappingHarness />);
      expect(screen.getByTestId('pane-a')).toContainElement(
        screen.getByRole('dialog'),
      );

      await act(async () => {
        fireEvent.click(screen.getByText('swap'));
      });

      // Still open, and now living in the new host.
      const dialog = screen.getByRole('dialog');
      expect(screen.getByTestId('pane-b')).toContainElement(dialog);
    });

    it('resolves no container while closed, so an unopened drawer costs nothing', () => {
      // Resolving the target is a state write, and doing it on mount cost
      // every closed bounded Drawer on the page a second commit.
      const commits: string[] = [];
      function CountingHarness() {
        const containerRef = useRef<HTMLDivElement>(null);
        return (
          <>
            <div
              ref={containerRef}
              data-testid="pane"
              style={{position: 'relative'}}
            />
            <Profiler
              id="drawer"
              onRender={(_id, phase) => commits.push(phase)}>
              <Drawer
                isOpen={false}
                onOpenChange={() => {}}
                label="Row details"
                containerRef={containerRef}>
                Bounded content
              </Drawer>
            </Profiler>
          </>
        );
      }
      render(<CountingHarness />);
      expect(screen.queryByRole('dialog')).toBeNull();
      // One mount, and no update behind it. Resolving the target on mount
      // used to add an 'update' commit to every closed bounded Drawer.
      expect(commits).toEqual(['mount']);
    });

    it('defaults scrim paint to match modality', () => {
      const {rerender} = render(<BoundedHarness />);
      const pane = screen.getByTestId('pane');
      expect(pane.querySelector('[data-drawer-scrim]')).not.toBeNull();
      expect(pane.querySelector('span')).toHaveAttribute('inert');

      rerender(<BoundedHarness modality="nonModal" />);
      expect(pane.querySelector('[data-drawer-scrim]')).toBeNull();
      expect(pane.querySelector('span')).not.toHaveAttribute('inert');
    });

    it('can paint a scrim without enforcing modality', () => {
      render(<BoundedHarness modality="nonModal" hasScrim />);
      const pane = screen.getByTestId('pane');
      const scrim = pane.querySelector('[data-drawer-scrim]') as HTMLElement;

      expect(scrim).not.toBeNull();
      expect(window.getComputedStyle(scrim).pointerEvents).toBe('none');
      expect(pane.querySelector('span')).not.toHaveAttribute('inert');

      fireEvent.click(scrim);
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('can enforce modality without painting a scrim', () => {
      render(<BoundedHarness hasScrim={false} />);
      const pane = screen.getByTestId('pane');

      expect(pane.querySelector('[data-drawer-scrim]')).toBeNull();
      expect(pane.querySelector('span')).toHaveAttribute('inert');
    });

    it('means the same thing bounded, by a different mechanism', () => {
      // A bounded modal cannot use the top layer, so it is not aria-modal
      // and does not lock body scroll — but the area behind it is still out
      // of play, which is what the word promises.
      render(<BoundedHarness />);
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal');
      expect(screen.getByTestId('pane').querySelector('span')).toHaveAttribute(
        'inert',
      );
    });
  });

  describe('modality and scrim paint', () => {
    it('is modal with a scrim by default', () => {
      render(
        <Drawer isOpen onOpenChange={() => {}} label="Details">
          Content
        </Drawer>,
      );
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('can enforce viewport modality without painting a scrim', () => {
      const {container} = render(
        <Drawer isOpen onOpenChange={() => {}} label="Details" hasScrim={false}>
          Content
        </Drawer>,
      );
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
      expect(container.querySelector('[data-drawer-scrim]')).toBeNull();
    });

    it('leaves the page interactive when modality is nonModal', () => {
      render(
        <Drawer
          isOpen
          onOpenChange={() => {}}
          label="Details"
          modality="nonModal">
          Content
        </Drawer>,
      );
      expect(HTMLDialogElement.prototype.show).toHaveBeenCalled();
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal');
    });

    it('can paint a viewport scrim without enforcing modality', () => {
      const {container} = render(
        <Drawer
          isOpen
          onOpenChange={() => {}}
          label="Details"
          modality="nonModal"
          hasScrim>
          Content
        </Drawer>,
      );
      const scrim = container.querySelector(
        '[data-drawer-scrim]',
      ) as HTMLElement;
      expect(HTMLDialogElement.prototype.show).toHaveBeenCalled();
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
      expect(scrim).not.toBeNull();
      expect(window.getComputedStyle(scrim).position).toBe('fixed');
      expect(window.getComputedStyle(scrim).pointerEvents).toBe('none');
    });

    it('reopens the native dialog when modality changes while open', () => {
      const {rerender} = render(
        <Drawer
          isOpen
          onOpenChange={() => {}}
          label="Details"
          modality="nonModal">
          Content
        </Drawer>,
      );
      vi.mocked(HTMLDialogElement.prototype.close).mockClear();
      vi.mocked(HTMLDialogElement.prototype.showModal).mockClear();

      rerender(
        <Drawer isOpen onOpenChange={() => {}} label="Details" modality="modal">
          Content
        </Drawer>,
      );

      expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');

      vi.mocked(HTMLDialogElement.prototype.close).mockClear();
      vi.mocked(HTMLDialogElement.prototype.show).mockClear();
      rerender(
        <Drawer
          isOpen
          onOpenChange={() => {}}
          label="Details"
          modality="nonModal">
          Content
        </Drawer>,
      );
      expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
      expect(HTMLDialogElement.prototype.show).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal');
    });
  });

  describe('container padding isolation', () => {
    it('resets container padding custom properties on the root dialog element', () => {
      render(
        <Drawer isOpen onOpenChange={() => {}} label="Details">
          Content
        </Drawer>,
      );
      const dialog = screen.getByRole('dialog');
      const computed = window.getComputedStyle(dialog);
      expect(
        computed.getPropertyValue('--container-padding-inline-start'),
      ).toBe('0px');
      expect(computed.getPropertyValue('--container-padding-inline-end')).toBe(
        '0px',
      );
      expect(computed.getPropertyValue('--container-padding-block-start')).toBe(
        '0px',
      );
      expect(computed.getPropertyValue('--container-padding-block-end')).toBe(
        '0px',
      );
    });
  });
});
