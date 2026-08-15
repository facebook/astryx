// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetPanel.test.tsx
 * @input Uses vitest, Testing Library, BottomSheetPanel
 * @output Tests the shared sheet surface motion contract
 * @position Internal presentation tests shared by standalone and switcher modes
 */

import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {BottomSheetPanel, type BottomSheetPanelState} from './BottomSheetPanel';

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
    onMotionStart?: ReturnType<typeof vi.fn>;
    onMotionComplete?: ReturnType<typeof vi.fn>;
  } = {},
) {
  return render(
    <BottomSheetPanel
      state={state}
      height="hug"
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
        onDismiss={() => {}}
        onScrimOpacity={() => {}}
        onMotionComplete={onMotionComplete}>
        Panel content
      </BottomSheetPanel>,
    );
    fireEvent.transitionEnd(getPanel(), {propertyName: 'transform'});
    expect(onMotionComplete).toHaveBeenLastCalledWith('exiting');
  });
});
