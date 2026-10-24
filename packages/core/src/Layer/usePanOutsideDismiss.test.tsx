// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file usePanOutsideDismiss.test.tsx
 * @input vitest (jsdom), Testing Library, usePanOutsideDismiss
 * @output Checks that a touch-presented layer closes when a touch that went
 *   down outside it is taken by the browser for a pan (`pointercancel`), and
 *   for nothing else: not a tap outside (the light dismiss's), not a touch
 *   that starts inside or on the trigger, not a mouse, not a layer presented
 *   for a mouse, not a closed layer
 * @position Testing; real pans are proven in the DropdownMenu and Popover
 *   touch-motion browser specs
 */

import {fireEvent, render} from '@testing-library/react';
import React, {useRef} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {usePanOutsideDismiss} from './usePanOutsideDismiss';

function Harness({
  isOpen = true,
  isTouch = true,
  onDismiss,
}: {
  isOpen?: boolean;
  isTouch?: boolean;
  onDismiss: () => void;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  usePanOutsideDismiss({
    isOpen,
    isTouchPresentation: () => isTouch,
    inside: [layerRef, triggerRef],
    onDismiss,
  });
  return (
    <>
      <button type="button" ref={triggerRef}>
        Trigger
      </button>
      <div ref={layerRef}>
        <p>Layer content</p>
      </div>
      <p>Page content</p>
    </>
  );
}

/** A touch the browser takes for a scroll: down, then cancelled. */
function pan(element: Element, pointerType = 'touch', pointerId = 1) {
  fireEvent.pointerDown(element, {pointerType, pointerId});
  fireEvent.pointerCancel(element, {pointerType, pointerId});
}

describe('usePanOutsideDismiss', () => {
  it('closes the layer when a pan that starts outside it takes the touch', () => {
    const onDismiss = vi.fn();
    const {getByText} = render(<Harness onDismiss={onDismiss} />);
    pan(getByText('Page content'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('leaves a tap outside to the light dismiss, which acts at the lift', () => {
    const onDismiss = vi.fn();
    const {getByText} = render(<Harness onDismiss={onDismiss} />);
    const page = getByText('Page content');
    fireEvent.pointerDown(page, {pointerType: 'touch', pointerId: 1});
    fireEvent.pointerUp(page, {pointerType: 'touch', pointerId: 1});
    // A later cancel of that finished touch is no pan.
    fireEvent.pointerCancel(page, {pointerType: 'touch', pointerId: 1});
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('keeps the layer for a pan that starts inside it or on its trigger', () => {
    const onDismiss = vi.fn();
    const {getByText} = render(<Harness onDismiss={onDismiss} />);
    pan(getByText('Layer content'));
    pan(getByText('Trigger'));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('ignores a mouse, a layer presented for a mouse, and a closed layer', () => {
    const onDismiss = vi.fn();
    const {getByText, rerender} = render(<Harness onDismiss={onDismiss} />);
    pan(getByText('Page content'), 'mouse');
    rerender(<Harness isOpen={false} onDismiss={onDismiss} />);
    rerender(<Harness isTouch={false} onDismiss={onDismiss} />);
    pan(getByText('Page content'));
    rerender(<Harness isOpen={false} onDismiss={onDismiss} />);
    pan(getByText('Page content'));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('tracks each finger on its own', () => {
    const onDismiss = vi.fn();
    const {getByText} = render(<Harness onDismiss={onDismiss} />);
    // A finger in the layer and one outside: only the outside one's pan counts.
    fireEvent.pointerDown(getByText('Layer content'), {
      pointerType: 'touch',
      pointerId: 1,
    });
    fireEvent.pointerCancel(getByText('Layer content'), {
      pointerType: 'touch',
      pointerId: 1,
    });
    expect(onDismiss).not.toHaveBeenCalled();
    pan(getByText('Page content'), 'touch', 2);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
