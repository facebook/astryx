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
    // The panel's real size is 0, but aria-valuenow must never drop below
    // aria-valuemin (WCAG 4.1.2) — it clamps to the minimum and the state
    // is announced via aria-valuetext instead.
    expect(separator).toHaveAttribute('aria-valuenow', '100');
    expect(separator).toHaveAttribute('aria-valuetext', 'Collapsed');
  });

  it('keeps aria-valuenow >= aria-valuemin and announces "Collapsed" while collapsed', () => {
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

    const valueNow = Number(separator.getAttribute('aria-valuenow'));
    const valueMin = Number(separator.getAttribute('aria-valuemin'));
    expect(valueNow).toBeGreaterThanOrEqual(valueMin);
    expect(separator).toHaveAttribute('aria-valuetext', 'Collapsed');
  });

  it('removes aria-valuetext when the panel is expanded', () => {
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
    expect(separator).not.toHaveAttribute('aria-valuetext');

    act(() => separator.focus());
    fireEvent.keyDown(separator, {key: 'Enter'}); // collapse
    expect(separator).toHaveAttribute('aria-valuetext', 'Collapsed');

    fireEvent.keyDown(separator, {key: 'Enter'}); // expand again
    expect(separator).not.toHaveAttribute('aria-valuetext');
    expect(separator).toHaveAttribute('aria-valuenow', '100');
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

  // --- RTL pointer-drag direction ---

  it('drives the region with the raw pointer delta under LTR', () => {
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
    render(<ResizeHandle resizable={resizable} label="Resize" />);
    const hitArea = screen.getByRole('separator')
      .firstElementChild as HTMLElement;

    fireEvent.pointerDown(hitArea, {clientX: 0, clientY: 0});
    // Pointer moves +40px to the right → panel grows by +40 under LTR.
    fireEvent.pointerMove(window, {clientX: 40, clientY: 0});
    expect(resizable._onResizeMove).toHaveBeenLastCalledWith(40);
  });

  it('inverts the pointer delta under RTL so dragging resizes intuitively', () => {
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
    // Under RTL the start panel sits on the RIGHT, so a pointer move to the
    // right (+clientX) must SHRINK it — the delta is inverted. The handle reads
    // its own computed `direction` via getRTLMultiplier(); jsdom doesn't resolve
    // inherited `direction`, so force it on the separator (the handle element),
    // mirroring the Slider RTL pointer-mapping test precedent.
    render(<ResizeHandle resizable={resizable} label="Resize" />);
    const separator = screen.getByRole('separator');
    const hitArea = separator.firstElementChild as HTMLElement;

    const realGetComputedStyle = window.getComputedStyle;
    const gcsSpy = vi
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((el: Element, pseudo?: string | null) => {
        if (el === separator) {
          return {direction: 'rtl'} as CSSStyleDeclaration;
        }
        return realGetComputedStyle(el, pseudo ?? undefined);
      });

    fireEvent.pointerDown(hitArea, {clientX: 0, clientY: 0});
    // Same +40px physical move as LTR, but mirrored → −40 delta under RTL.
    fireEvent.pointerMove(window, {clientX: 40, clientY: 0});
    expect(resizable._onResizeMove).toHaveBeenLastCalledWith(-40);

    gcsSpy.mockRestore();
  });

  // --- Hit-area geometry (grab zone tracks the visible pill) ---

  it('anchors the biased grab zone with the pill offset and a dir-flipped centering shift', () => {
    // For an off-center pill the hit area must reuse the pill's physical offset
    // construction (anchored at insetInlineStart:0) rather than a divider-
    // relative 50% anchor + percentage bias, so the two stay aligned in LTR and
    // RTL. The half-width-difference centering shift (6.5px) is inline, so it
    // flips physical sign under RTL: `- 6.5px` (LTR) vs `+ 6.5px` (RTL). See the
    // Playwright measurement (hitArea.center === pill.center, 0px offset in both
    // directions) for the geometric proof; here we lock the transform shape.
    render(<Harness handleProps={{pillPlacement: 'start'}} />);
    const hitArea = getSeparator().firstElementChild as HTMLElement;
    expect(hitArea.className).toContain('hitAreaOffsetX');
    const style = hitArea.getAttribute('style') ?? '';
    // LTR (default) branch subtracts the centering shift; RTL branch adds it.
    expect(style).toContain('- 6.5px');
    expect(style).toContain('+ 6.5px');
  });

  it('centers the grab zone on the divider when the pill is centered (no bias)', () => {
    render(<Harness handleProps={{pillPlacement: 'center'}} />);
    const hitArea = getSeparator().firstElementChild as HTMLElement;
    // Centered via the shared rtlStyles.centerInline helper (direction-symmetric
    // left+translateX), not a biased offset.
    expect(hitArea.className).toContain('centerInline');
    expect(hitArea.className).not.toContain('hitAreaOffsetX');
  });

  // The grab zone is stretched along the handle by its 0/0 insets, so anything
  // that moves it across the handle displaces the whole zone off the divider —
  // a percentage does it by half the handle's length, so the taller the panel
  // the larger the dead region, and nothing about it is visible on screen.
  it.each([
    ['horizontal' as const, 'translateX'],
    ['vertical' as const, 'translateY'],
  ])('offsets the %s grab zone along the pill axis only', (direction, axis) => {
    render(<Harness handleProps={{direction, pillPlacement: 'start'}} />);
    const hitArea = getSeparator().firstElementChild as HTMLElement;
    const translates = (hitArea.getAttribute('style') ?? '')
      .split(';')
      .map(decl => decl.split(/:(.*)/s)[1]?.trim() ?? '')
      .filter(value => value.startsWith('translate'));

    // Both the LTR and RTL declarations of the horizontal offset.
    expect(translates.length).toBeGreaterThan(0);
    for (const translate of translates) {
      expect(translate.startsWith(`${axis}(`)).toBe(true);
    }
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
