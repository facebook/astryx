// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ResizeHandle.test.tsx
 * @input Uses vitest, @testing-library/react, useResizable, ResizeHandle
 * @output Unit tests for ResizeHandle keyboard operability and ARIA state
 * @position Testing; validates ResizeHandle.tsx implementation
 *
 * SYNC: When ResizeHandle.tsx changes, update tests to match new behavior
 *
 * These tests guard the WAI-ARIA window-splitter keyboard contract: the
 * keydown handler must live on the focusable `role="separator"` element.
 * Keyboard resizing is pure state math in useResizable (no layout
 * measurement), so the observable effect asserted here is aria-valuenow,
 * which is bound to the region's `_size`.
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {ResizeHandle} from './ResizeHandle';
import type {ResizeHandleProps} from './ResizeHandle';
import {useResizable} from './useResizable';
import type {ResizableProps, UseResizableSingleConfig} from './useResizable';

const KEYBOARD_STEP = 10;
const KEYBOARD_LARGE_STEP = 50;

function Harness({
  config,
  handleProps,
}: {
  config?: UseResizableSingleConfig;
  handleProps?: Partial<ResizeHandleProps>;
}) {
  const region = useResizable(
    config ?? {defaultSize: 200, minSizePx: 100, maxSizePx: 400},
  );
  return (
    <ResizeHandle resizable={region.props} label="Resize" {...handleProps} />
  );
}

function getSeparator(): HTMLElement {
  return screen.getByRole('separator');
}

describe('ResizeHandle', () => {
  // --- ARIA wiring ---

  it('exposes the region size and bounds via ARIA', () => {
    render(<Harness />);
    const separator = getSeparator();
    expect(separator).toHaveAttribute('aria-valuenow', '200');
    expect(separator).toHaveAttribute('aria-valuemin', '100');
    expect(separator).toHaveAttribute('aria-valuemax', '400');
    // Horizontal layout splits along the vertical axis.
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveAttribute('aria-label', 'Resize');
  });

  it('makes the separator focusable', () => {
    render(<Harness />);
    const separator = getSeparator();
    expect(separator).toHaveAttribute('tabindex', '0');
    act(() => separator.focus());
    expect(separator).toHaveFocus();
  });

  // --- Keyboard resizing (the fix: handler lives on the focused separator) ---

  it('grows the panel by a step on ArrowRight', () => {
    render(<Harness />);
    const separator = getSeparator();
    act(() => separator.focus());
    fireEvent.keyDown(separator, {key: 'ArrowRight'});
    expect(separator).toHaveAttribute(
      'aria-valuenow',
      String(200 + KEYBOARD_STEP),
    );
  });

  it('shrinks the panel by a step on ArrowLeft', () => {
    render(<Harness />);
    const separator = getSeparator();
    act(() => separator.focus());
    fireEvent.keyDown(separator, {key: 'ArrowLeft'});
    expect(separator).toHaveAttribute(
      'aria-valuenow',
      String(200 - KEYBOARD_STEP),
    );
  });

  it('uses the large step when Shift is held', () => {
    render(<Harness />);
    const separator = getSeparator();
    act(() => separator.focus());
    fireEvent.keyDown(separator, {key: 'ArrowRight', shiftKey: true});
    expect(separator).toHaveAttribute(
      'aria-valuenow',
      String(200 + KEYBOARD_LARGE_STEP),
    );
  });

  it('jumps to the minimum on Home', () => {
    render(<Harness />);
    const separator = getSeparator();
    act(() => separator.focus());
    fireEvent.keyDown(separator, {key: 'Home'});
    expect(separator).toHaveAttribute('aria-valuenow', '100');
  });

  it('jumps to the maximum on End', () => {
    render(<Harness />);
    const separator = getSeparator();
    act(() => separator.focus());
    fireEvent.keyDown(separator, {key: 'End'});
    expect(separator).toHaveAttribute('aria-valuenow', '400');
  });

  it('resizes along the block axis for a vertical handle', () => {
    render(
      <Harness
        config={{defaultSize: 200, minSizePx: 100, maxSizePx: 400}}
        handleProps={{direction: 'vertical'}}
      />,
    );
    const separator = getSeparator();
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    act(() => separator.focus());
    fireEvent.keyDown(separator, {key: 'ArrowDown'});
    expect(separator).toHaveAttribute(
      'aria-valuenow',
      String(200 + KEYBOARD_STEP),
    );
    fireEvent.keyDown(separator, {key: 'ArrowUp'});
    expect(separator).toHaveAttribute('aria-valuenow', '200');
  });

  it('collapses on Enter when the region is collapsible', () => {
    render(
      <Harness
        config={{
          defaultSize: 200,
          minSizePx: 100,
          maxSizePx: 400,
          collapsible: true,
        }}
      />,
    );
    const separator = getSeparator();
    act(() => separator.focus());
    fireEvent.keyDown(separator, {key: 'Enter'});
    expect(separator).toHaveAttribute('aria-valuenow', '0');
  });

  // --- Disabled guard ---

  it('ignores keyboard input when disabled', () => {
    render(<Harness handleProps={{isDisabled: true}} />);
    const separator = getSeparator();
    expect(separator).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(separator, {key: 'ArrowRight'});
    expect(separator).toHaveAttribute('aria-valuenow', '200');
  });

  // --- Drag listener lifecycle ---

  it('stops driving the region and releases window listeners when unmounted mid-drag', () => {
    const resizable: ResizableProps = {
      _size: 200,
      _isCollapsed: false,
      _onResizeStart: vi.fn(),
      _onResizeMove: vi.fn(),
      _onResizeEnd: vi.fn(),
      _minSizePx: 100,
      _maxSizePx: 400,
      _snaps: [],
      _collapsedSize: 40,
      _collapsible: false,
      _isResizableProps: true,
    };
    const {unmount} = render(
      <ResizeHandle resizable={resizable} label="Resize" />,
    );
    const separator = screen.getByRole('separator');
    const hitArea = separator.firstElementChild as HTMLElement;

    // Start a drag and confirm moves reach the region.
    fireEvent.pointerDown(hitArea, {clientX: 0, clientY: 0});
    expect(resizable._onResizeStart).toHaveBeenCalledTimes(1);
    fireEvent.pointerMove(window, {clientX: 10, clientY: 0});
    expect(resizable._onResizeMove).toHaveBeenCalledTimes(1);

    // Unmount mid-drag: the window listeners must be torn down, so further
    // pointer moves no longer resize the (still-mounted) region, and the
    // body cursor/user-select overrides are released.
    unmount();
    fireEvent.pointerMove(window, {clientX: 50, clientY: 0});
    expect(resizable._onResizeMove).toHaveBeenCalledTimes(1);
    expect(document.body.style.cursor).toBe('');
    expect(document.body.style.userSelect).toBe('');
  });

  // --- Prop composition (ordering choice: handler sits after {...props}) ---

  it('runs a consumer onKeyDown alongside keyboard resizing', () => {
    const onKeyDown = vi.fn();
    render(<Harness handleProps={{onKeyDown}} />);
    const separator = getSeparator();
    act(() => separator.focus());
    fireEvent.keyDown(separator, {key: 'ArrowRight'});
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(separator).toHaveAttribute(
      'aria-valuenow',
      String(200 + KEYBOARD_STEP),
    );
  });
});
