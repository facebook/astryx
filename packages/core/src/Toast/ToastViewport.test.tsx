// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ToastViewport.test.tsx
 * @input Uses vitest, @testing-library/react, ToastViewport + useToast
 * @output Unit tests for toast keyboard reach, focus management, and
 *   screen-reader announcements
 * @position Testing; validates ToastViewport.tsx + Toast.tsx focus behavior and
 *   the announce-at-dispatch flow through the singleton live regions
 *
 * SYNC: When ToastViewport.tsx / Toast.tsx focus handling or the toast
 *   announcement flow changes, update these tests
 */

import {describe, it, expect, vi, beforeAll, afterEach} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
  within,
} from '@testing-library/react';
import React from 'react';
import {type AnnounceFn, __resetLiveRegionsForTest} from '../hooks/useAnnounce';
import {ToastViewport} from './ToastViewport';
import {useToast} from './useToast';
import type {ToastOptions, ToastRenderProps} from './types';
import {defineTheme} from '../theme/defineTheme';
import {generateThemeCSS} from '../theme/generateThemeRules';

// Spy on the announcement sink so tests can prove a toast is announced exactly
// once. The mock wraps the real useAnnounce, so the singleton live regions are
// still populated (the region-content assertions below depend on it) while
// every call is also recorded on announceSpy.
const {announceSpy} = vi.hoisted(() => ({announceSpy: vi.fn()}));
vi.mock('../hooks/useAnnounce', async importActual => {
  const actual = await importActual<{
    useAnnounce: () => AnnounceFn;
    __resetLiveRegionsForTest: () => void;
  }>();
  const {useCallback} = await import('react');
  return {
    ...actual,
    useAnnounce: (): AnnounceFn => {
      const realAnnounce = actual.useAnnounce();
      return useCallback<AnnounceFn>(
        (message, politeness) => {
          announceSpy(message, politeness);
          realAnnounce(message, politeness);
        },
        [realAnnounce],
      );
    },
  };
});

// Popover API is not implemented in jsdom.
beforeAll(() => {
  if (typeof HTMLElement.prototype.showPopover === 'undefined') {
    HTMLElement.prototype.showPopover = vi.fn();
    HTMLElement.prototype.hidePopover = vi.fn();
  }
});

// Toast text is mirrored into the singleton live regions, which outlive each
// render — reset them so text from one test never leaks into the next.
afterEach(() => {
  __resetLiveRegionsForTest();
  announceSpy.mockClear();
});

// Module-level constant default props (avoids unstable-default-props lint).
const EMPTY_OPTIONS: ToastOptions = {body: 'placeholder'};

function ShowToastButton({
  options = EMPTY_OPTIONS,
  triggerLabel = 'Trigger',
}: {
  options?: ToastOptions;
  triggerLabel?: string;
}) {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast(options)}>
      {triggerLabel}
    </button>
  );
}

const INFO_A: ToastOptions = {body: 'Toast A'};
const INFO_B: ToastOptions = {body: 'Toast B'};
const AUTO_TOAST: ToastOptions = {body: 'Auto toast', autoHideDuration: 3000};

function renderViewport(children: React.ReactNode) {
  return render(<ToastViewport isTopLayer={false}>{children}</ToastViewport>);
}

// Fire the transition-end that ToastViewport listens for to unmount an
// exiting toast (jsdom does not run CSS transitions).
function completeExit(toastId: string) {
  const node = document.querySelector<HTMLElement>(
    `[data-toast-id="${toastId}"]`,
  );
  if (node) {
    fireEvent.transitionEnd(node, {propertyName: 'grid-template-rows'});
  }
}

describe('ToastViewport keyboard reach + focus', () => {
  it('F6 moves focus into the newest toast', () => {
    renderViewport(
      <ShowToastButton options={INFO_A} triggerLabel="Trigger A" />,
    );
    const trigger = screen.getByText('Trigger A');
    trigger.focus();
    act(() => {
      fireEvent.click(trigger);
    });

    expect(screen.getByText('Toast A')).toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);

    act(() => {
      fireEvent.keyDown(document, {key: 'F6'});
    });

    // Focus lands on the dismiss button of the newest toast.
    const dismiss = screen.getByRole('button', {name: 'Dismiss notification'});
    expect(document.activeElement).toBe(dismiss);
  });

  it('dismissing a focused toast moves focus to a remaining toast, not body', () => {
    renderViewport(
      <>
        <ShowToastButton options={INFO_A} triggerLabel="Trigger A" />
        <ShowToastButton options={INFO_B} triggerLabel="Trigger B" />
      </>,
    );
    act(() => {
      fireEvent.click(screen.getByText('Trigger A'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Trigger B'));
    });

    const dismissButtons = screen.getAllByRole('button', {
      name: 'Dismiss notification',
    });
    expect(dismissButtons).toHaveLength(2);

    // Focus the first toast's dismiss button, then dismiss it.
    const firstToast = document.querySelectorAll('[data-toast-id]')[0];
    const firstToastId = firstToast.getAttribute('data-toast-id')!;
    const firstDismiss = firstToast.querySelector<HTMLElement>(
      'button[aria-label="Dismiss notification"]',
    )!;
    firstDismiss.focus();
    expect(document.activeElement).toBe(firstDismiss);

    act(() => {
      fireEvent.click(firstDismiss);
    });
    act(() => {
      completeExit(firstToastId);
    });

    // Focus must NOT drop to <body>; it moves to the remaining toast.
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement?.getAttribute('aria-label')).toBe(
      'Dismiss notification',
    );
  });

  it('dismissing the last focused toast restores the previously-focused element', () => {
    renderViewport(
      <ShowToastButton options={INFO_A} triggerLabel="Trigger A" />,
    );
    const trigger = screen.getByText('Trigger A');
    trigger.focus();
    act(() => {
      fireEvent.click(trigger);
    });

    // F6 into the toast, remembering the trigger as the prior focus.
    act(() => {
      fireEvent.keyDown(document, {key: 'F6'});
    });
    const dismiss = screen.getByRole('button', {name: 'Dismiss notification'});
    expect(document.activeElement).toBe(dismiss);

    const toastId = document
      .querySelector('[data-toast-id]')!
      .getAttribute('data-toast-id')!;

    act(() => {
      fireEvent.click(dismiss);
    });
    act(() => {
      completeExit(toastId);
    });

    // No toasts left — focus returns to the element focused before F6.
    expect(document.activeElement).toBe(trigger);
  });
});

describe('Toast blur timer pause', () => {
  it('pauses the auto-hide timer while the window is blurred', () => {
    vi.useFakeTimers();
    try {
      renderViewport(
        <ShowToastButton options={AUTO_TOAST} triggerLabel="Trigger Auto" />,
      );
      act(() => {
        fireEvent.click(screen.getByText('Trigger Auto'));
      });
      // Scope to the viewport: the toast text is also mirrored into the
      // singleton live region, which lives outside the notifications region.
      const viewport = screen.getByRole('region', {name: 'Notifications'});
      expect(within(viewport).getByText('Auto toast')).toBeInTheDocument();

      // Window loses focus — timer should pause.
      act(() => {
        window.dispatchEvent(new Event('blur'));
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      // Still present because the timer was paused while blurred.
      expect(within(viewport).getByText('Auto toast')).toBeInTheDocument();

      // Window regains focus — timer resumes and the toast dismisses.
      act(() => {
        window.dispatchEvent(new Event('focus'));
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      const toastId = document
        .querySelector('[data-toast-id]')
        ?.getAttribute('data-toast-id');
      if (toastId) {
        act(() => {
          completeExit(toastId);
        });
      }
      expect(
        within(viewport).queryByText('Auto toast'),
      ).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('ToastViewport region ARIA', () => {
  it('exposes the notifications region without a prohibited aria-modal', () => {
    renderViewport(<ShowToastButton />);
    const region = screen.getByRole('region', {name: 'Notifications'});
    // aria-modal is only valid on role="dialog"/"alertdialog"; a region must
    // not declare it (axe: aria-allowed-attr).
    expect(region).not.toHaveAttribute('aria-modal');
  });
});

describe('toast announcements via singleton live regions', () => {
  function politeRegion(): HTMLElement | null {
    return document.querySelector('[data-astryx-live-region="polite"]');
  }
  function assertiveRegion(): HTMLElement | null {
    return document.querySelector('[data-astryx-live-region="assertive"]');
  }

  const RICH_INFO: ToastOptions = {
    body: (
      <>
        <strong>Update ready</strong>
        <div>Restart to apply</div>
      </>
    ),
  };
  const ERROR_TOAST: ToastOptions = {body: 'Upload failed', type: 'error'};
  const SAVING_V1: ToastOptions = {uniqueID: 'save', body: 'Saving changes'};
  const SAVING_V2: ToastOptions = {uniqueID: 'save', body: 'Changes saved'};
  const IGNORE_KEPT: ToastOptions = {
    uniqueID: 'dup',
    collisionBehavior: 'ignore',
    body: 'Kept',
  };
  const IGNORE_DROPPED: ToastOptions = {
    uniqueID: 'dup',
    collisionBehavior: 'ignore',
    body: 'Dropped',
  };

  it('announces an info toast politely with its flattened text content', async () => {
    renderViewport(<ShowToastButton options={RICH_INFO} triggerLabel="Show" />);
    act(() => {
      fireEvent.click(screen.getByText('Show'));
    });
    // Announced synchronously at dispatch, exactly once.
    expect(announceSpy).toHaveBeenCalledTimes(1);
    expect(announceSpy).toHaveBeenCalledWith(
      'Update ready Restart to apply',
      'polite',
    );
    // The flattened text reaches the polite singleton region (the sink).
    await waitFor(() => {
      expect(politeRegion()).toHaveTextContent('Update ready Restart to apply');
    });
    // Status toasts never touch the assertive region.
    expect(assertiveRegion()).toHaveTextContent('');
  });

  it('announces an error toast assertively', async () => {
    renderViewport(
      <ShowToastButton options={ERROR_TOAST} triggerLabel="Show" />,
    );
    act(() => {
      fireEvent.click(screen.getByText('Show'));
    });
    expect(announceSpy).toHaveBeenCalledTimes(1);
    expect(announceSpy).toHaveBeenCalledWith('Upload failed', 'assertive');
    await waitFor(() => {
      expect(assertiveRegion()).toHaveTextContent('Upload failed');
    });
    expect(politeRegion()).toHaveTextContent('');
  });

  it('announces exactly once at dispatch, even under StrictMode', () => {
    render(
      <React.StrictMode>
        <ToastViewport isTopLayer={false}>
          <ShowToastButton options={INFO_A} triggerLabel="Show" />
        </ToastViewport>
      </React.StrictMode>,
    );
    act(() => {
      fireEvent.click(screen.getByText('Show'));
    });
    // The announcement lives in the imperative dispatch path (addToast), not a
    // render effect, so StrictMode's double render and double-invoked state
    // updater cannot announce the same toast twice.
    expect(announceSpy).toHaveBeenCalledTimes(1);
    expect(announceSpy).toHaveBeenCalledWith('Toast A', 'polite');
  });

  it('re-announces a uniqueID toast when its content is overwritten', async () => {
    renderViewport(
      <>
        <ShowToastButton options={SAVING_V1} triggerLabel="Show v1" />
        <ShowToastButton options={SAVING_V2} triggerLabel="Show v2" />
      </>,
    );
    act(() => {
      fireEvent.click(screen.getByText('Show v1'));
    });
    expect(announceSpy).toHaveBeenCalledTimes(1);
    expect(announceSpy).toHaveBeenLastCalledWith('Saving changes', 'polite');
    // Overwriting via uniqueID replaces the toast in place — the new content is
    // a fresh dispatch and must be announced again.
    act(() => {
      fireEvent.click(screen.getByText('Show v2'));
    });
    expect(announceSpy).toHaveBeenCalledTimes(2);
    expect(announceSpy).toHaveBeenLastCalledWith('Changes saved', 'polite');
    await waitFor(() => {
      expect(politeRegion()).toHaveTextContent('Changes saved');
    });
    // Still a single toast on screen — overwritten in place, not stacked.
    const viewport = screen.getByRole('region', {name: 'Notifications'});
    expect(
      within(viewport).queryAllByText(/Saving changes|Changes saved/),
    ).toHaveLength(1);
  });

  it('does not re-announce an unchanged toast when an unrelated render occurs', () => {
    renderViewport(
      <>
        <ShowToastButton options={INFO_A} triggerLabel="Show A" />
        <ShowToastButton options={ERROR_TOAST} triggerLabel="Show B" />
      </>,
    );
    act(() => {
      fireEvent.click(screen.getByText('Show A'));
    });
    expect(announceSpy).toHaveBeenCalledTimes(1);
    // A second toast arriving re-renders the viewport with a new toast list.
    // Toast A is not re-dispatched, so it must not be announced again — only
    // the newly dispatched toast produces a call.
    act(() => {
      fireEvent.click(screen.getByText('Show B'));
    });
    expect(announceSpy).toHaveBeenCalledTimes(2);
    expect(announceSpy).toHaveBeenNthCalledWith(1, 'Toast A', 'polite');
    expect(announceSpy).toHaveBeenNthCalledWith(
      2,
      'Upload failed',
      'assertive',
    );
  });

  it('does not announce a toast whose uniqueID collision is ignored', () => {
    renderViewport(
      <>
        <ShowToastButton options={IGNORE_KEPT} triggerLabel="Show 1" />
        <ShowToastButton options={IGNORE_DROPPED} triggerLabel="Show 2" />
      </>,
    );
    act(() => {
      fireEvent.click(screen.getByText('Show 1'));
    });
    expect(announceSpy).toHaveBeenCalledTimes(1);
    expect(announceSpy).toHaveBeenLastCalledWith('Kept', 'polite');
    // The colliding toast is suppressed (collisionBehavior: 'ignore'), so it is
    // neither shown nor announced.
    act(() => {
      fireEvent.click(screen.getByText('Show 2'));
    });
    expect(announceSpy).toHaveBeenCalledTimes(1);
    const viewport = screen.getByRole('region', {name: 'Notifications'});
    expect(within(viewport).getByText('Kept')).toBeInTheDocument();
    expect(within(viewport).queryByText('Dropped')).not.toBeInTheDocument();
  });
});

describe('toast timer lifecycle (#3589)', () => {
  it('fires onHide exactly once when dismissed twice during the exit window', () => {
    const onHide = vi.fn();
    renderViewport(
      <ShowToastButton options={{body: 'Once', onHide}} triggerLabel="Show" />,
    );
    act(() => {
      fireEvent.click(screen.getByText('Show'));
    });
    const dismiss = screen.getByRole('button', {name: 'Dismiss notification'});
    act(() => {
      fireEvent.click(dismiss);
    });
    // The toast stays mounted during its exit transition; a second click
    // lands on the same still-mounted button.
    act(() => {
      fireEvent.click(dismiss);
    });
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('keeps a window-blur pause alive when another toast arrives', () => {
    vi.useFakeTimers();
    try {
      const onHide = vi.fn();
      renderViewport(
        <>
          <ShowToastButton
            options={{body: 'Paused', autoHideDuration: 3000, onHide}}
            triggerLabel="Show A"
          />
          <ShowToastButton options={INFO_B} triggerLabel="Show B" />
        </>,
      );
      act(() => {
        fireEvent.click(screen.getByText('Show A'));
      });
      act(() => {
        fireEvent.blur(window);
      });
      // A second toast arriving re-renders the viewport; the paused timer
      // must not silently restart.
      act(() => {
        fireEvent.click(screen.getByText('Show B'));
      });
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(onHide).not.toHaveBeenCalled();
      // Focus returns: the remaining time resumes and completes normally.
      act(() => {
        fireEvent.focus(window);
      });
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(onHide).toHaveBeenCalledTimes(1);
      expect(onHide).toHaveBeenCalledWith('auto');
    } finally {
      vi.useRealTimers();
    }
  });

  // `renderToast` replaces the whole visible surface. What matters to a
  // consumer is the handover: Astryx must stop drawing its own card (and its
  // close button) so nothing has to be hidden with CSS, must route EVERY
  // toast through the renderer including ones a library raised, and must
  // hand over the pieces the surface needs to be complete.
  describe('renderToast', () => {
    function renderWithRenderer(
      children: React.ReactNode,
      renderToast: (t: ToastRenderProps) => React.ReactNode,
    ) {
      return render(
        <ToastViewport isTopLayer={false} renderToast={renderToast}>
          {children}
        </ToastViewport>,
      );
    }

    it('replaces the built-in surface, leaving no dismiss button to hide', () => {
      // The reason this API exists: hiding Astryx's close with CSS also hits
      // any button in endContent, and misses toasts a library raised.
      renderWithRenderer(
        <ShowToastButton options={INFO_A} triggerLabel="Show" />,
        toast => <div>{toast.body}</div>,
      );
      act(() => {
        fireEvent.click(screen.getByText('Show'));
      });
      expect(screen.getByText('Toast A')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Dismiss notification'}),
      ).not.toBeInTheDocument();
    });

    it('renders a toast raised by code that knows nothing about the surface', () => {
      // ShowToastButton calls the plain useToast() — it is the stand-in for a
      // shared library. Its toast still gets the app's surface.
      renderWithRenderer(
        <ShowToastButton options={INFO_A} triggerLabel="Show" />,
        toast => <div data-testid="custom-surface">{toast.body}</div>,
      );
      act(() => {
        fireEvent.click(screen.getByText('Show'));
      });
      expect(screen.getByTestId('custom-surface')).toHaveTextContent('Toast A');
    });

    it('hands endContent to the surface rather than dropping it', () => {
      // The trailing slot belongs to Astryx's card, which is gone. Passing it
      // through is what keeps an Undo button working across the switch.
      renderWithRenderer(
        <ShowToastButton
          options={{
            body: 'Deleted',
            endContent: <button type="button">Undo</button>,
          }}
          triggerLabel="Show"
        />,
        toast => (
          <div data-testid="custom-surface">
            {toast.body}
            {toast.endContent}
          </div>
        ),
      );
      act(() => {
        fireEvent.click(screen.getByText('Show'));
      });
      // Inside the custom surface specifically — Astryx's own card renders
      // endContent too, so asserting mere presence would pass either way.
      expect(
        within(screen.getByTestId('custom-surface')).getByRole('button', {
          name: 'Undo',
        }),
      ).toBeInTheDocument();
    });

    it('gives the surface a dismiss that removes its own toast', () => {
      // The surface owns the dismiss control now, so it needs a working one —
      // and it is built before showToast() has returned anything to close.
      const onHide = vi.fn();
      renderWithRenderer(
        <ShowToastButton
          options={{body: 'Closable', onHide}}
          triggerLabel="Show"
        />,
        toast => (
          <button type="button" onClick={toast.dismiss}>
            Close it
          </button>
        ),
      );
      act(() => {
        fireEvent.click(screen.getByText('Show'));
      });
      act(() => {
        fireEvent.click(screen.getByText('Close it'));
      });
      expect(onHide).toHaveBeenCalledWith('manual');
    });

    it('still auto-dismisses, and says so before it happens', () => {
      // Astryx keeps owning the timer; the surface is told, so it can render a
      // progress affordance or suppress its own close.
      vi.useFakeTimers();
      try {
        const seen: {isAutoHide: boolean; autoHideDuration: number}[] = [];
        const onHide = vi.fn();
        renderWithRenderer(
          <ShowToastButton
            options={{body: 'Fleeting', autoHideDuration: 3000, onHide}}
            triggerLabel="Show"
          />,
          toast => {
            seen.push({
              isAutoHide: toast.isAutoHide,
              autoHideDuration: toast.autoHideDuration,
            });
            return <div>{toast.body}</div>;
          },
        );
        act(() => {
          fireEvent.click(screen.getByText('Show'));
        });
        expect(seen[0]).toEqual({isAutoHide: true, autoHideDuration: 3000});
        act(() => {
          vi.advanceTimersByTime(3000);
        });
        expect(onHide).toHaveBeenCalledWith('auto');
      } finally {
        vi.useRealTimers();
      }
    });

    it('keeps announcing through the live region', () => {
      // The announcement is the viewport's job, not the card's — a custom
      // surface must not cost a screen-reader user the notification.
      renderWithRenderer(
        <ShowToastButton options={INFO_A} triggerLabel="Show" />,
        toast => <div>{toast.body}</div>,
      );
      act(() => {
        fireEvent.click(screen.getByText('Show'));
      });
      expect(announceSpy).toHaveBeenCalledWith('Toast A', 'polite');
    });
  });

  // The two chrome targets. A renderer replaces the toast's surface but not
  // the stack around it — the gap between toasts, the clip box, the entry
  // transition — and until now that chrome was reachable only through
  // structural selectors like `[data-toast-id] > div`. These assert the theme
  // pipeline routes an override to the class the viewport actually renders;
  // that the classes are on the right elements is covered in a browser.
  describe('chrome theming targets', () => {
    const cssFor = (
      components: Parameters<typeof defineTheme>[0]['components'],
    ) =>
      generateThemeCSS(defineTheme({name: 'toast-chrome', components}))
        .component;

    it('routes a viewport override to the stack container', () => {
      expect(cssFor({'toast-viewport': {base: {padding: '24px'}}})).toContain(
        '.astryx-toast-viewport {',
      );
    });

    it('scopes a viewport override to one position', () => {
      // Asserting the whole selector: the same rule on the bare target would
      // re-pad all four corners, which is the bug a position variant avoids.
      expect(
        cssFor({'toast-viewport': {'position:topEnd': {padding: '24px'}}}),
      ).toContain('.astryx-toast-viewport.topEnd {');
    });

    it('routes a stacked-item override to each toast wrapper', () => {
      expect(
        cssFor({'toast-item': {base: {paddingBlockEnd: '16px'}}}),
      ).toContain('.astryx-toast-item {');
    });
  });
});
