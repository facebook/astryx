// Copyright (c) Meta Platforms, Inc. and affiliates.

import {act, render, screen} from '@testing-library/react';
import {useRef, type Ref} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  useScrollableArea,
  type ScrollAxis,
  type ScrollChaining,
} from './useScrollableArea';
import {
  findNearestScrollOwner,
  getRegisteredScrollOwnerState,
} from './scrollOwnerRegistry';
import {getLogicalAxisMapping} from './scrollGeometry';

interface FixtureProps {
  axis?: ScrollAxis;
  chaining?: ScrollChaining;
  externalRef?: Ref<HTMLDivElement>;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
}

function Fixture({
  axis = 'inline',
  chaining = 'allow',
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
    scrollChaining: chaining,
  });

  return (
    <>
      <div
        data-testid="viewport"
        {...getViewportProps({
          ref: externalRef,
          onScroll,
          style: {overflowX: 'auto', overflowY: 'auto'},
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
  });

  afterEach(() => {
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

  it('removes a lost tab stop without moving current focus', () => {
    render(<Fixture />);
    const viewport = screen.getByTestId('viewport');
    makeMeasurable(viewport);
    setGeometry(viewport, {scrollWidth: 180});
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();

    viewport.focus();
    expect(document.activeElement).toBe(viewport);
    setGeometry(viewport, {scrollWidth: 100});
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();

    expect(viewport).not.toHaveAttribute('tabindex');
    expect(document.activeElement).toBe(viewport);
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
});
