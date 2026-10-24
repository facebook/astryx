// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useRefreshControl.test.tsx
 * @input vitest (jsdom), useRefreshControl on a minimal structure (content,
 *   indicator, spinner), touch events dispatched on its content, stand-ins
 *   for a touch screen (matchMedia) and for iOS WebKit (CSS.supports)
 * @output Covers the pull (UIKit's mapping, trigger with the finger down,
 *   release onto the inset or back to the top), the end, controlled and
 *   programmatic refreshes, the announcement, the iOS-only gate (a mouse, and
 *   a touch screen that is not iOS, leave the pull and the top edge to the
 *   browser), the disabled state, the scroll-lock stand-down and the
 *   top-edge overscroll policy on the page and on a scroll container
 * @position Testing; colocated with useRefreshControl.ts. Motion itself is
 *   checked in a real browser (the RefreshControl interaction spec and its
 *   storyboards)
 */

import type {ReactNode} from 'react';
import {act, render, screen, waitFor} from '@testing-library/react';
import {useScrollLock} from '@astryxdesign/core/hooks';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  useRefreshControl,
  type UseRefreshControlOptions,
} from './useRefreshControl';

/** The structure the hook drives: pulled content, an indicator, a spinner. */
function Refreshable({
  children,
  'data-testid': testId,
  ...options
}: UseRefreshControlOptions & {children: ReactNode; 'data-testid'?: string}) {
  const control = useRefreshControl(options);
  return (
    <div
      data-testid={testId}
      ref={control.contentRef}
      aria-busy={control.isRefreshing || undefined}>
      <div ref={control.indicatorRef} aria-hidden>
        <span ref={control.spinnerRef} />
      </div>
      {children}
    </div>
  );
}

const COARSE = /\(\s*pointer\s*:\s*coarse\s*\)/;
let originalMatchMedia: typeof window.matchMedia;
let originalInnerHeight: number;
const originalCss = Object.getOwnPropertyDescriptor(window, 'CSS');

/** iOS WebKit, as the touch idiom reads it: `CSS.supports` answers its query. */
function useIos(isIos: boolean): void {
  Object.defineProperty(window, 'CSS', {
    configurable: true,
    writable: true,
    value: {
      escape: (value: string) => value,
      supports: (query: string) =>
        isIos && query === '(-webkit-touch-callout: none)',
    },
  });
}

function useTouchScreen(isTouch: boolean): void {
  window.matchMedia = (query: string) =>
    ({
      matches: isTouch && COARSE.test(query),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

let clock = 0;
function touch(
  type: string,
  target: EventTarget,
  y: number,
  isLift = false,
): void {
  clock += 16;
  const event = new Event(type, {bubbles: true, cancelable: true});
  const entry = {identifier: 1, clientX: 100, clientY: y, target};
  Object.defineProperty(event, 'changedTouches', {value: [entry]});
  Object.defineProperty(event, 'touches', {value: isLift ? [] : [entry]});
  Object.defineProperty(event, 'timeStamp', {value: clock});
  act(() => {
    target.dispatchEvent(event);
  });
}

/** A one-finger drag from y 100 down by each step in turn. */
function pull(target: EventTarget, steps: number[], lift = true): void {
  let y = 100;
  touch('touchstart', target, y);
  for (const step of steps) {
    y += step;
    touch('touchmove', target, y);
  }
  if (lift) {
    touch('touchend', target, y, true);
  }
}

function translateY(element: HTMLElement): number {
  const value = element.style.getPropertyValue('translate');
  if (value === '' || value === 'none') {
    return 0;
  }
  const parts = value.trim().split(/\s+/);
  return parseFloat(parts[1] ?? '0');
}

/**
 * A host whose glyph wrapper holds the drawing's two spoke layers, as
 * RefreshControl's does.
 */
function LayeredRefreshable({
  children,
  ...options
}: UseRefreshControlOptions & {children: ReactNode}) {
  const control = useRefreshControl(options);
  return (
    <div
      data-testid="refresh"
      ref={control.contentRef}
      aria-busy={control.isRefreshing || undefined}>
      <div ref={control.indicatorRef} aria-hidden>
        <span ref={control.spinnerRef}>
          <span data-testid="reveal-layer" ref={control.revealLayerRef} />
          <span data-testid="spin-layer" ref={control.spinLayerRef} />
        </span>
      </div>
      <button type="button" onClick={control.refresh}>
        Refresh
      </button>
      {children}
    </div>
  );
}

/** The two spoke layers' opacities, as the hook last wrote them. */
function layers(): {reveal: string; spin: string} {
  return {
    reveal: screen.getByTestId('reveal-layer').style.opacity,
    spin: screen.getByTestId('spin-layer').style.opacity,
  };
}

function content(): HTMLElement {
  return screen.getByTestId('refresh');
}

describe('useRefreshControl', () => {
  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    originalInnerHeight = window.innerHeight;
    useTouchScreen(true);
    useIos(true);
    // The page as tall as the scroll view UIKit's frames were measured on:
    // the trigger distance is then UIKit's floor, 73 px of overscroll.
    Object.defineProperty(window, 'innerHeight', {
      value: 334,
      configurable: true,
    });
    clock = 0;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    if (originalCss) {
      Object.defineProperty(window, 'CSS', originalCss);
    } else {
      Reflect.deleteProperty(window, 'CSS');
    }
    Object.defineProperty(window, 'innerHeight', {
      value: originalInnerHeight,
      configurable: true,
    });
    document.documentElement.style.overscrollBehaviorY = '';
  });

  it('pulls the content as UIKit does: one to one past the hysteresis, up to the height', () => {
    render(
      <Refreshable data-testid="refresh" onRefresh={() => {}}>
        <p>Inbox</p>
      </Refreshable>,
    );
    pull(content(), [12, 8, 20], false);
    // 40 px of finger travel, 10 of them the pan's hysteresis.
    expect(translateY(content())).toBeCloseTo(30, 5);
    touch('touchmove', content(), 170);
    expect(translateY(content())).toBeCloseTo(60, 5);
    touch('touchend', content(), 170, true);
  });

  it('triggers with the finger still down, then settles onto the refreshing inset', async () => {
    const onRefresh = vi.fn(() => new Promise<void>(() => {}));
    render(
      <Refreshable data-testid="refresh" onRefresh={onRefresh}>
        <p>Inbox</p>
      </Refreshable>,
    );
    pull(content(), [20, 20, 20, 20], false);
    expect(onRefresh).not.toHaveBeenCalled();
    // 105 px of travel: past the trigger (73 px of overscroll).
    touch('touchmove', content(), 205);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(content()).toHaveAttribute('aria-busy', 'true');
    expect(translateY(content())).toBeGreaterThan(74);
    expect(translateY(content())).toBeLessThan(95);
    // The next frame snaps to one to one with the finger, as UIKit does.
    touch('touchmove', content(), 210);
    expect(translateY(content())).toBeCloseTo(100, 5);
    touch('touchend', content(), 210, true);
    // jsdom has no compositor: the settle lands on its target at once.
    expect(translateY(content())).toBeCloseTo(60, 5);
    await waitFor(() => expect(document.body).toHaveTextContent('Refreshing'));
  });

  it('leaves the content’s compositor layer to the animator: promoted once while it moves, given back at rest', async () => {
    let resolve: () => void = () => {};
    render(
      <Refreshable
        data-testid="refresh"
        onRefresh={() =>
          new Promise<void>(done => {
            resolve = done;
          })
        }>
        <p>Inbox</p>
      </Refreshable>,
    );
    const willChange = () => content().style.willChange;
    // A tap at the top moves nothing, so nothing is promoted.
    touch('touchstart', content(), 100);
    touch('touchend', content(), 100, true);
    expect(willChange()).toBe('');
    // A pull is promoted from its first move, once, and keeps the layer
    // through the refresh until the end has run.
    pull(content(), [30, 30, 30, 30]);
    expect(willChange()).toBe('translate');
    await act(async () => {
      resolve();
    });
    await waitFor(() => expect(willChange()).toBe(''), {timeout: 3000});
  });

  it('turns the spinner at the trigger, never the indicator holding it', () => {
    render(
      <Refreshable
        data-testid="refresh"
        onRefresh={() => new Promise<void>(() => {})}>
        <p>Inbox</p>
      </Refreshable>,
    );
    pull(content(), [30, 30, 30, 30]);
    const indicator = content().firstElementChild as HTMLElement;
    const spinner = indicator.firstElementChild as HTMLElement;
    expect(spinner.style.getPropertyValue('rotate')).not.toBe('');
    expect(indicator.style.getPropertyValue('rotate')).toBe('');
  });

  it('turns text selection off on the content while a finger pulls, then restores it', () => {
    render(
      <Refreshable data-testid="refresh" onRefresh={() => {}}>
        <p>Inbox</p>
      </Refreshable>,
    );
    pull(content(), [20, 20], false);
    expect(content().style.getPropertyValue('user-select')).toBe('none');
    touch('touchend', content(), 140, true);
    expect(content().style.getPropertyValue('user-select')).toBe('');
  });

  it('settles back to the top without refreshing below the trigger', () => {
    const onRefresh = vi.fn();
    render(
      <Refreshable data-testid="refresh" onRefresh={onRefresh}>
        <p>Inbox</p>
      </Refreshable>,
    );
    pull(content(), [20, 20, 20, 10]);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(translateY(content())).toBe(0);
    expect(content()).not.toHaveAttribute('aria-busy');
  });

  it('ends when the promise from onRefresh settles, and removes the inset', async () => {
    let resolve: () => void = () => {};
    const onRefresh = vi.fn(
      () =>
        new Promise<void>(done => {
          resolve = done;
        }),
    );
    render(
      <Refreshable data-testid="refresh" onRefresh={onRefresh}>
        <p>Inbox</p>
      </Refreshable>,
    );
    pull(content(), [30, 30, 30, 30]);
    expect(content()).toHaveAttribute('aria-busy', 'true');
    await act(async () => {
      resolve();
    });
    expect(content()).not.toHaveAttribute('aria-busy');
    expect(translateY(content())).toBe(0);
  });

  it('ends after a rejected refresh as well', async () => {
    let reject: () => void = () => {};
    render(
      <Refreshable
        data-testid="refresh"
        onRefresh={() =>
          new Promise<void>((_, fail) => {
            reject = () => fail(new Error('offline'));
          })
        }>
        <p>Inbox</p>
      </Refreshable>,
    );
    pull(content(), [30, 30, 30, 30]);
    await act(async () => {
      reject();
    });
    expect(content()).not.toHaveAttribute('aria-busy');
  });

  it('follows a controlled isRefreshing without calling onRefresh for it', () => {
    const onRefresh = vi.fn();
    const {rerender} = render(
      <Refreshable
        data-testid="refresh"
        onRefresh={onRefresh}
        isRefreshing={false}>
        <p>Inbox</p>
      </Refreshable>,
    );
    rerender(
      <Refreshable data-testid="refresh" onRefresh={onRefresh} isRefreshing>
        <p>Inbox</p>
      </Refreshable>,
    );
    expect(content()).toHaveAttribute('aria-busy', 'true');
    expect(onRefresh).not.toHaveBeenCalled();
    rerender(
      <Refreshable
        data-testid="refresh"
        onRefresh={onRefresh}
        isRefreshing={false}>
        <p>Inbox</p>
      </Refreshable>,
    );
    expect(content()).not.toHaveAttribute('aria-busy');
  });

  it('keeps a controlled refresh running until the app ends it', () => {
    const onRefresh = vi.fn();
    render(
      <Refreshable
        data-testid="refresh"
        onRefresh={onRefresh}
        isRefreshing={false}>
        <p>Inbox</p>
      </Refreshable>,
    );
    pull(content(), [30, 30, 30, 30]);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(content()).toHaveAttribute('aria-busy', 'true');
  });

  it('does not pull under a mouse or trackpad', () => {
    useTouchScreen(false);
    const onRefresh = vi.fn();
    render(
      <Refreshable data-testid="refresh" onRefresh={onRefresh}>
        <p>Inbox</p>
      </Refreshable>,
    );
    pull(content(), [30, 30, 30, 30]);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(translateY(content())).toBe(0);
    expect(document.documentElement.style.overscrollBehaviorY).toBe('');
  });

  it('off iOS (an Android phone) leaves the pull and the top edge to the browser, and a refresh shows nothing', async () => {
    useIos(false);
    document.documentElement.style.overscrollBehaviorY = 'auto';
    const onRefresh = vi.fn();
    const {rerender} = render(
      <Refreshable
        data-testid="refresh"
        onRefresh={onRefresh}
        isRefreshing={false}>
        <p>Inbox</p>
      </Refreshable>,
    );
    // Chrome keeps its own pull to refresh on the document.
    expect(document.documentElement.style.overscrollBehaviorY).toBe('auto');
    pull(content(), [30, 30, 30, 30]);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(translateY(content())).toBe(0);
    // A refresh the app starts reports busy and is announced, with no inset
    // and no indicator.
    rerender(
      <Refreshable data-testid="refresh" onRefresh={onRefresh} isRefreshing>
        <p>Inbox</p>
      </Refreshable>,
    );
    expect(content()).toHaveAttribute('aria-busy', 'true');
    expect(translateY(content())).toBe(0);
    const indicator = content().firstElementChild as HTMLElement;
    expect(indicator).not.toHaveAttribute('data-refresh-spinning');
    await waitFor(() => expect(document.body).toHaveTextContent('Refreshing'));
    rerender(
      <Refreshable
        data-testid="refresh"
        onRefresh={onRefresh}
        isRefreshing={false}>
        <p>Inbox</p>
      </Refreshable>,
    );
    expect(content()).not.toHaveAttribute('aria-busy');
    expect(translateY(content())).toBe(0);
  });

  it('does not pull while disabled', () => {
    const onRefresh = vi.fn();
    render(
      <Refreshable data-testid="refresh" onRefresh={onRefresh} isDisabled>
        <p>Inbox</p>
      </Refreshable>,
    );
    pull(content(), [30, 30, 30, 30]);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(translateY(content())).toBe(0);
  });

  it('stands down while a scroll lock holds the page', () => {
    const onRefresh = vi.fn();
    function Locked({isLocked}: {isLocked: boolean}) {
      useScrollLock(isLocked);
      return null;
    }
    const {rerender} = render(
      <>
        <Locked isLocked={false} />
        <Refreshable data-testid="refresh" onRefresh={onRefresh}>
          <p>Inbox</p>
        </Refreshable>
      </>,
    );
    expect(document.documentElement.style.overscrollBehaviorY).toBe('none');
    rerender(
      <>
        <Locked isLocked />
        <Refreshable data-testid="refresh" onRefresh={onRefresh}>
          <p>Inbox</p>
        </Refreshable>
      </>,
    );
    expect(document.documentElement.style.overscrollBehaviorY).toBe('');
    pull(content(), [30, 30, 30, 30]);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('owns the page’s top edge while mounted on a touch screen, then gives it back', () => {
    document.documentElement.style.overscrollBehaviorY = 'auto';
    const {unmount} = render(
      <Refreshable data-testid="refresh" onRefresh={() => {}}>
        <p>Inbox</p>
      </Refreshable>,
    );
    expect(document.documentElement.style.overscrollBehaviorY).toBe('none');
    unmount();
    expect(document.documentElement.style.overscrollBehaviorY).toBe('auto');
  });

  it('owns the top edge of the scroll container it sits in, not the page’s', () => {
    const {unmount} = render(
      <div
        data-testid="scroller"
        style={{overflowY: 'auto', overscrollBehaviorY: 'contain'}}>
        <Refreshable data-testid="refresh" onRefresh={() => {}}>
          <p>Inbox</p>
        </Refreshable>
      </div>,
    );
    const scroller = screen.getByTestId('scroller');
    expect(scroller.style.overscrollBehaviorY).toBe('none');
    expect(document.documentElement.style.overscrollBehaviorY).toBe('');
    unmount();
  });

  it('finds a scroll container that starts scrolling only after mount, as ScrollableArea does once it has measured', async () => {
    const {unmount} = render(
      <div
        data-testid="scroller"
        style={{overflowY: 'clip', overscrollBehaviorY: 'auto'}}>
        <Refreshable data-testid="refresh" onRefresh={() => {}}>
          <p>Inbox</p>
        </Refreshable>
      </div>,
    );
    const scroller = screen.getByTestId('scroller');
    // Not scrolling yet: the page is the scroll owner.
    expect(document.documentElement.style.overscrollBehaviorY).toBe('none');
    // The container's next render makes it scroll.
    scroller.style.overflowY = 'auto';
    await waitFor(() =>
      expect(scroller.style.overscrollBehaviorY).toBe('none'),
    );
    expect(document.documentElement.style.overscrollBehaviorY).toBe('');
    unmount();
    expect(scroller.style.overscrollBehaviorY).toBe('auto');
  });

  it('follows its scroll container’s scrolls: the top edge is the pull’s only near the top', () => {
    render(
      <div data-testid="scroller" style={{overflowY: 'auto'}}>
        <Refreshable data-testid="refresh" onRefresh={() => {}}>
          <p>Inbox</p>
        </Refreshable>
      </div>,
    );
    const scroller = screen.getByTestId('scroller');
    expect(scroller.style.overscrollBehaviorY).toBe('none');
    const scrollTo = (top: number) => {
      Object.defineProperty(scroller, 'scrollTop', {
        value: top,
        configurable: true,
      });
      act(() => {
        scroller.dispatchEvent(new Event('scroll'));
      });
    };
    // Far from the top the browser keeps its own overscroll (the bottom
    // bounce), and near the top the pull takes it back.
    scrollTo(500);
    expect(scroller.style.overscrollBehaviorY).toBe('');
    scrollTo(0);
    expect(scroller.style.overscrollBehaviorY).toBe('none');
  });

  it('restores the scroll container’s own value when it unmounts', () => {
    function Host({hasControl}: {hasControl: boolean}) {
      return (
        <div data-testid="scroller" style={{overflowY: 'auto'}}>
          {hasControl ? (
            <Refreshable data-testid="refresh" onRefresh={() => {}}>
              <p>Inbox</p>
            </Refreshable>
          ) : (
            <p>Inbox</p>
          )}
        </div>
      );
    }
    const {rerender} = render(<Host hasControl />);
    const scroller = screen.getByTestId('scroller');
    expect(scroller.style.overscrollBehaviorY).toBe('none');
    rerender(<Host hasControl={false} />);
    expect(scroller.style.overscrollBehaviorY).toBe('');
  });
  it('cross-fades the drawing\u2019s spoke layers at the trigger and resets them at the end', async () => {
    let resolve: () => void = () => {};
    render(
      <LayeredRefreshable
        onRefresh={() =>
          new Promise<void>(done => {
            resolve = done;
          })
        }>
        <p>Inbox</p>
      </LayeredRefreshable>,
    );
    pull(content(), [30, 30, 30, 30]);
    // On the gradient spring (the animator lands it at once here): the
    // revealed spokes out, the stepping gradient in.
    expect(layers()).toEqual({reveal: '0', spin: '1'});
    await act(async () => {
      resolve();
    });
    expect(content()).not.toHaveAttribute('aria-busy');
    // Once the end's slide has finished.
    await waitFor(() => expect(layers()).toEqual({reveal: '1', spin: '0'}));
  });

  it('shows the gradient at once for a refresh begun without a pull', () => {
    render(
      <LayeredRefreshable onRefresh={() => new Promise<void>(() => {})}>
        <p>Inbox</p>
      </LayeredRefreshable>,
    );
    act(() => {
      screen.getByRole('button', {name: 'Refresh'}).click();
    });
    expect(content()).toHaveAttribute('aria-busy', 'true');
    expect(layers()).toEqual({reveal: '0', spin: '1'});
  });

  it('brings the revealed spokes back when a refresh ends under the finger', () => {
    function Controlled({isRefreshing}: {isRefreshing: boolean}) {
      return (
        <LayeredRefreshable isRefreshing={isRefreshing} onRefresh={() => {}}>
          <p>Inbox</p>
        </LayeredRefreshable>
      );
    }
    const {rerender} = render(<Controlled isRefreshing={false} />);
    // A pull past the trigger, the finger still down.
    pull(content(), [30, 30, 30, 30], false);
    rerender(<Controlled isRefreshing />);
    expect(layers()).toEqual({reveal: '0', spin: '1'});
    rerender(<Controlled isRefreshing={false} />);
    expect(layers()).toEqual({reveal: '1', spin: '0'});
  });
});
