// Copyright (c) Meta Platforms, Inc. and affiliates.

import {act, render, screen} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {useRef, type Ref} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  useScrollableArea,
  type ScrollAxis,
  type ScrollOverscroll,
  type ScrollStickyContainment,
} from './useScrollableArea';
import {
  findNearestScrollOwner,
  getRegisteredScrollOwnerState,
} from './scrollOwnerRegistry';
import {getLogicalAxisMapping} from './scrollGeometry';

const testStyles = stylex.create({
  viewport: {borderWidth: 1, borderStyle: 'solid'},
});

interface FixtureProps {
  axis?: ScrollAxis;
  chaining?: ScrollOverscroll;
  stickyContainment?: ScrollStickyContainment;
  externalRef?: Ref<HTMLDivElement>;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
}

function Fixture({
  axis = 'inline',
  chaining = 'allow',
  stickyContainment,
  externalRef,
  onScroll,
}: FixtureProps) {
  const {getViewportProps, getContentProps, state} = useScrollableArea({
    axis,
    keyboardAccess: {
      owner: 'viewport',
      label: 'Scrollable results',
      role: 'region',
    },
    overscroll: chaining,
    stickyContainment,
  });

  return (
    <>
      <div
        data-testid="viewport"
        {...getViewportProps({
          ref: externalRef,
          onScroll,
          xstyle: testStyles.viewport,
          style: {backgroundColor: 'red', overflowX: 'scroll'},
        })}>
        <div data-testid="content" {...getContentProps()}>
          <span data-testid="descendant">Content</span>
        </div>
      </div>
      <output data-testid="state">{JSON.stringify(state)}</output>
    </>
  );
}

function setGeometry(
  element: HTMLElement,
  values: Partial<
    Pick<
      HTMLElement,
      | 'clientWidth'
      | 'clientHeight'
      | 'scrollWidth'
      | 'scrollHeight'
      | 'scrollLeft'
      | 'scrollTop'
    >
  >,
) {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(element, key, {
      configurable: true,
      value,
      writable: true,
    });
  }
}

function state(): {
  inline: {isScrollable: boolean; atStart: boolean; atEnd: boolean};
  block: {isScrollable: boolean; atStart: boolean; atEnd: boolean};
} {
  return JSON.parse(screen.getByTestId('state').textContent ?? '{}');
}

function makeMeasurable(viewport: HTMLElement) {
  setGeometry(viewport, {
    clientWidth: 100,
    clientHeight: 100,
    scrollWidth: 100,
    scrollHeight: 100,
    scrollLeft: 0,
    scrollTop: 0,
  });
}

describe('useScrollableArea', () => {
  let frames: FrameRequestCallback[];

  beforeEach(() => {
    frames = [];
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        frames.push(callback);
        return frames.length;
      }),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal(
      'ResizeObserver',
      vi.fn(function () {
        return {observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn()};
      }),
    );
    const nativeGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
      const computed = nativeGetComputedStyle(element);
      return new Proxy(computed, {
        // eslint-disable-next-line @typescript-eslint/promise-function-async -- Proxy traps must remain synchronous
        get(target, property) {
          if (element instanceof HTMLElement && property === 'overflowX') {
            return element.style.overflowX || 'auto';
          }
          if (element instanceof HTMLElement && property === 'overflowY') {
            return element.style.overflowY || 'auto';
          }
          return Reflect.get(target, property, target);
        },
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function flushFrame() {
    void act(() => {
      const pending = frames.splice(0);
      pending.forEach(callback => callback(performance.now()));
    });
  }

  it('starts inactive and fitting without creating a tab stop', () => {
    render(<Fixture />);
    const viewport = screen.getByTestId('viewport');

    expect(state()).toEqual({
      inline: {isScrollable: false, atStart: true, atEnd: true},
      block: {isScrollable: false, atStart: true, atEnd: true},
    });
    expect(viewport).not.toHaveAttribute('tabindex');
    expect(viewport).toHaveAttribute('role', 'region');
    expect(viewport).toHaveAccessibleName('Scrollable results');
    expect(viewport).not.toHaveAttribute('xstyle');
    expect(viewport.style.backgroundColor).toBe('red');
    expect(viewport.style.overflowX).toBe('');
    expect(viewport.getAttribute('style')).toContain('clip');
  });

  it('owns fitting and explicit Sticky overflow styling for direct adopters', () => {
    const {rerender} = render(<Fixture />);
    const viewport = screen.getByTestId('viewport');
    expect(viewport.getAttribute('style')).toContain('clip');

    rerender(<Fixture stickyContainment="always" />);
    expect(viewport.getAttribute('style')).toContain('--x-overflowX: auto');
    expect(viewport.getAttribute('style')).toContain('--x-overflowY: hidden');
  });

  it('activates only the overflowing physical axis when both are requested', () => {
    render(<Fixture axis="both" />);
    const viewport = screen.getByTestId('viewport');
    makeMeasurable(viewport);
    setGeometry(viewport, {scrollWidth: 180});

    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(viewport.getAttribute('style')).toContain('--x-overflowX: auto');
    expect(viewport.getAttribute('style')).toContain('--x-overflowY: hidden');
  });

  it('requires scroll-capable computed overflow and more than 1px excess geometry', () => {
    render(<Fixture />);
    const viewport = screen.getByTestId('viewport');
    makeMeasurable(viewport);

    setGeometry(viewport, {scrollWidth: 101});
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(state().inline.isScrollable).toBe(false);

    viewport.style.overflowX = 'hidden';
    setGeometry(viewport, {scrollWidth: 140});
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(state().inline.isScrollable).toBe(false);

    viewport.style.overflowX = 'auto';
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(state().inline).toEqual({
      isScrollable: true,
      atStart: true,
      atEnd: false,
    });
    expect(viewport).toHaveAttribute('tabindex', '0');
  });

  it('publishes stable logical start, middle, and end edge state', () => {
    render(<Fixture />);
    const viewport = screen.getByTestId('viewport');
    makeMeasurable(viewport);
    setGeometry(viewport, {scrollWidth: 300});

    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(state().inline).toEqual({
      isScrollable: true,
      atStart: true,
      atEnd: false,
    });

    setGeometry(viewport, {scrollLeft: 80});
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(state().inline).toEqual({
      isScrollable: true,
      atStart: false,
      atEnd: false,
    });

    setGeometry(viewport, {scrollLeft: 200});
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(state().inline).toEqual({
      isScrollable: true,
      atStart: false,
      atEnd: true,
    });
  });

  it('normalizes RTL inline offsets to logical edges', () => {
    render(<Fixture />);
    const viewport = screen.getByTestId('viewport');
    makeMeasurable(viewport);
    viewport.dir = 'rtl';
    setGeometry(viewport, {scrollWidth: 300, scrollLeft: -200});

    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(state().inline).toEqual({
      isScrollable: true,
      atStart: false,
      atEnd: true,
    });
  });

  it('maps logical axes through vertical and sideways writing modes', () => {
    expect(getLogicalAxisMapping('vertical-rl', 'ltr')).toEqual({
      inline: 'y',
      block: 'x',
      inlineReversed: false,
      blockReversed: true,
    });
    expect(getLogicalAxisMapping('vertical-lr', 'rtl')).toEqual({
      inline: 'y',
      block: 'x',
      inlineReversed: true,
      blockReversed: false,
    });
    expect(getLogicalAxisMapping('sideways-lr', 'ltr')).toEqual({
      inline: 'y',
      block: 'x',
      inlineReversed: true,
      blockReversed: false,
    });
    expect(getLogicalAxisMapping('sideways-lr', 'rtl')).toEqual({
      inline: 'y',
      block: 'x',
      inlineReversed: false,
      blockReversed: false,
    });
    expect(getLogicalAxisMapping('sideways-rl', 'ltr')).toEqual({
      inline: 'y',
      block: 'x',
      inlineReversed: false,
      blockReversed: true,
    });
    expect(getLogicalAxisMapping('sideways-rl', 'rtl')).toEqual({
      inline: 'y',
      block: 'x',
      inlineReversed: true,
      blockReversed: true,
    });
    expect(getLogicalAxisMapping('vertical-rl', 'rtl')).toEqual({
      inline: 'y',
      block: 'x',
      inlineReversed: true,
      blockReversed: true,
    });
    expect(getLogicalAxisMapping('horizontal-tb', 'rtl')).toEqual({
      inline: 'x',
      block: 'y',
      inlineReversed: true,
      blockReversed: false,
    });
  });

  it('normalizes reversed inline offsets in sideways writing modes', () => {
    render(<Fixture />);
    const viewport = screen.getByTestId('viewport');
    makeMeasurable(viewport);
    viewport.style.writingMode = 'sideways-lr';
    setGeometry(viewport, {scrollHeight: 300, scrollTop: -200});

    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(state().inline).toEqual({
      isScrollable: true,
      atStart: false,
      atEnd: true,
    });
  });

  it('measures both requested axes independently in vertical writing mode', () => {
    render(<Fixture axis="both" />);
    const viewport = screen.getByTestId('viewport');
    makeMeasurable(viewport);
    viewport.style.writingMode = 'vertical-rl';
    setGeometry(viewport, {
      scrollWidth: 220,
      scrollHeight: 100,
      scrollLeft: -120,
    });

    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(state()).toEqual({
      inline: {isScrollable: false, atStart: true, atEnd: true},
      block: {isScrollable: true, atStart: false, atEnd: true},
    });
  });

  it('contains only effective physical axes', () => {
    render(<Fixture axis="both" chaining="contain" />);
    const viewport = screen.getByTestId('viewport');
    makeMeasurable(viewport);
    setGeometry(viewport, {scrollWidth: 180, scrollHeight: 100});

    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(viewport.style.overscrollBehaviorX).toBe('contain');
    expect(viewport.style.overscrollBehaviorY).toBe('auto');
  });

  it('preserves caller overscroll behavior on axes outside the requested intent', () => {
    function InlineOnly() {
      const area = useScrollableArea({
        axis: 'inline',
        keyboardAccess: {owner: 'content'},
        overscroll: 'contain',
      });
      return (
        <div
          data-testid="inline-only"
          {...area.getViewportProps({
            style: {overflowX: 'auto', overscrollBehaviorY: 'none'},
          })}>
          <div {...area.getContentProps()}>Content</div>
        </div>
      );
    }

    render(<InlineOnly />);
    const viewport = screen.getByTestId('inline-only');
    expect(viewport.style.overscrollBehaviorX).toBe('auto');
    expect(viewport.style.overscrollBehaviorY).toBe('none');
  });

  it('removes a lost tab stop without moving current focus', () => {
    render(<Fixture />);
    const viewport = screen.getByTestId('viewport');
    makeMeasurable(viewport);
    setGeometry(viewport, {scrollWidth: 180});
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();

    void act(() => viewport.focus());
    expect(document.activeElement).toBe(viewport);
    setGeometry(viewport, {scrollWidth: 100});
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();

    expect(viewport).toHaveAttribute('tabindex', '-1');
    expect(document.activeElement).toBe(viewport);
  });

  it('drops the retained tab stop once the blurred viewport stays fitting', () => {
    render(<Fixture />);
    const viewport = screen.getByTestId('viewport');
    makeMeasurable(viewport);
    setGeometry(viewport, {scrollWidth: 180});
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();

    void act(() => viewport.focus());
    setGeometry(viewport, {scrollWidth: 100});
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(viewport).toHaveAttribute('tabindex', '-1');
    expect(document.activeElement).toBe(viewport);

    void act(() => viewport.blur());
    expect(viewport).not.toHaveAttribute('tabindex');
  });

  it('composes caller refs and handlers without losing behavior', () => {
    const externalRef = vi.fn();
    const onScroll = vi.fn();
    const {rerender} = render(
      <Fixture externalRef={externalRef} onScroll={onScroll} />,
    );
    const viewport = screen.getByTestId('viewport');
    makeMeasurable(viewport);
    setGeometry(viewport, {scrollWidth: 180});

    void act(() =>
      viewport.dispatchEvent(new Event('scroll', {bubbles: true})),
    );
    flushFrame();
    expect(onScroll).toHaveBeenCalledTimes(1);
    expect(externalRef).toHaveBeenCalledWith(viewport);
    expect(state().inline.isScrollable).toBe(true);

    externalRef.mockClear();
    rerender(<Fixture externalRef={externalRef} onScroll={onScroll} />);
    expect(externalRef).not.toHaveBeenCalled();
  });

  it('registers effective owners by axis and skips inactive nested candidates', () => {
    function NestedFixture() {
      const outer = useScrollableArea({
        axis: 'block',
        keyboardAccess: {owner: 'content'},
      });
      const inner = useScrollableArea({
        axis: 'inline',
        keyboardAccess: {owner: 'content'},
      });
      const descendantRef = useRef<HTMLSpanElement>(null);
      return (
        <div
          data-testid="outer"
          {...outer.getViewportProps({style: {overflowY: 'auto'}})}>
          <div {...outer.getContentProps()}>
            <div
              data-testid="inner"
              {...inner.getViewportProps({style: {overflowX: 'auto'}})}>
              <div {...inner.getContentProps()}>
                <span ref={descendantRef} data-testid="nested-descendant" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    render(<NestedFixture />);
    const outer = screen.getByTestId('outer');
    const inner = screen.getByTestId('inner');
    const descendant = screen.getByTestId('nested-descendant');
    makeMeasurable(outer);
    makeMeasurable(inner);
    setGeometry(outer, {scrollHeight: 240});
    setGeometry(inner, {scrollWidth: 100});

    void act(() => outer.dispatchEvent(new Event('scroll')));
    flushFrame();

    expect(getRegisteredScrollOwnerState(outer)?.block.isScrollable).toBe(true);
    expect(getRegisteredScrollOwnerState(inner)?.inline.isScrollable).toBe(
      false,
    );
    expect(findNearestScrollOwner(descendant, 'block')).toBe(outer);
    expect(findNearestScrollOwner(descendant, 'inline')).toBeNull();
  });

  it('resolves the nearest effective owner per axis and unregisters on unmount', () => {
    function DoubleBlockFixture() {
      const outer = useScrollableArea({
        axis: 'block',
        keyboardAccess: {owner: 'content'},
      });
      const inner = useScrollableArea({
        axis: 'block',
        keyboardAccess: {owner: 'content'},
      });
      return (
        <div
          data-testid="outer-owner"
          {...outer.getViewportProps({style: {overflowY: 'auto'}})}>
          <div {...outer.getContentProps()}>
            <div
              data-testid="inner-owner"
              {...inner.getViewportProps({style: {overflowY: 'auto'}})}>
              <div {...inner.getContentProps()}>
                <span data-testid="deep-descendant" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    const {unmount} = render(<DoubleBlockFixture />);
    const outer = screen.getByTestId('outer-owner');
    const inner = screen.getByTestId('inner-owner');
    const descendant = screen.getByTestId('deep-descendant');
    makeMeasurable(outer);
    makeMeasurable(inner);
    setGeometry(outer, {scrollHeight: 240});
    setGeometry(inner, {scrollHeight: 300});

    void act(() => {
      outer.dispatchEvent(new Event('scroll'));
      inner.dispatchEvent(new Event('scroll'));
    });
    flushFrame();

    expect(findNearestScrollOwner(descendant, 'block')).toBe(inner);

    unmount();
    expect(getRegisteredScrollOwnerState(inner)).toBeUndefined();
    expect(getRegisteredScrollOwnerState(outer)).toBeUndefined();
  });

  it('composes caller content props and consumes content xstyle', () => {
    const contentRef = vi.fn();
    const onClick = vi.fn();
    function ContentFixture() {
      const area = useScrollableArea({
        axis: 'inline',
        keyboardAccess: {owner: 'content'},
      });
      return (
        <div {...area.getViewportProps({style: {overflowX: 'auto'}})}>
          <div
            data-testid="styled-content"
            {...area.getContentProps<HTMLDivElement>({
              ref: contentRef,
              onClick,
              className: 'consumer-content',
              style: {color: 'red'},
              xstyle: testStyles.viewport,
            })}>
            Content
          </div>
        </div>
      );
    }

    render(<ContentFixture />);
    const content = screen.getByTestId('styled-content');
    expect(content).not.toHaveAttribute('xstyle');
    expect(content).toHaveClass('consumer-content');
    const expectedClasses = (stylex.props(testStyles.viewport).className ?? '')
      .split(' ')
      .filter(Boolean);
    expect(expectedClasses.length).toBeGreaterThan(0);
    for (const token of expectedClasses) {
      expect(content).toHaveClass(token);
    }
    expect(content.style.color).toBe('red');
    expect(content).toHaveAttribute('data-scroll-content');
    content.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(contentRef).toHaveBeenCalledWith(content);
  });

  it('keeps prop getter identity stable across unrelated re-renders', () => {
    const identities: unknown[] = [];
    function IdentityFixture() {
      const area = useScrollableArea({
        axis: 'inline',
        keyboardAccess: {owner: 'viewport', label: 'Stable results'},
      });
      identities.push(area.getViewportProps);
      return (
        <div {...area.getViewportProps({style: {overflowX: 'auto'}})}>
          <div {...area.getContentProps()}>Content</div>
        </div>
      );
    }

    const {rerender} = render(<IdentityFixture />);
    const settled = identities.at(-1);
    rerender(<IdentityFixture />);
    expect(identities.at(-1)).toBe(settled);
  });

  it('preserves the last valid state while the viewport is unmeasurable', () => {
    render(<Fixture />);
    const viewport = screen.getByTestId('viewport');
    makeMeasurable(viewport);
    setGeometry(viewport, {scrollWidth: 180, scrollLeft: 40});
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(state().inline).toEqual({
      isScrollable: true,
      atStart: false,
      atEnd: false,
    });

    // A collapsed box zeroes every metric; an unguarded remeasure would
    // publish inactive state instead of preserving the last valid one.
    setGeometry(viewport, {
      clientWidth: 0,
      clientHeight: 0,
      scrollWidth: 0,
      scrollHeight: 0,
      scrollLeft: 0,
    });
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(state().inline).toEqual({
      isScrollable: true,
      atStart: false,
      atEnd: false,
    });
  });

  it('coalesces repeated invalidations into one animation frame', () => {
    render(<Fixture />);
    const viewport = screen.getByTestId('viewport');
    makeMeasurable(viewport);
    setGeometry(viewport, {scrollWidth: 180});

    void act(() => {
      viewport.dispatchEvent(new Event('scroll'));
      viewport.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('resize'));
    });
    expect(frames).toHaveLength(1);
  });

  it('keeps behavior-owned accessibility over conflicting caller props', () => {
    function ConflictFixture() {
      const area = useScrollableArea({
        axis: 'inline',
        keyboardAccess: {owner: 'viewport', label: 'Owned name'},
      });
      return (
        <div
          data-testid="conflict-viewport"
          {...area.getViewportProps<HTMLDivElement>({
            role: 'list',
            'aria-label': 'Caller name',
            tabIndex: 5,
          })}>
          <div {...area.getContentProps()}>Content</div>
        </div>
      );
    }

    render(<ConflictFixture />);
    const viewport = screen.getByTestId('conflict-viewport');
    expect(viewport).toHaveAttribute('role', 'group');
    expect(viewport).toHaveAccessibleName('Owned name');
    expect(viewport).not.toHaveAttribute('tabindex');
  });
});
