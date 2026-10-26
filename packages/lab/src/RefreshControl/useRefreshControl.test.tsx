// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useRefreshControl.test.tsx
 * @input vitest (jsdom), useRefreshControl on a minimal structure (content,
 *   indicator, spinner), touch events dispatched on its content, stand-ins
 *   for a touch screen (matchMedia) and for a WebKit that is not iOS's
 *   (CSS.supports)
 * @output Covers the pull (UIKit's mapping, trigger with the finger down,
 *   release onto the inset or back to the top), the end, controlled and
 *   programmatic refreshes, the announcement, the touch gate (a mouse or a
 *   trackpad leaves the pull and the top edge to the browser; any touch
 *   screen, Android's included, pulls), the disabled state, the scroll-lock stand-down and the
 *   top-edge overscroll policy on the page and on a scroll container
 * @position Testing; colocated with useRefreshControl.ts. Motion itself is
 *   checked in a real browser (the RefreshControl interaction spec and its
 *   storyboards)
 */

import {useState, type ReactNode} from 'react';
import {act, render, screen, waitFor} from '@testing-library/react';
import {useScrollLock} from '@astryxdesign/core/hooks';
import {SETTLE_THRESHOLD} from '@astryxdesign/core/motion/animator';
import {solveSpring, toSpring} from '@astryxdesign/core/motion/spring';
import {refreshControl} from '@astryxdesign/core/motion/uikit/refresh';
import {timing} from '@astryxdesign/core/motion/uikit/timing';
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

/** Whether the engine answers iOS WebKit's `CSS.supports` query. */
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

/** A host whose glyph holds the drawing's eight spokes, as RefreshControl's. */
function SpokedRefreshable({
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
          {Array.from({length: refreshControl.indicatorSpokes}, (_, index) => (
            <span key={index} data-testid="spoke" />
          ))}
        </span>
      </div>
      <button type="button" onClick={control.refresh}>
        Refresh
      </button>
      {children}
    </div>
  );
}

/**
 * Every element added to or removed from the glyph from now on: the trigger's
 * transient copy of the spokes.
 */
function watchGlyph(): {added: HTMLElement[]; removed: HTMLElement[]} {
  const glyph = screen.getAllByTestId('spoke')[0].parentElement as HTMLElement;
  const seen = {added: [] as HTMLElement[], removed: [] as HTMLElement[]};
  new MutationObserver(records => {
    for (const record of records) {
      seen.added.push(...(Array.from(record.addedNodes) as HTMLElement[]));
      seen.removed.push(...(Array.from(record.removedNodes) as HTMLElement[]));
    }
  }).observe(glyph, {childList: true});
  return seen;
}

interface Played {
  element: Element;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  animation: {onfinish: (() => void) | null; cancel: () => void};
}

/**
 * Records the Web Animations elements start from now on (jsdom implements
 * none), for the test that calls it.
 */
function recordAnimations(): Played[] {
  const played: Played[] = [];
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value(
      this: Element,
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
    ) {
      const animation = {onfinish: null, cancel: vi.fn()};
      played.push({element: this, keyframes, options, animation});
      return animation as unknown as Animation;
    },
  });
  return played;
}

/** Lets the mutation observer and the animator's promises run. */
async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

/** The indicator, marked with the spinning attribute while the spokes step. */
function indicator(): HTMLElement {
  return screen.getAllByTestId('spoke')[0].parentElement
    ?.parentElement as HTMLElement;
}

function content(): HTMLElement {
  return screen.getByTestId('refresh');
}

describe('useRefreshControl', () => {
  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    originalInnerHeight = window.innerHeight;
    useTouchScreen(true);
    // The page as tall as the scroll view UIKit's frames were measured on:
    // the trigger distance is then UIKit's floor, 73 px of overscroll.
    Object.defineProperty(window, 'innerHeight', {
      value: 334,
      configurable: true,
    });
    clock = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(HTMLElement.prototype, 'animate');
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
    // The settle starts in the next frame; jsdom has no compositor, so it
    // lands on its target at once.
    await waitFor(() => expect(translateY(content())).toBeCloseTo(60, 5));
    await waitFor(() => expect(document.body).toHaveTextContent('Refreshing'));
  });

  it('pulls from the move that crosses the hysteresis, even one that lands on it exactly', () => {
    render(
      <Refreshable data-testid="refresh" onRefresh={() => {}}>
        <p>Inbox</p>
      </Refreshable>,
    );
    // 5 px steps: the second lands on the 10 px hysteresis, where the pan
    // begins at a translation of zero; the two after it pull 10 px.
    pull(content(), [5, 5, 5, 5], false);
    expect(translateY(content())).toBe(10);
  });

  it('keeps the indicator at the top of the scroll view while the content is pulled, settles and ends', async () => {
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
    const indicator = content().firstElementChild as HTMLElement;
    pull(content(), [30, 30, 30, 30], false);
    // UIRefreshControl stays where it is while the content moves away from
    // it: the indicator rides on the content's edge, so it moves back by
    // what the content moved past the inset.
    const pulled = translateY(content());
    expect(pulled).toBeGreaterThan(60);
    expect(translateY(indicator)).toBeCloseTo(60 - pulled, 5);
    touch('touchend', content(), 220, true);
    await waitFor(() => expect(translateY(content())).toBeCloseTo(60, 5));
    expect(translateY(indicator)).toBeCloseTo(0, 5);
    await act(async () => {
      resolve();
    });
    await waitFor(() => expect(translateY(content())).toBe(0));
    // Back at the top, the content's edge covers it.
    expect(translateY(indicator)).toBeCloseTo(60, 5);
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

  it('turns the spinner at the trigger, never the indicator holding it', async () => {
    render(
      <Refreshable
        data-testid="refresh"
        onRefresh={() => new Promise<void>(() => {})}>
        <p>Inbox</p>
      </Refreshable>,
    );
    const indicator = content().firstElementChild as HTMLElement;
    const spinner = indicator.firstElementChild as HTMLElement;
    // Every style either element passes through (the turn returns to rest,
    // where the animator clears it, so the final style alone shows nothing).
    const styles = (element: HTMLElement) => {
      const seen: string[] = [];
      const observer = new MutationObserver(records => {
        for (const record of records) {
          seen.push(record.oldValue ?? '');
        }
      });
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['style'],
        attributeOldValue: true,
      });
      const stop = () => {
        for (const record of observer.takeRecords()) {
          seen.push(record.oldValue ?? '');
        }
        observer.disconnect();
        seen.push(element.getAttribute('style') ?? '');
        return seen;
      };
      return stop;
    };
    const turns = (text: string) =>
      [...text.matchAll(/rotate:\s*(-?[\d.]+)deg/g)].map(m => parseFloat(m[1]));
    const stopSpinner = styles(spinner);
    const stopIndicator = styles(indicator);
    pull(content(), [30, 30, 30, 30]);
    await act(async () => {
      await Promise.resolve();
    });
    const onSpinner = stopSpinner().flatMap(turns);
    const onIndicator = stopIndicator().flatMap(turns);
    // UIKit's trigger turn starts about half a turn round (π − 0.01).
    expect(onSpinner.some(degrees => degrees > 170)).toBe(true);
    expect(onIndicator).toEqual([]);
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

  it('settles back to the top without refreshing below the trigger', async () => {
    const onRefresh = vi.fn();
    render(
      <Refreshable data-testid="refresh" onRefresh={onRefresh}>
        <p>Inbox</p>
      </Refreshable>,
    );
    pull(content(), [20, 20, 20, 10]);
    expect(onRefresh).not.toHaveBeenCalled();
    await waitFor(() => expect(translateY(content())).toBe(0));
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
    // The slide starts in the frame after the end has rendered.
    await waitFor(() => expect(translateY(content())).toBe(0));
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

  it('keeps a pulled refresh running while a controlled parent holds it, until the parent ends it', async () => {
    let end: () => void = () => {};
    function Parent() {
      const [refreshing, setRefreshing] = useState(false);
      end = () => setRefreshing(false);
      return (
        <Refreshable
          data-testid="refresh"
          onRefresh={() => setRefreshing(true)}
          isRefreshing={refreshing}>
          <p>Inbox</p>
        </Refreshable>
      );
    }
    render(<Parent />);
    pull(content(), [30, 30, 30, 30]);
    await waitFor(() => expect(content()).toHaveAttribute('aria-busy', 'true'));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    expect(content()).toHaveAttribute('aria-busy', 'true');
    act(() => {
      end();
    });
    await waitFor(() => expect(content()).not.toHaveAttribute('aria-busy'));
  });

  it('does not pull under a mouse or trackpad', () => {
    useTouchScreen(false);
    // The premise: the primary pointer is not coarse.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
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

  it('pulls on any touch screen, an Android phone’s included: one touch model, no iOS check', async () => {
    useIos(false);
    const onRefresh = vi.fn();
    const {unmount} = render(
      <Refreshable data-testid="refresh" onRefresh={onRefresh}>
        <p>Inbox</p>
      </Refreshable>,
    );
    // On the page the pull owns the top edge, so Chrome's own pull to
    // refresh does not reload it.
    expect(document.documentElement.style.overscrollBehaviorY).toBe('none');
    pull(content(), [30, 30, 30, 30]);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(content()).not.toHaveAttribute('aria-busy'));
    await waitFor(() => expect(translateY(content())).toBe(0));
    unmount();
    render(<p data-testid="refresh">Gone</p>);
  });

  it('with a mouse or trackpad leaves the pull and the top edge to the browser, and a refresh shows nothing', async () => {
    useTouchScreen(false);
    // The premise: the primary pointer is not coarse.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
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
    document.documentElement.style.overscrollBehaviorY = '';
  });

  it('ends a pulled refresh on the next commit when a controlled isRefreshing stays false', async () => {
    // The parent never takes the refresh (or sets true then false in one
    // handler): the prop is the source, so the refresh ends.
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
    await waitFor(() => expect(content()).not.toHaveAttribute('aria-busy'));
    await waitFor(() => expect(translateY(content())).toBe(0));
  });

  it('renders a controlled isRefreshing from its first render', () => {
    const seen: boolean[] = [];
    function Probe({isRefreshing}: {isRefreshing: boolean}) {
      const control = useRefreshControl({isRefreshing});
      seen.push(control.isRefreshing);
      return <div ref={control.contentRef} />;
    }
    render(<Probe isRefreshing />);
    // No first render with the refresh off.
    expect(seen[0]).toBe(true);
  });

  it('leaves no inline translate on the content at rest, so its fixed children stay fixed', async () => {
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
    // Any translate, 0 included, makes the content the containing block of
    // its `position: fixed` children.
    pull(content(), [20, 20, 20, 10]);
    await waitFor(() =>
      expect(content().style.getPropertyValue('translate')).toBe(''),
    );
    pull(content(), [30, 30, 30, 30]);
    await waitFor(() => expect(translateY(content())).toBeCloseTo(60, 5));
    await act(async () => {
      resolve();
    });
    await waitFor(() =>
      expect(content().style.getPropertyValue('translate')).toBe(''),
    );
  });

  it('never claims the top edge when a scroll lock already holds at mount', async () => {
    function Locked() {
      useScrollLock(true);
      return null;
    }
    const scroller = document.createElement('div');
    scroller.style.overflowY = 'auto';
    document.body.append(scroller);
    // Every style the container had, before each change and at the end (a
    // claim released in the next commit still shows in the old values).
    const written: string[] = [];
    const observer = new MutationObserver(records => {
      for (const record of records) {
        written.push(record.oldValue ?? '');
      }
    });
    observer.observe(scroller, {
      attributes: true,
      attributeFilter: ['style'],
      attributeOldValue: true,
    });
    // The lock holds first (an open dialog), then the list mounts.
    const {rerender, unmount} = render(<Locked />, {container: scroller});
    rerender(
      <>
        <Locked />
        <Refreshable data-testid="refresh" onRefresh={() => {}}>
          <p>Inbox</p>
        </Refreshable>
      </>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    for (const record of observer.takeRecords()) {
      written.push(record.oldValue ?? '');
    }
    observer.disconnect();
    written.push(scroller.getAttribute('style') ?? '');
    expect(written.join('\n')).not.toMatch(/overscroll-behavior-y:\s*none/);
    unmount();
    scroller.remove();
  });

  it('holds its scroll listener only while a finger can pull, and no resize listener', () => {
    // react-component-runtime INV5: optional behavior holds its resources
    // only while enabled. Other parts (the gesture host) keep their own, so
    // compare a disabled control with an enabled one.
    const listenersFor = (isDisabled: boolean) => {
      const scrolls = vi.spyOn(document, 'addEventListener');
      const resizes = vi.spyOn(window, 'addEventListener');
      const {unmount} = render(
        <Refreshable
          data-testid="refresh"
          onRefresh={() => {}}
          isDisabled={isDisabled}>
          <p>Inbox</p>
        </Refreshable>,
      );
      const counts = {
        scroll: scrolls.mock.calls.filter(call => call[0] === 'scroll').length,
        resize: resizes.mock.calls.filter(call => call[0] === 'resize').length,
      };
      unmount();
      scrolls.mockRestore();
      resizes.mockRestore();
      return counts;
    };
    const disabled = listenersFor(true);
    const enabled = listenersFor(false);
    expect(enabled.scroll - disabled.scroll).toBe(1);
    expect(enabled.resize - disabled.resize).toBe(0);
    render(<p data-testid="refresh">Gone</p>);
  });

  it('ends a refresh that begins and ends before React renders: refresh() from a timer, with an onRefresh that settles at once', async () => {
    let refresh: () => void = () => {};
    function Probe() {
      const control = useRefreshControl({onRefresh: () => {}});
      refresh = control.refresh;
      return (
        <div
          data-testid="refresh"
          ref={control.contentRef}
          aria-busy={control.isRefreshing || undefined}>
          <div ref={control.indicatorRef} aria-hidden>
            <span ref={control.spinnerRef} />
          </div>
          <p>Inbox</p>
        </div>
      );
    }
    render(<Probe />);
    // Outside any React event, so the begin and the end land in one render
    // and the rendered `isRefreshing` never changes.
    await new Promise<void>(resolve =>
      setTimeout(() => {
        refresh();
        resolve();
      }, 0),
    );
    // The inset went on with no visible motion; the end slides it off.
    await waitFor(() => expect(translateY(content())).toBe(0), {
      timeout: 3000,
    });
    expect(content()).not.toHaveAttribute('aria-busy');
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

  it('cancels a pull in flight when a scroll lock engages: the content settles back and no refresh starts', async () => {
    const onRefresh = vi.fn();
    function Locked({isLocked}: {isLocked: boolean}) {
      useScrollLock(isLocked);
      return null;
    }
    const page = (isLocked: boolean) => (
      <>
        <Locked isLocked={isLocked} />
        <Refreshable data-testid="refresh" onRefresh={onRefresh}>
          <p>Inbox</p>
        </Refreshable>
      </>
    );
    const {rerender} = render(page(false));
    // A finger pulls short of the trigger and stays down.
    pull(content(), [20, 20, 20], false);
    expect(translateY(content())).toBeGreaterThan(0);
    // An overlay opens under the finger: its scroll lock turns the pull off.
    rerender(page(true));
    await waitFor(() => expect(translateY(content())).toBe(0));
    // The finger goes on past the trigger distance and lifts: nothing starts.
    touch('touchmove', content(), 260);
    touch('touchend', content(), 260, true);
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
    // The lock owns the page's styles now (it turns the page's overscroll
    // off itself); the pull stands down under it.
    pull(content(), [30, 30, 30, 30]);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(translateY(content())).toBe(0);
    // Once the lock goes, the pull takes the edge again.
    rerender(
      <>
        <Locked isLocked={false} />
        <Refreshable data-testid="refresh" onRefresh={onRefresh}>
          <p>Inbox</p>
        </Refreshable>
      </>,
    );
    expect(document.documentElement.style.overscrollBehaviorY).toBe('none');
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
  it('at the trigger steps the spokes at once and fades a transient copy of them out over them', async () => {
    const played = recordAnimations();
    let resolve: () => void = () => {};
    render(
      <SpokedRefreshable
        onRefresh={() =>
          new Promise<void>(done => {
            resolve = done;
          })
        }>
        <p>Inbox</p>
      </SpokedRefreshable>,
    );
    const seen = watchGlyph();
    pull(content(), [30, 30, 30, 30]);
    // The spokes step from the trigger: no hand-over later.
    expect(indicator()).toHaveAttribute('data-refresh-spinning');
    await flush();
    // One transient copy, holding a copy of each spoke as the pull left it:
    // full alpha, and none of the spinning steps.
    expect(seen.added).toHaveLength(1);
    const [copy] = seen.added;
    expect(copy.children).toHaveLength(refreshControl.indicatorSpokes);
    for (const spoke of Array.from(copy.children) as HTMLElement[]) {
      expect(spoke.style.opacity).toBe('1');
      expect(spoke.childNodes).toHaveLength(0);
      expect(played.filter(p => p.element === spoke)).toEqual([]);
    }
    // Each spoke steps on its own animation, a turn per iteration.
    const steps = played.filter(p => p.options.iterations === Infinity);
    expect(steps.map(p => p.element)).toEqual(
      screen.getAllByTestId('spoke').filter(spoke => !copy.contains(spoke)),
    );
    // Its one animation: 1 − w on the gradient spring until it settles, held
    // at 0 until the copy is removed.
    const fades = played.filter(p => p.element === copy);
    expect(fades).toHaveLength(1);
    const [{keyframes, options, animation}] = fades;
    const settleMs =
      solveSpring(toSpring(refreshControl.triggerGradientSpring), {
        from: 0,
        to: 1,
      }).settleTime(SETTLE_THRESHOLD.opacity) * 1000;
    expect(options).toEqual({
      duration: settleMs,
      easing: 'linear',
      fill: 'forwards',
    });
    const opacities = keyframes.map(frame => Number(frame.opacity));
    expect(opacities[0]).toBe(1);
    expect(opacities.at(-1)).toBe(0);
    opacities.slice(1).forEach((opacity, i) => {
      expect(opacity).toBeLessThanOrEqual(opacities[i]);
    });
    // Its end removes it: at rest the glyph holds its eight spokes alone.
    expect(seen.removed).toEqual([]);
    act(() => {
      animation.onfinish?.();
    });
    await flush();
    expect(seen.removed).toEqual([copy]);
    expect(screen.getAllByTestId('spoke')).toHaveLength(
      refreshControl.indicatorSpokes,
    );
    await act(async () => {
      resolve();
    });
    expect(content()).not.toHaveAttribute('aria-busy');
    // Once the end's slide has finished, the spokes show the reveal again.
    await waitFor(() =>
      expect(indicator()).not.toHaveAttribute('data-refresh-spinning'),
    );
    for (const step of steps) {
      expect(step.animation.cancel).toHaveBeenCalled();
    }
  });

  it('under Reduce Motion fades the copy in the shared 200 ms fade, the spokes stepping from the trigger', async () => {
    window.matchMedia = (query: string) =>
      ({
        matches: COARSE.test(query) || /prefers-reduced-motion/.test(query),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
    const played = recordAnimations();
    render(
      <SpokedRefreshable onRefresh={() => new Promise<void>(() => {})}>
        <p>Inbox</p>
      </SpokedRefreshable>,
    );
    const seen = watchGlyph();
    pull(content(), [30, 30, 30, 30]);
    expect(indicator()).toHaveAttribute('data-refresh-spinning');
    await flush();
    expect(seen.added).toHaveLength(1);
    const fade = played.find(p => p.element === seen.added[0]);
    expect(fade?.keyframes).toEqual([{opacity: 1}, {opacity: 0}]);
    expect(fade?.options.duration).toBe(timing.reducedMotionCrossFadeMs);
    expect(fade?.options.easing).toMatch(/^cubic-bezier\(/);
    act(() => {
      fade?.animation.onfinish?.();
    });
    await flush();
    expect(seen.removed).toEqual(seen.added);
  });

  it('cancels the spin and the cross-fade when the control unmounts mid-refresh', async () => {
    const played = recordAnimations();
    const {unmount} = render(
      <SpokedRefreshable onRefresh={() => new Promise<void>(() => {})}>
        <p>Inbox</p>
      </SpokedRefreshable>,
    );
    pull(content(), [30, 30, 30, 30]);
    await flush();
    // The spokes' eight turns, and the trigger's cross-fade: 1 to 0, held.
    const steps = played.filter(p => p.options.iterations === Infinity);
    const fades = played.filter(
      p =>
        p.options.fill === 'forwards' &&
        Number(p.keyframes[0]?.opacity) === 1 &&
        Number(p.keyframes.at(-1)?.opacity) === 0,
    );
    expect(steps).toHaveLength(refreshControl.indicatorSpokes);
    expect(fades).toHaveLength(1);
    // Still running: nothing has ended them yet.
    for (const run of [...steps, ...fades]) {
      expect(run.animation.cancel).not.toHaveBeenCalled();
    }
    // Unmounted mid-refresh, mid-fade: nothing keeps running on detached
    // nodes.
    unmount();
    for (const run of [...steps, ...fades]) {
      expect(run.animation.cancel).toHaveBeenCalled();
    }
  });

  it('without Web Animations marks the spin and leaves no copy', async () => {
    render(
      <SpokedRefreshable onRefresh={() => new Promise<void>(() => {})}>
        <p>Inbox</p>
      </SpokedRefreshable>,
    );
    pull(content(), [30, 30, 30, 30]);
    expect(indicator()).toHaveAttribute('data-refresh-spinning');
    await flush();
    expect(
      (indicator().firstElementChild as HTMLElement).children,
    ).toHaveLength(refreshControl.indicatorSpokes);
  });

  it('shows the gradient at once for a refresh begun without a pull', async () => {
    const played = recordAnimations();
    render(
      <SpokedRefreshable onRefresh={() => new Promise<void>(() => {})}>
        <p>Inbox</p>
      </SpokedRefreshable>,
    );
    const seen = watchGlyph();
    act(() => {
      screen.getByRole('button', {name: 'Refresh'}).click();
    });
    expect(content()).toHaveAttribute('aria-busy', 'true');
    // Every spoke steps at once, with no cross-fade.
    expect(indicator()).toHaveAttribute('data-refresh-spinning');
    expect(played.map(p => p.element)).toEqual(screen.getAllByTestId('spoke'));
    await flush();
    expect(seen.added).toEqual([]);
  });

  it('brings the revealed spokes back when a refresh ends under the finger', async () => {
    function Controlled({isRefreshing}: {isRefreshing: boolean}) {
      return (
        <SpokedRefreshable isRefreshing={isRefreshing} onRefresh={() => {}}>
          <p>Inbox</p>
        </SpokedRefreshable>
      );
    }
    const played = recordAnimations();
    const {rerender} = render(<Controlled isRefreshing={false} />);
    // A pull past the trigger, the finger still down.
    pull(content(), [30, 30, 30, 30], false);
    rerender(<Controlled isRefreshing />);
    expect(indicator()).toHaveAttribute('data-refresh-spinning');
    const steps = played.filter(p => p.options.iterations === Infinity);
    const running = () =>
      steps.filter(p => vi.mocked(p.animation.cancel).mock.calls.length === 0);
    expect(running()).toHaveLength(refreshControl.indicatorSpokes);
    rerender(<Controlled isRefreshing={false} />);
    expect(indicator()).not.toHaveAttribute('data-refresh-spinning');
    expect(running()).toEqual([]);
    await flush();
    expect(screen.getAllByTestId('spoke')).toHaveLength(
      refreshControl.indicatorSpokes,
    );
    const glyph = indicator().firstElementChild as HTMLElement;
    expect(glyph.children).toHaveLength(refreshControl.indicatorSpokes);
  });
});
