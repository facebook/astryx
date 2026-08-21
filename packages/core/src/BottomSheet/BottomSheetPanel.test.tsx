// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetPanel.test.tsx
 * @input Uses vitest, Testing Library, BottomSheetPanel
 * @output Tests the shared sheet surface motion contract
 * @position Internal presentation tests shared by standalone and switcher modes
 */

import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  BottomSheetPanel,
  type BottomSheetPanelMotion,
  type BottomSheetPanelState,
} from './BottomSheetPanel';

const panelTransitionStyle = {
  transitionProperty: 'transform, opacity',
  transitionDuration: '410ms',
  transitionDelay: '0ms',
};

beforeEach(() => {
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

function renderPanel(
  state: BottomSheetPanelState,
  callbacks: {
    onMotionStart?: (motion: BottomSheetPanelMotion) => void;
    onMotionComplete?: (motion: BottomSheetPanelMotion) => void;
  } = {},
) {
  return render(
    <BottomSheetPanel
      state={state}
      height="hug"
      style={panelTransitionStyle}
      onDismiss={() => {}}
      onScrimOpacity={() => {}}
      onMotionStart={callbacks.onMotionStart}
      onMotionComplete={callbacks.onMotionComplete}>
      Panel content
    </BottomSheetPanel>,
  );
}

function getPanel(): HTMLElement {
  const panel = screen
    .getByText('Panel content')
    .closest<HTMLElement>('.astryx-bottom-sheet');
  if (panel == null) {
    throw new Error('BottomSheetPanel surface not found');
  }
  return panel;
}

describe('BottomSheetPanel', () => {
  it('reports entrance completion only for the surface transform', () => {
    const onMotionStart = vi.fn();
    const onMotionComplete = vi.fn();
    renderPanel(
      {kind: 'open', entering: true},
      {onMotionStart, onMotionComplete},
    );

    expect(onMotionStart).toHaveBeenCalledWith('entering');
    fireEvent.transitionEnd(getPanel(), {propertyName: 'opacity'});
    expect(onMotionComplete).not.toHaveBeenCalled();
    fireEvent.transitionEnd(getPanel(), {propertyName: 'transform'});
    expect(onMotionComplete).toHaveBeenCalledWith('entering');
  });

  it('completes a retained-sheet reactivation without waiting for a new entrance', () => {
    const onMotionComplete = vi.fn();
    const {rerender} = render(
      <BottomSheetPanel
        state={{kind: 'retained', motion: 'covered', alignmentOffset: 0}}
        height="hug"
        style={panelTransitionStyle}
        onDismiss={() => {}}
        onScrimOpacity={() => {}}
        onMotionComplete={onMotionComplete}>
        Panel content
      </BottomSheetPanel>,
    );

    rerender(
      <BottomSheetPanel
        state={{kind: 'open', entering: true}}
        height="hug"
        style={panelTransitionStyle}
        onDismiss={() => {}}
        onScrimOpacity={() => {}}
        onMotionComplete={onMotionComplete}>
        Panel content
      </BottomSheetPanel>,
    );

    expect(onMotionComplete).toHaveBeenCalledWith('entering');
  });

  it('applies the switcher alignment offset to a retained surface', () => {
    renderPanel({
      kind: 'retained',
      motion: 'aligning',
      alignmentOffset: 120,
    });

    expect(getPanel()).toHaveStyle({transform: 'translateY(120px)'});
  });

  it('maps exit and fade completion to their respective CSS properties', () => {
    const onMotionComplete = vi.fn();
    const {rerender} = renderPanel(
      {kind: 'retained', motion: 'fading', alignmentOffset: 0},
      {onMotionComplete},
    );

    fireEvent.transitionEnd(getPanel(), {propertyName: 'opacity'});
    expect(onMotionComplete).toHaveBeenLastCalledWith('fading');

    rerender(
      <BottomSheetPanel
        state={{kind: 'exiting'}}
        height="hug"
        style={panelTransitionStyle}
        onDismiss={() => {}}
        onScrimOpacity={() => {}}
        onMotionComplete={onMotionComplete}>
        Panel content
      </BottomSheetPanel>,
    );
    fireEvent.transitionEnd(getPanel(), {propertyName: 'transform'});
    expect(onMotionComplete).toHaveBeenLastCalledWith('exiting');
  });

  it('completes immediately when the rendered transition is disabled', () => {
    vi.mocked(matchMedia).mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    const onMotionComplete = vi.fn();
    render(
      <BottomSheetPanel
        state={{kind: 'open', entering: true}}
        height="hug"
        onDismiss={() => {}}
        onScrimOpacity={() => {}}
        onMotionComplete={onMotionComplete}>
        Panel content
      </BottomSheetPanel>,
    );

    expect(onMotionComplete).toHaveBeenCalledWith('entering');
  });

  it('derives its transition backstop from the rendered timing', () => {
    vi.useFakeTimers();
    try {
      const onMotionComplete = vi.fn();
      render(
        <BottomSheetPanel
          state={{kind: 'open', entering: true}}
          height="hug"
          style={{
            transitionProperty: 'transform, opacity',
            transitionDuration: '0.5s, 200ms',
            transitionDelay: '100ms, 0ms',
          }}
          onDismiss={() => {}}
          onScrimOpacity={() => {}}
          onMotionComplete={onMotionComplete}>
          Panel content
        </BottomSheetPanel>,
      );

      void act(() => vi.advanceTimersByTime(649));
      expect(onMotionComplete).not.toHaveBeenCalled();
      void act(() => vi.advanceTimersByTime(1));
      expect(onMotionComplete).toHaveBeenCalledWith('entering');
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not detach a stable public ref during an ordinary rerender', () => {
    const panelRef = vi.fn();
    const {rerender, unmount} = render(
      <BottomSheetPanel
        ref={panelRef}
        state={{kind: 'open', entering: false}}
        height="hug"
        onDismiss={() => {}}
        onScrimOpacity={() => {}}>
        First render
      </BottomSheetPanel>,
    );

    expect(panelRef).toHaveBeenCalledTimes(1);
    rerender(
      <BottomSheetPanel
        ref={panelRef}
        state={{kind: 'open', entering: false}}
        height="hug"
        onDismiss={() => {}}
        onScrimOpacity={() => {}}>
        Second render
      </BottomSheetPanel>,
    );
    expect(panelRef).toHaveBeenCalledTimes(1);

    unmount();
    expect(panelRef).toHaveBeenLastCalledWith(null);
    expect(panelRef).toHaveBeenCalledTimes(2);
  });

  it('floats the handle bar over content that starts at the sheet top edge', () => {
    renderPanel({kind: 'open', entering: false});

    const bar = getPanel().querySelector<HTMLElement>(
      'div[aria-hidden="true"]',
    );
    if (bar == null) {
      throw new Error('handle bar not found');
    }
    const body = bar.nextElementSibling as HTMLElement;

    // Out of flow: the bar costs the content no layout space. That is the
    // point of it -- the content sits closer to the sheet's top edge, and
    // scrolled content passes beneath the pill rather than stopping at a
    // hard edge.
    expect(getComputedStyle(bar).position).toBe('absolute');

    // So the body must not reserve room for it. A top padding here would
    // push the content back down and undo the change.
    expect(getComputedStyle(body).paddingTop).toBe('');
  });

  // The pill is only legible over the content riding up beneath it because
  // the bar carries a backdrop; without it, text runs straight through the
  // pill. jsdom's StyleX runtime does not inject the rule, so assert on the
  // style definition itself (same approach as AspectRatio's reset.css tests).
  it('backs the floating handle bar with a surface gradient', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, './BottomSheetPanel.tsx'),
      'utf-8',
    );

    const handleBar = source.match(/handleBar: \{([\s\S]*?)\n {2}\},/);
    expect(handleBar).not.toBeNull();
    expect(handleBar![1]).toContain("position: 'absolute'");
    expect(handleBar![1]).toContain('linear-gradient(to bottom');
    expect(handleBar![1]).toContain("colorVars['--color-background-surface']");
  });

  // In dark mode the surface fill and the scrim sit a few RGB steps apart and
  // the drop shadow is black on near-black, so the fill alone leaves the
  // sheet's left and right edges invisible against the scrim. A hairline on
  // the scrim-facing edges is what draws them. Asserted on the style
  // definition for the same reason as the test above.
  it('draws a hairline on the three edges that face the scrim', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, './BottomSheetPanel.tsx'),
      'utf-8',
    );

    const sheet = source.match(/\n {2}sheet: \{([\s\S]*?)\n {2}\},/);
    expect(sheet).not.toBeNull();
    for (const edge of [
      'borderBlockStart',
      'borderInlineStart',
      'borderInlineEnd',
    ]) {
      expect(sheet![1]).toContain(`${edge}Width: borderVars['--border-width']`);
      expect(sheet![1]).toContain(`${edge}Style: 'solid'`);
      expect(sheet![1]).toContain(`${edge}Color: colorVars['--color-border']`);
    }
    // The block-end edge sits below the viewport, under the overscroll
    // padding, so it carries no hairline to draw.
    expect(sheet![1]).not.toContain('borderBlockEndWidth');
  });

  // A theme that packs an inset ring into --shadow-high (the bundled themes all
  // add one in dark mode) draws it just inside the sheet, where an opaque
  // content wrapper such as Section paints over it -- so it showed only in the
  // gap below the content and the side edges appeared to change width partway
  // down. The scrolling body paints the surface across the whole inner box to
  // hide the ring evenly.
  it('paints the surface across the scrolling body so the edge stays uniform', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, './BottomSheetPanel.tsx'),
      'utf-8',
    );

    const body = source.match(/\n {2}body: \{([\s\S]*?)\n {2}\},/);
    expect(body).not.toBeNull();
    expect(body![1]).toContain(
      "backgroundColor: colorVars['--color-background-surface']",
    );
  });
});
