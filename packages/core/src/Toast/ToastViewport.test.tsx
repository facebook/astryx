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
import type {ToastOptions} from './types';

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
    // The region only exists once the viewport is holding a toast.
    act(() => {
      fireEvent.click(screen.getByText('Trigger'));
    });
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
});

describe('small-screen fit and safe areas (#5470)', () => {
  function viewportEl(): HTMLElement {
    // The viewport is the fixed container the toast wrappers live in.
    const wrapper = document.querySelector('[data-toast-id]');
    return (wrapper?.parentElement ??
      document.querySelector<HTMLElement>('[role="region"]'))!;
  }

  it('reserves the device safe area on every edge', () => {
    renderViewport(<ShowToastButton options={INFO_A} triggerLabel="Show" />);
    act(() => {
      fireEvent.click(screen.getByText('Show'));
    });
    const computed = window.getComputedStyle(viewportEl());
    // StyleX emits the block longhands physically (padding-top/bottom); the
    // block axis needs no direction handling, so that is equivalent.
    expect(computed.paddingTop).toContain('safe-area-inset-top');
    expect(computed.paddingBottom).toContain('safe-area-inset-bottom');
    expect(computed.paddingInlineStart).toContain('safe-area-inset-left');
    expect(computed.paddingInlineEnd).toContain('safe-area-inset-right');
    // The design gutter is still the floor on a device with no insets.
    expect(computed.paddingInlineStart).toContain('--spacing-4');
    // Gutters have to count against the width, not add to it.
    expect(computed.boxSizing).toBe('border-box');
  });

  it('swaps which physical inset each inline edge reads under RTL', () => {
    renderViewport(<ShowToastButton options={INFO_A} triggerLabel="Show" />);
    act(() => {
      fireEvent.click(screen.getByText('Show'));
    });
    // env() insets are physical while the padding is logical, so the RTL rule
    // has to point inline-start at the RIGHT inset (and vice versa) or the
    // notch gutter lands on the wrong edge.
    const rules = [...document.styleSheets]
      .flatMap(sheet => {
        try {
          return [...sheet.cssRules].map(r => r.cssText);
        } catch {
          return [];
        }
      })
      .filter(text => text.includes('[dir="rtl"]'));
    expect(
      rules.some(
        text =>
          text.includes('padding-inline-start') &&
          text.includes('safe-area-inset-right'),
      ),
    ).toBe(true);
    expect(
      rules.some(
        text =>
          text.includes('padding-inline-end') &&
          text.includes('safe-area-inset-left'),
      ),
    ).toBe(true);
  });

  it('sizes the toast against its container instead of a hardcoded 100vw gutter', () => {
    renderViewport(<ShowToastButton options={INFO_A} triggerLabel="Show" />);
    act(() => {
      fireEvent.click(screen.getByText('Show'));
    });
    const toast = document.querySelector('[data-toast-id] [role="status"]')!;
    const computed = window.getComputedStyle(toast);
    expect(computed.maxWidth).toBe('100%');
    expect(computed.maxWidth).not.toContain('vw');
  });
});

describe('long and translated message content (#5470)', () => {
  const LONG_URL: ToastOptions = {
    body: 'https://example.com/reports/exports/aVeryLongUnbreakableIdentifier',
  };

  it('breaks a word with no break opportunity instead of overflowing', () => {
    renderViewport(<ShowToastButton options={LONG_URL} triggerLabel="Show" />);
    act(() => {
      fireEvent.click(screen.getByText('Show'));
    });
    const body = screen.getByText(LONG_URL.body as string);
    expect(window.getComputedStyle(body).overflowWrap).toBe('anywhere');
  });

  it('holds the trailing controls to one line box so they stay level with the first line', () => {
    renderViewport(<ShowToastButton options={INFO_A} triggerLabel="Show" />);
    act(() => {
      fireEvent.click(screen.getByText('Show'));
    });
    const dismiss = screen.getByRole('button', {name: 'Dismiss notification'});
    const endContent = dismiss.parentElement!;
    const computed = window.getComputedStyle(endContent);
    // One body line box — controls taller than a line overflow it centered,
    // which lands them on the first line however far the body wraps.
    expect(computed.height).toBe(
      'calc(var(--text-body-size) * var(--text-body-leading))',
    );
    expect(computed.alignItems).toBe('center');
  });
});

describe('stack gap and collapse (#5470)', () => {
  it('separates stacked toasts by 8px, and drops the gap below the last one', () => {
    renderViewport(
      <>
        <ShowToastButton options={INFO_A} triggerLabel="Show A" />
        <ShowToastButton options={INFO_B} triggerLabel="Show B" />
      </>,
    );
    act(() => {
      fireEvent.click(screen.getByText('Show A'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Show B'));
    });
    const wrappers = document.querySelectorAll<HTMLElement>('[data-toast-id]');
    expect(wrappers).toHaveLength(2);
    expect(window.getComputedStyle(wrappers[0]).paddingBottom).toBe(
      'var(--spacing-2)',
    );
  });

  it('collapses a dismissed toast rather than removing it outright', () => {
    renderViewport(<ShowToastButton options={INFO_A} triggerLabel="Show" />);
    act(() => {
      fireEvent.click(screen.getByText('Show'));
    });
    const wrapper = document.querySelector<HTMLElement>('[data-toast-id]')!;
    const id = wrapper.getAttribute('data-toast-id')!;
    act(() => {
      fireEvent.click(
        screen.getByRole('button', {name: 'Dismiss notification'}),
      );
    });
    // Still mounted, animating its row down to nothing — the stack closes the
    // space instead of jumping by the toast's height.
    const dismissing = document.querySelector<HTMLElement>(
      `[data-toast-id="${id}"]`,
    )!;
    const computed = window.getComputedStyle(dismissing);
    expect(computed.gridTemplateRows).toBe('0fr');
    expect(computed.paddingBottom).toBe('0px');
    expect(computed.transitionProperty).toContain('grid-template-rows');
    act(() => {
      completeExit(id);
    });
    expect(document.querySelector(`[data-toast-id="${id}"]`)).toBeNull();
  });

  it('collapses a toast pushed past maxVisible instead of blinking it out', () => {
    render(
      <ToastViewport isTopLayer={false} maxVisible={2}>
        <ShowToastButton options={INFO_A} triggerLabel="Show" />
      </ToastViewport>,
    );
    for (let i = 0; i < 3; i++) {
      act(() => {
        fireEvent.click(screen.getByText('Show'));
      });
    }
    // Three toasts, a window of two: the displaced one stays mounted for one
    // collapse, and is inert while it has no room.
    const wrappers = [
      ...document.querySelectorAll<HTMLElement>('[data-toast-id]'),
    ];
    expect(wrappers).toHaveLength(3);
    expect(wrappers[0]).toHaveAttribute('inert');
    expect(wrappers[1]).not.toHaveAttribute('inert');
    expect(window.getComputedStyle(wrappers[0]).gridTemplateRows).toBe('0fr');
    // Its controls are out of reach while it is collapsed.
    expect(
      within(wrappers[0]).getByRole('button', {
        name: 'Dismiss notification',
        hidden: true,
      }),
    ).toBeInTheDocument();

    // Room opens up: it comes back by expanding, not by popping in.
    const lastId = wrappers[2].getAttribute('data-toast-id')!;
    act(() => {
      fireEvent.click(
        within(wrappers[2]).getByRole('button', {name: 'Dismiss notification'}),
      );
    });
    act(() => {
      completeExit(lastId);
    });
    const requeued = document.querySelector<HTMLElement>('[data-toast-id]')!;
    expect(requeued).not.toHaveAttribute('inert');
    expect(window.getComputedStyle(requeued).gridTemplateRows).toBe('1fr');
  });

  it('does not burn a queued toast\u2019s auto-hide timer while it is unseen', () => {
    vi.useFakeTimers();
    try {
      const onHide = vi.fn();
      render(
        <ToastViewport isTopLayer={false} maxVisible={1}>
          <ShowToastButton
            options={{body: 'Queued', autoHideDuration: 3000, onHide}}
            triggerLabel="Show queued"
          />
          <ShowToastButton options={INFO_B} triggerLabel="Show B" />
        </ToastViewport>,
      );
      act(() => {
        fireEvent.click(screen.getByText('Show queued'));
      });
      act(() => {
        fireEvent.click(screen.getByText('Show B'));
      });
      // The first toast is now queued behind the second. Its timer must not
      // run down while it is collapsed and out of sight.
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(onHide).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('entry direction follows the pinned edge (#5470)', () => {
  it.each([
    ['bottomEnd', 'var(--spacing-2)'],
    ['bottomStart', 'var(--spacing-2)'],
    ['topEnd', 'calc(var(--spacing-2) * -1)'],
    ['topStart', 'calc(var(--spacing-2) * -1)'],
  ] as const)('slides %s toasts from their own edge', (position, expected) => {
    render(
      <ToastViewport isTopLayer={false} position={position}>
        <ShowToastButton options={INFO_A} triggerLabel="Show" />
      </ToastViewport>,
    );
    act(() => {
      fireEvent.click(screen.getByText('Show'));
    });
    const viewport = screen.getByRole('region', {name: 'Notifications'});
    // A top-pinned stack drops in from above (negative), a bottom-pinned one
    // rises from below (positive). Toast reads this for both enter and exit.
    expect(
      window.getComputedStyle(viewport).getPropertyValue('--_toast-slide-y'),
    ).toBe(expected);
  });
});

describe('the notifications landmark (#5470)', () => {
  it('is absent while the viewport holds no toasts', () => {
    renderViewport(<ShowToastButton options={INFO_A} triggerLabel="Show" />);
    // Nothing has been shown: an empty viewport must not add a permanent,
    // empty "Notifications" landmark to the page.
    expect(
      screen.queryByRole('region', {name: 'Notifications'}),
    ).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText('Show'));
    });
    expect(
      screen.getByRole('region', {name: 'Notifications'}),
    ).toBeInTheDocument();

    const id = document
      .querySelector('[data-toast-id]')!
      .getAttribute('data-toast-id')!;
    act(() => {
      fireEvent.click(
        screen.getByRole('button', {name: 'Dismiss notification'}),
      );
    });
    act(() => {
      completeExit(id);
    });
    expect(
      screen.queryByRole('region', {name: 'Notifications'}),
    ).not.toBeInTheDocument();
  });

  it('is not duplicated by a nested viewport', () => {
    render(
      <ToastViewport isTopLayer={false}>
        <ToastViewport isTopLayer={false}>
          <ShowToastButton options={INFO_A} triggerLabel="Show" />
        </ToastViewport>
      </ToastViewport>,
    );
    act(() => {
      fireEvent.click(screen.getByText('Show'));
    });
    // The inner viewport shadows the outer one's context, so the outer can
    // never hold a toast — and an empty viewport is no longer a landmark.
    expect(screen.getAllByRole('region', {name: 'Notifications'})).toHaveLength(
      1,
    );
  });
});
