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

import {
  describe,
  it,
  expect,
  expectTypeOf,
  vi,
  beforeAll,
  afterEach,
} from 'vitest';
import {
  cleanup,
  render,
  screen,
  fireEvent,
  act,
  waitFor,
  within,
} from '@testing-library/react';
import React from 'react';
import {readFileSync} from 'node:fs';
import {type AnnounceFn, __resetLiveRegionsForTest} from '../hooks/useAnnounce';
import {Button} from '../Button';
import {Toast, type ToastProps} from './Toast';
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
  vi.unstubAllGlobals();
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
const LONG_TOAST_BODY =
  'Arbeitsbereichsbenachrichtigungseinstellungen gespeichert';

function renderViewport(children: React.ReactNode) {
  return render(<ToastViewport isTopLayer={false}>{children}</ToastViewport>);
}

function getToastWrapperByText(text: string): HTMLElement {
  const visualToast = screen.getByText(text).closest('[data-type]');
  if (!(visualToast instanceof HTMLElement)) {
    throw new Error(`Toast visual for ${text} not found`);
  }
  const wrapper = visualToast.closest('[data-toast-id]');
  if (!(wrapper instanceof HTMLElement)) {
    throw new Error(`Toast wrapper for ${text} not found`);
  }
  return wrapper;
}

function getVisualToastByText(text: string): HTMLElement {
  const visualToast = screen.getByText(text).closest('[data-type]');
  if (!(visualToast instanceof HTMLElement)) {
    throw new Error(`Toast visual for ${text} not found`);
  }
  return visualToast;
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

describe('Toast responsive layout', () => {
  it('keeps placement on ToastViewport rather than exposing a non-positioning Toast prop', () => {
    expectTypeOf<ToastProps>().not.toHaveProperty('position');
    expectTypeOf<React.ComponentProps<typeof ToastViewport>>().toHaveProperty(
      'position',
    );
  });

  it('keeps real trailing controls on the first line while long body text wraps', () => {
    renderViewport(
      <ShowToastButton
        options={{
          body: LONG_TOAST_BODY,
          isAutoHide: false,
          endContent: (
            <Button
              label="Änderungen wiederherstellen"
              variant="secondary"
              size="lg"
            />
          ),
        }}
      />,
    );
    act(() => {
      fireEvent.click(screen.getByText('Trigger'));
    });

    const viewport = screen.getByRole('region', {name: 'Notifications'});
    const body = within(viewport).getByText(LONG_TOAST_BODY);
    const toast = body.closest('[data-type]') as HTMLElement;
    const mediaWrapper = toast.firstElementChild as HTMLElement;
    const layoutRow = mediaWrapper.firstElementChild as HTMLElement;
    const endArea = body.nextElementSibling as HTMLElement;
    const actionControl = endArea.firstElementChild as HTMLElement;
    const dismissControl = within(endArea).getByRole('button', {
      name: 'Dismiss notification',
    });

    expect(getComputedStyle(layoutRow).flexWrap).toBe('nowrap');
    expect(getComputedStyle(layoutRow).alignItems).toBe('flex-start');
    expect(getComputedStyle(body).minWidth).toBe('0');
    expect(getComputedStyle(body).overflowWrap).toBe('anywhere');
    expect(getComputedStyle(endArea).alignItems).toBe('center');
    expect(getComputedStyle(endArea).height).toBe(
      'calc(var(--text-body-size) * var(--text-body-leading))',
    );
    expect(getComputedStyle(actionControl).height).toBe(
      'var(--size-element-lg)',
    );
    expect(getComputedStyle(dismissControl).height).toBe(
      'var(--size-element-sm)',
    );
  });

  it('uses the viewport as the inline constraint for edge placements', () => {
    renderViewport(<ShowToastButton options={INFO_A} />);
    act(() => {
      fireEvent.click(screen.getByText('Trigger'));
    });

    const viewport = screen.getByRole('region', {name: 'Notifications'});

    const style = getComputedStyle(viewport);
    const viewportSource = readFileSync(
      'packages/core/src/Toast/ToastViewport.tsx',
      'utf8',
    );
    expect(viewportSource).not.toContain('100lvh - 100dvh');
    expect(style.boxSizing).toBe('border-box');
    expect(style.width).not.toBe('100%');
    expect(style.paddingInlineEnd).not.toBe('0px');
    expect(style.insetInlineStart).toBe('0');
    expect(style.insetInlineEnd).toBe('0');
  });

  it('preserves custom start and end insets in LTR and RTL without forcing full width', () => {
    const renderWithDirection = (direction: 'ltr' | 'rtl') =>
      render(
        <div dir={direction}>
          <ToastViewport
            isTopLayer={false}
            inset={{bottom: 24, start: 24, end: 40}}>
            <ShowToastButton options={INFO_A} />
          </ToastViewport>
        </div>,
      );

    renderWithDirection('ltr');
    act(() => {
      fireEvent.click(screen.getByText('Trigger'));
    });
    let viewport = screen.getByRole('region', {name: 'Notifications'});
    expect(viewport.style.bottom).toBe('24px');
    expect(viewport.style.insetInlineStart).toBe('24px');
    expect(viewport.style.insetInlineEnd).toBe('40px');
    expect(getComputedStyle(viewport).width).not.toBe('100%');

    cleanup();
    renderWithDirection('rtl');
    act(() => {
      fireEvent.click(screen.getByText('Trigger'));
    });
    viewport = screen.getByRole('region', {name: 'Notifications'});
    expect(viewport.style.bottom).toBe('24px');
    expect(viewport.style.insetInlineStart).toBe('24px');
    expect(viewport.style.insetInlineEnd).toBe('40px');
    expect(getComputedStyle(viewport).width).not.toBe('100%');
  });
});

describe('ToastViewport placement', () => {
  function renderPlacement({
    position,
    triggerLabel = 'Trigger',
    body = 'Placed',
  }: {
    position?: React.ComponentProps<typeof ToastViewport>['position'];
    triggerLabel?: string;
    body?: string;
  } = {}) {
    const result = render(
      <ToastViewport isTopLayer={false} position={position}>
        <ShowToastButton
          options={{body, isAutoHide: false}}
          triggerLabel={triggerLabel}
        />
      </ToastViewport>,
    );
    act(() => {
      fireEvent.click(screen.getByText(triggerLabel));
    });
    return {
      ...result,
      viewport: screen.getByRole('region', {name: 'Notifications'}),
    };
  }

  it('defaults to bottomEnd with an end-aligned full-inline viewport', () => {
    const {viewport} = renderPlacement();

    expect(getComputedStyle(viewport).bottom).toBe('0px');
    expect(getComputedStyle(viewport).alignItems).toBe('flex-end');
    expect(getComputedStyle(viewport).width).not.toBe('100%');
  });

  it('maps explicit top and bottom placements to their configured edge', () => {
    const top = renderPlacement({position: 'topEnd'});
    expect(getComputedStyle(top.viewport).top).toBe('0px');
    expect(getComputedStyle(top.viewport).alignItems).toBe('flex-end');
    expect(getComputedStyle(top.viewport).flexDirection).toBe('column-reverse');
    top.unmount();

    const bottom = renderPlacement({
      position: 'bottomStart',
      triggerLabel: 'Bottom trigger',
      body: 'Bottom start',
    });
    expect(getComputedStyle(bottom.viewport).bottom).toBe('0px');
    expect(getComputedStyle(bottom.viewport).alignItems).toBe('flex-start');
    bottom.unmount();
  });
});

it('keeps newest toasts nearest the configured edge in wide stacks', () => {
  render(
    <>
      <ToastViewport isTopLayer={false} position="bottomEnd" maxVisible={3}>
        <ShowToastButton
          options={{body: 'Bottom first', isAutoHide: false}}
          triggerLabel="Bottom first"
        />
        <ShowToastButton
          options={{body: 'Bottom second', isAutoHide: false}}
          triggerLabel="Bottom second"
        />
        <ShowToastButton
          options={{body: 'Bottom third', isAutoHide: false}}
          triggerLabel="Bottom third"
        />
      </ToastViewport>
      <ToastViewport isTopLayer={false} position="topEnd" maxVisible={3}>
        <ShowToastButton
          options={{body: 'Top first', isAutoHide: false}}
          triggerLabel="Top first"
        />
        <ShowToastButton
          options={{body: 'Top second', isAutoHide: false}}
          triggerLabel="Top second"
        />
        <ShowToastButton
          options={{body: 'Top third', isAutoHide: false}}
          triggerLabel="Top third"
        />
      </ToastViewport>
    </>,
  );
  for (const label of [
    'Bottom first',
    'Bottom second',
    'Bottom third',
    'Top first',
    'Top second',
    'Top third',
  ]) {
    act(() => {
      fireEvent.click(screen.getByText(label));
    });
  }

  const [bottom, top] = screen.getAllByRole('region', {
    name: 'Notifications',
  });
  expect(getComputedStyle(bottom).flexDirection).toBe('column');
  expect(
    within(bottom)
      .getAllByText(/Bottom/)
      .map(el => el.textContent),
  ).toEqual(['Bottom first', 'Bottom second', 'Bottom third']);
  expect(getComputedStyle(top).flexDirection).toBe('column-reverse');
  expect(
    within(top)
      .getAllByText(/Top/)
      .map(el => el.textContent),
  ).toEqual(['Top first', 'Top second', 'Top third']);
});

describe('ToastViewport visible limit', () => {
  function renderMany(maxVisible?: number) {
    render(
      <ToastViewport isTopLayer={false} maxVisible={maxVisible}>
        <ShowToastButton
          options={{body: 'One', isAutoHide: false}}
          triggerLabel="One"
        />
        <ShowToastButton
          options={{body: 'Two', isAutoHide: false}}
          triggerLabel="Two"
        />
        <ShowToastButton
          options={{body: 'Three', isAutoHide: false}}
          triggerLabel="Three"
        />
      </ToastViewport>,
    );
    act(() => {
      fireEvent.click(screen.getByText('One'));
      fireEvent.click(screen.getByText('Two'));
      fireEvent.click(screen.getByText('Three'));
    });
    return screen.getByRole('region', {name: 'Notifications'});
  }

  it('keeps the five-toast default and supports an explicit one-visible cap', () => {
    let viewport = renderMany();
    expect(
      within(viewport).getAllByRole('button', {name: 'Dismiss notification'}),
    ).toHaveLength(3);

    cleanup();
    viewport = renderMany(1);
    expect(
      within(viewport).getAllByRole('button', {name: 'Dismiss notification'}),
    ).toHaveLength(1);
    expect(within(viewport).getByText('Three')).toBeInTheDocument();
  });
});

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

describe('Toast native motion contract', () => {
  function renderMotionToast(
    position: React.ComponentProps<typeof ToastViewport>['position'],
    body = `Motion ${position}`,
    wrapper: (children: React.ReactNode) => React.ReactElement = children => (
      <>{children}</>
    ),
  ) {
    const result = render(
      wrapper(
        <ToastViewport isTopLayer={false} position={position} maxVisible={3}>
          <ShowToastButton
            options={{body, isAutoHide: false}}
            triggerLabel={`Show ${position}`}
          />
        </ToastViewport>,
      ),
    );
    act(() => {
      fireEvent.click(screen.getByText(`Show ${position}`));
    });
    return {
      ...result,
      visualToast: getVisualToastByText(body),
      wrapper: getToastWrapperByText(body),
    };
  }

  const normalizeCssList = (value: string): string =>
    value
      .split(',')
      .map(part => part.trim())
      .join(', ');

  const normalizeCssFunction = (value: string): string =>
    value.replace(/,\s*/g, ', ');

  it('uses tokenized transform and wrapper timing, with reduced motion kept eventful', () => {
    const {visualToast, wrapper} = renderMotionToast('bottomEnd');
    const toastStyle = getComputedStyle(visualToast);
    const wrapperStyle = getComputedStyle(wrapper);

    expect(normalizeCssFunction(toastStyle.transform)).toBe('translateY(0)');
    expect(normalizeCssList(toastStyle.transitionProperty)).toBe(
      'opacity, transform',
    );
    expect(toastStyle.transitionDuration).toBe('var(--duration-fast)');
    expect(toastStyle.transitionTimingFunction).toBe('var(--ease-standard)');
    expect(normalizeCssList(wrapperStyle.transitionProperty)).toBe(
      'grid-template-rows, padding',
    );
    expect(wrapperStyle.transitionDuration).toBe('var(--duration-fast)');
    expect(wrapperStyle.transitionTimingFunction).toBe('var(--ease-standard)');
    expect(wrapperStyle.width).toBe('100%');
    expect(wrapperStyle.maxWidth).toBe('400px');
    expect(wrapperStyle.minWidth).toBe('0');
    expect(
      getComputedStyle(wrapper.firstElementChild as HTMLElement).minHeight,
    ).toBe('0');
    expect(
      getComputedStyle(wrapper.firstElementChild as HTMLElement).overflow,
    ).toBe('hidden');
  });

  it('keeps reduced motion transitions eventful for exit cleanup', () => {
    const toastSource = readFileSync(
      'packages/core/src/Toast/Toast.tsx',
      'utf8',
    );
    const viewportSource = readFileSync(
      'packages/core/src/Toast/ToastViewport.tsx',
      'utf8',
    );

    expect(toastSource).toContain(
      "'@media (prefers-reduced-motion: reduce)': '0.01ms'",
    );
    expect(viewportSource).toContain(
      "'@media (prefers-reduced-motion: reduce)': '0.01ms'",
    );
  });

  it('slides from the top or bottom edge without adding corner or scale motion', () => {
    const bottom = renderMotionToast('bottomEnd');
    expect(
      getComputedStyle(bottom.wrapper).getPropertyValue('--_toast-slide-y'),
    ).toBe('var(--spacing-2)');
    bottom.unmount();

    const top = renderMotionToast('topStart');
    expect(
      getComputedStyle(top.wrapper).getPropertyValue('--_toast-slide-y'),
    ).toBe('calc(-1 * var(--spacing-2))');
    top.unmount();

    const toastSource = readFileSync(
      'packages/core/src/Toast/Toast.tsx',
      'utf8',
    );
    expect(toastSource).not.toContain('scale(0.98)');
    expect(toastSource).not.toContain('transformOrigin');
  });

  it('uses an 8px inter-Toast gap without adding space at the viewport edge', () => {
    renderViewport(
      <>
        <ShowToastButton options={INFO_A} triggerLabel="Show A" />
        <ShowToastButton options={INFO_B} triggerLabel="Show B" />
      </>,
    );
    act(() => {
      fireEvent.click(screen.getByText('Show A'));
      fireEvent.click(screen.getByText('Show B'));
    });
    const viewport = screen.getByRole('region', {name: 'Notifications'});
    const wrappers = viewport.querySelectorAll<HTMLElement>('[data-toast-id]');

    expect(getComputedStyle(wrappers[0]).paddingBottom).toBe(
      'var(--spacing-2)',
    );
    expect(getComputedStyle(wrappers[1]).paddingBottom).toBe('0px');
    expect(
      normalizeCssFunction(getComputedStyle(viewport).paddingInlineEnd),
    ).toBe('max(var(--spacing-4), env(safe-area-inset-right, 0px))');

    cleanup();
    render(
      <ToastViewport isTopLayer={false} position="topEnd">
        <ShowToastButton options={INFO_A} triggerLabel="Top A" />
        <ShowToastButton options={INFO_B} triggerLabel="Top B" />
      </ToastViewport>,
    );
    act(() => {
      fireEvent.click(screen.getByText('Top A'));
      fireEvent.click(screen.getByText('Top B'));
    });
    const topWrappers = screen
      .getByRole('region', {name: 'Notifications'})
      .querySelectorAll<HTMLElement>('[data-toast-id]');
    expect(getComputedStyle(topWrappers[0]).paddingBottom).toBe('0px');
    expect(getComputedStyle(topWrappers[1]).paddingBottom).toBe(
      'var(--spacing-2)',
    );
  });

  it('collapses a dismissed Toast before unmounting it', () => {
    const {wrapper} = renderMotionToast('bottomEnd');
    const id = wrapper.getAttribute('data-toast-id')!;
    act(() => {
      fireEvent.click(
        within(wrapper).getByRole('button', {name: 'Dismiss notification'}),
      );
    });

    expect(wrapper).toBeInTheDocument();
    expect(getComputedStyle(wrapper).gridTemplateRows).toBe('0fr');
    expect(getComputedStyle(wrapper).paddingBottom).toBe('0px');
    act(() => {
      completeExit(id);
    });
    expect(document.querySelector(`[data-toast-id="${id}"]`)).toBeNull();
  });
});

describe('Toast live-region fallback semantics', () => {
  it('keeps standalone info Toast content in a polite status region', () => {
    render(
      <Toast
        type="info"
        body="Saved"
        isAutoHide={false}
        autoHideDuration={5000}
        onDismiss={() => {}}
      />,
    );

    const visualToast = screen.getByText('Saved').closest('[data-type]');
    expect(visualToast).toHaveAttribute('role', 'status');
    expect(visualToast).toHaveAttribute('aria-live', 'polite');
    expect(visualToast).toHaveAttribute('aria-atomic', 'true');
  });

  it('keeps standalone error Toast content in an assertive alert region', () => {
    render(
      <Toast
        type="error"
        body="Upload failed"
        isAutoHide={false}
        autoHideDuration={5000}
        onDismiss={() => {}}
      />,
    );

    const visualToast = screen
      .getByText('Upload failed')
      .closest('[data-type]');
    expect(visualToast).toHaveAttribute('role', 'alert');
    expect(visualToast).toHaveAttribute('aria-live', 'assertive');
    expect(visualToast).toHaveAttribute('aria-atomic', 'true');
  });
});

describe('ToastViewport region ARIA', () => {
  it('does not expose an empty notifications landmark', () => {
    renderViewport(<ShowToastButton />);
    expect(
      screen.queryByRole('region', {name: 'Notifications'}),
    ).not.toBeInTheDocument();
  });

  it('exposes the notifications region without a prohibited aria-modal when a toast is visible', () => {
    renderViewport(<ShowToastButton />);
    act(() => {
      fireEvent.click(screen.getByText('Trigger'));
    });
    const region = screen.getByRole('region', {name: 'Notifications'});
    expect(region).not.toHaveAttribute('aria-modal');
  });

  it('does not duplicate the landmark for nested viewports', () => {
    render(
      <ToastViewport isTopLayer={false}>
        <ToastViewport isTopLayer={false}>
          <ShowToastButton options={INFO_A} />
        </ToastViewport>
      </ToastViewport>,
    );
    act(() => {
      fireEvent.click(screen.getByText('Trigger'));
    });
    expect(screen.getAllByRole('region', {name: 'Notifications'})).toHaveLength(
      1,
    );
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
    // Announced once when the toast is dispatched.
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
    // Announcement happens in the event-driven dispatch path, so StrictMode's
    // double render cannot announce the same toast twice.
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
