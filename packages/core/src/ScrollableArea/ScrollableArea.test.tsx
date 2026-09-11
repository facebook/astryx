// Copyright (c) Meta Platforms, Inc. and affiliates.

import {readFileSync} from 'node:fs';
import {act, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ScrollableArea} from './ScrollableArea';

function setGeometry(
  element: HTMLElement,
  values: Partial<
    Pick<
      HTMLElement,
      'clientWidth' | 'clientHeight' | 'scrollWidth' | 'scrollHeight'
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

describe('ScrollableArea', () => {
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

  afterEach(() => vi.unstubAllGlobals());

  function flushFrame() {
    void act(() => {
      const pending = frames.splice(0);
      pending.forEach(callback => callback(performance.now()));
    });
  }

  it('renders one native viewport and one real content box', () => {
    render(
      <ScrollableArea label="Messages" data-testid="viewport">
        <p>Message history</p>
      </ScrollableArea>,
    );

    const viewport = screen.getByTestId('viewport');
    expect(viewport).toHaveAccessibleName('Messages');
    expect(viewport).toHaveAttribute('role', 'group');
    expect(viewport).toHaveAttribute('data-scroll-axis', 'block');
    expect(viewport).not.toHaveAttribute('tabindex');
    expect(viewport.children).toHaveLength(1);
    expect(viewport.firstElementChild).toHaveAttribute('data-scroll-content');
    expect(viewport).toHaveTextContent('Message history');
  });

  it('becomes keyboard reachable only when the requested axis is effective', () => {
    render(
      <ScrollableArea
        axis="block"
        label="Messages"
        data-testid="viewport"
        style={{height: 100}}>
        <p>Message history</p>
      </ScrollableArea>,
    );
    const viewport = screen.getByTestId('viewport');
    setGeometry(viewport, {
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 180,
    });

    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(viewport).toHaveAttribute('tabindex', '0');
    expect(viewport).toHaveAttribute('data-scrollable-block', 'true');

    setGeometry(viewport, {scrollHeight: 100});
    viewport.focus();
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(viewport).not.toHaveAttribute('tabindex');
    expect(document.activeElement).toBe(viewport);
  });

  it('keeps viewport props, styles, class names, events, and refs', () => {
    const onClick = vi.fn();
    const ref = vi.fn();
    render(
      <ScrollableArea
        label="Results"
        role="region"
        ref={ref}
        onClick={onClick}
        className="consumer-class"
        style={{maxHeight: 200}}
        data-testid="viewport">
        Results
      </ScrollableArea>,
    );

    const viewport = screen.getByTestId('viewport');
    viewport.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith(viewport);
    expect(viewport).toHaveClass('astryx-scrollable-area', 'consumer-class');
    expect(viewport.style.maxHeight).toBe('200px');
    expect(viewport).toHaveAttribute('role', 'region');
  });

  it('reflects logical axis and chaining intent without containing a fitting area', () => {
    render(
      <ScrollableArea
        axis="both"
        label="Canvas"
        scrollChaining="contain"
        data-testid="viewport">
        Canvas
      </ScrollableArea>,
    );
    const viewport = screen.getByTestId('viewport');
    expect(viewport).toHaveAttribute('data-axis', 'both');
    expect(viewport).toHaveAttribute('data-scroll-axis', 'both');
    expect(viewport.style.overscrollBehaviorX).toBe('auto');
    expect(viewport.style.overscrollBehaviorY).toBe('auto');
  });

  it('keeps logical overflow and content sizing for writing-mode changes', () => {
    const {rerender} = render(
      <ScrollableArea axis="inline" label="Timeline" data-testid="viewport">
        Timeline
      </ScrollableArea>,
    );
    const viewport = screen.getByTestId('viewport');
    const content = viewport.firstElementChild as HTMLElement;
    expect(viewport.style.overflowInline).toBe('auto');
    expect(viewport.style.overflowBlock).toBe('hidden');
    expect(content.style.inlineSize).toBe('max-content');
    expect(content.style.minInlineSize).toBe('100%');

    rerender(
      <ScrollableArea axis="block" label="Timeline" data-testid="viewport">
        Timeline
      </ScrollableArea>,
    );
    expect(viewport.style.overflowInline).toBe('hidden');
    expect(viewport.style.overflowBlock).toBe('auto');
    expect(content.style.inlineSize).toBe('');
  });

  it('uses the neutral token for native scrollbar color with a transparent track', () => {
    const source = stylesSource();
    expect(source).toContain("colorVars['--color-neutral']");
    expect(source).toContain('transparent');
    expect(source).toContain("'@media (forced-colors: active)': 'auto'");
  });

  it('guards scroll-state query containment as a progressive enhancement', () => {
    const source = stylesSource();
    expect(source).toContain("'@supports (container-type: scroll-state)'");
    expect(source).toContain("'scroll-state'");
  });
});

function stylesSource(): string {
  // This focused source assertion complements the built-CSS browser probe: it
  // keeps the capability guard and token reference reviewable at unit-test speed.
  return readFileSync(
    'packages/core/src/ScrollableArea/ScrollableArea.tsx',
    'utf8',
  );
}
