// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ResizeHandle.tsx
 * @input direction, isReversed, hasDivider, isAlwaysVisible, pillPlacement, ResizableProps
 * @output Styled drag handle with WAI-ARIA separator role and keyboard support
 * @position Between resizable panels; consumed directly by builders
 *
 * The handle element is 1px wide (the divider line itself), with an
 * absolutely-positioned wider hit area for pointer interaction.
 * Pill grip indicator can sit on either side of the divider (or centered)
 * via pillPlacement. Default 'auto' places the pill on the panel side and
 * flips when the panel collapses to 0px so it stays accessible.
 *
 * Pill placement uses a single stylex dynamic style that accepts a direction
 * multiplier (-1 or 1). The pill element has its own themeProps
 * ('resize-handle-pill') so themes can target size/shape directly.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {
  colorVars,
  durationVars,
  easeVars,
  radiusVars,
  spacingVars,
} from '../theme/tokens.stylex';
import {mergeProps, mergeRefs} from '../utils';
import type {ResizableProps} from './useResizable';
import {themeProps} from '../utils/themeProps';

const KEYBOARD_STEP = 10;
const KEYBOARD_LARGE_STEP = 50;

type PillPlacement = 'start' | 'end' | 'center' | 'auto';

function resolveEffectiveSide(
  pillPlacement: PillPlacement,
  isReversed: boolean,
  isCollapsed: boolean,
): 'start' | 'end' | 'center' {
  if (pillPlacement !== 'auto') {
    return pillPlacement;
  }
  const panelSide: 'start' | 'end' = isReversed ? 'end' : 'start';
  if (isCollapsed) {
    return panelSide === 'start' ? 'end' : 'start';
  }
  return panelSide;
}

/**
 * Hit area bias percentage. When the pill is off-center, the grab zone
 * shifts ~2:1 toward the pill so users can reach the visible grip easily.
 */
function hitAreaBias(effectiveSide: 'start' | 'end' | 'center'): string {
  if (effectiveSide === 'center') {
    return '50%';
  }
  return effectiveSide === 'start' ? '66.67%' : '33.33%';
}

const styles = stylex.create({
  handle: {
    position: 'relative',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorVars['--color-border'],
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: null,
      ':focus-visible': spacingVars['--spacing-0-5'],
    },
  },
  // Overlay mode — absolutely positioned inside the parent panel
  // instead of being a sibling in flex flow. Used when the handle
  // must stay within a parent's overflow: clip bounds.
  overlay: {
    position: 'absolute',
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  overlayHorizontal: {
    insetInlineEnd: 0,
    top: 0,
    bottom: 0,
    width: 'var(--resize-handle-hit-area, 16px)',
  },
  overlayVertical: {
    insetBlockEnd: 0,
    left: 0,
    right: 0,
    height: 'var(--resize-handle-hit-area, 16px)',
  },
  horizontal: {
    width: 1,
    height: '100%',
    cursor: 'col-resize',
  },
  vertical: {
    height: 1,
    width: '100%',
    cursor: 'row-resize',
  },
  noDividerHorizontal: {
    backgroundColor: 'transparent',
    width: 0,
  },
  noDividerVertical: {
    backgroundColor: 'transparent',
    height: 0,
  },
  handleHover: {
    backgroundColor: colorVars['--color-border'],
  },
  handleActive: {
    backgroundColor: colorVars['--color-border-emphasized'],
  },
  disabled: {
    cursor: 'default',
    pointerEvents: 'none',
  },

  hitArea: {
    position: 'absolute',
    zIndex: 1,
    touchAction: 'none',
    userSelect: 'none',
  },
  hitAreaHorizontal: {
    width: spacingVars['--spacing-4'],
    top: 0,
    bottom: 0,
    left: '50%',
    cursor: 'col-resize',
  },
  hitAreaVertical: {
    height: spacingVars['--spacing-4'],
    left: 0,
    right: 0,
    top: '50%',
    cursor: 'row-resize',
  },

  // Pill base — themes target .astryx-resize-handle-pill for size/shape.
  pill: {
    position: 'absolute',
    zIndex: 2,
    pointerEvents: 'none',
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-border'],
    transitionProperty: 'opacity, background-color, transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  pillHorizontal: {
    width: 3,
    height: spacingVars['--spacing-8'],
  },
  pillVertical: {
    width: spacingVars['--spacing-8'],
    height: 3,
  },
  pillHidden: {opacity: 0},
  pillVisible: {opacity: 1},
  pillHover: {
    opacity: 1,
    backgroundColor: colorVars['--color-border'],
  },
  pillActive: {
    opacity: 1,
    backgroundColor: colorVars['--color-border-emphasized'],
  },
});

// Dynamic styles — avoids inline style overrides.
// Each axis gets its own function since StyleX requires static structure.
const dynamicStyles = stylex.create({
  hitAreaBiasX: (pct: string) => ({
    transform: `translateX(-${pct})`,
  }),
  hitAreaBiasY: (pct: string) => ({
    transform: `translateY(-${pct})`,
  }),
  pillOffsetX: (dir: number) => ({
    left: 0,
    transform: `translate(calc(${dir} * (100% + ${spacingVars['--spacing-1']})), -50%)`,
  }),
  // Vertical offset: no rotation — use explicit landscape dimensions.
  // Rotation + offset creates confusing coordinate math since translate
  // operates in pre-rotation local space.
  pillOffsetY: (dir: number) => ({
    top: 0,
    transform: `translate(-50%, calc(${dir} * (100% + ${spacingVars['--spacing-1']})))`,
  }),
});

export interface ResizeHandleProps extends Omit<
  BaseProps<HTMLDivElement>,
  'style'
> {
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Layout direction — determines cursor and indicator orientation.
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * Positioning mode. `'inline'` (default) puts the handle in normal
   * flex flow between siblings. `'overlay'` uses absolute positioning
   * so the handle sits inside a parent panel's bounds — useful when
   * the parent has `overflow: clip`.
   * @default 'inline'
   */
  position?: 'inline' | 'overlay';

  /**
  /**
   * Reverse the drag direction. Use when the handle controls a panel
   * on the end/right/bottom side.
   * @default false
   */
  isReversed?: boolean;

  /**
   * Whether the handle is disabled (not interactive).
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Show a 1px divider line. The line IS the handle — it takes only
   * 1px in the layout with a wider invisible hit area for interaction.
   * Ignored in overlay mode.
   * @default false
   */
  hasDivider?: boolean;

  /**
   * Show the pill grip indicator at rest. Set to `false` to only
   * reveal the pill on hover/focus.
   * @default true
   */
  isAlwaysVisible?: boolean;

  /**
   * Which side of the divider line the pill sits on.
   * - `'auto'` — panel side by default, flips when panel is collapsed to 0px
   * - `'start'` — left (horizontal) or top (vertical)
   * - `'end'` — right (horizontal) or bottom (vertical)
   * - `'center'` — centered on the divider line (original behavior)
   * @default 'auto'
   */
  pillPlacement?: PillPlacement;

  /**
   * Accessible label for the separator.
   * @default 'Resize handle'
   */
  label?: string;

  /** Resize props from useResizable region. */
  resizable?: ResizableProps;

  /** Custom handle content. Overrides the default pill. */
  children?: ReactNode;
}

/**
 * Draggable resize handle placed between resizable panels. Renders as a thin
 * divider line with a wider invisible hit area and optional pill grip indicator.
 * Supports keyboard resizing via arrow keys and WAI-ARIA separator role.
 *
 * The pill element uses class `astryx-resize-handle-pill` for theme targeting.
 *
 * @example
 * ```
 * <ResizeHandle
 *   resizable={sidebar.props}
 *   direction="horizontal"
 *   hasDivider />
 * ```
 */
export function ResizeHandle({
  direction = 'horizontal',
  position: positionMode = 'inline',
  isReversed = false,
  isDisabled = false,
  hasDivider = false,
  isAlwaysVisible = true,
  pillPlacement = 'auto',
  label = 'Resize handle',
  resizable,
  children,
  xstyle,
  className,
  ref,
  ...props
}: ResizeHandleProps) {
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isHorizontal = direction === 'horizontal';
  const isOverlay = positionMode === 'overlay';
  const sign = isReversed ? -1 : 1;
  const effectiveSide = resolveEffectiveSide(
    pillPlacement,
    isReversed,
    resizable?._isCollapsed ?? false,
  );

  const getRTLMultiplier = useCallback((): number => {
    const el = handleRef.current;
    if (!el) {
      return 1;
    }
    return getComputedStyle(el).direction === 'rtl' ? -1 : 1;
  }, []);

  const isInteracting = isHovered || isFocused;

  // --- Pointer drag ---
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isDisabled || !resizable) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      resizable._onResizeStart();
      const startPos = isHorizontal ? e.clientX : e.clientY;
      const rtl = isHorizontal ? getRTLMultiplier() : 1;
      document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';

      const onMove = (ev: PointerEvent) => {
        const currentPos = isHorizontal ? ev.clientX : ev.clientY;
        const delta = (currentPos - startPos) * rtl * sign;
        resizable._onResizeMove(delta);
      };
      const onUp = () => {
        cleanup();
        setIsDragging(false);
        resizable._onResizeEnd();
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
      const onCancel = () => {
        cleanup();
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
      function cleanup() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
    },
    [isDisabled, resizable, isHorizontal, getRTLMultiplier, sign],
  );

  // --- Keyboard ---
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isDisabled || !resizable) {
        return;
      }
      const step = e.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
      const rtl = isHorizontal ? getRTLMultiplier() : 1;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown': {
          e.preventDefault();
          resizable._onResizeStart();
          resizable._onResizeMove(step * (isHorizontal ? rtl : 1) * sign);
          resizable._onResizeEnd();
          break;
        }
        case 'ArrowLeft':
        case 'ArrowUp': {
          e.preventDefault();
          resizable._onResizeStart();
          resizable._onResizeMove(-step * (isHorizontal ? rtl : 1) * sign);
          resizable._onResizeEnd();
          break;
        }
        case 'Home': {
          e.preventDefault();
          resizable._onResizeStart();
          resizable._onResizeMove(resizable._minSizePx - resizable._size);
          resizable._onResizeEnd();
          break;
        }
        case 'End': {
          e.preventDefault();
          if (resizable._maxSizePx !== Infinity) {
            resizable._onResizeStart();
            resizable._onResizeMove(resizable._maxSizePx - resizable._size);
            resizable._onResizeEnd();
          }
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (resizable._collapsible) {
            resizable._onResizeStart();
            resizable._onResizeMove(
              resizable._isCollapsed ? resizable._minSizePx : -resizable._size,
            );
            resizable._onResizeEnd();
          }
          break;
        }
      }
    },
    [isDisabled, resizable, isHorizontal, getRTLMultiplier, sign],
  );

  // --- Double-click collapse ---
  const handleDoubleClick = useCallback(() => {
    if (isDisabled || !resizable || !resizable._collapsible) {
      return;
    }
    resizable._onResizeStart();
    resizable._onResizeMove(
      resizable._isCollapsed ? resizable._minSizePx : -resizable._size,
    );
    resizable._onResizeEnd();
  }, [isDisabled, resizable]);

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      if (isDragging) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isDragging]);

  // --- ARIA ---
  const ariaValueNow = resizable ? resizable._size : undefined;
  const ariaValueMin = resizable ? resizable._minSizePx : undefined;
  const ariaValueMax =
    resizable && resizable._maxSizePx !== Infinity
      ? resizable._maxSizePx
      : undefined;

  return (
    <div
      ref={mergeRefs(ref, handleRef)}
      role="separator"
      aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
      aria-valuenow={ariaValueNow}
      aria-valuemin={ariaValueMin}
      aria-valuemax={ariaValueMax}
      aria-label={label}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : 0}
      onDoubleClick={handleDoubleClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      data-resizing={isDragging || undefined}
      {...mergeProps(
        themeProps('resize-handle'),
        stylex.props(
          styles.handle,
          isOverlay && styles.overlay,
          isOverlay &&
            (isHorizontal ? styles.overlayHorizontal : styles.overlayVertical),
          !isOverlay && (isHorizontal ? styles.horizontal : styles.vertical),
          !isOverlay &&
            !hasDivider &&
            (isHorizontal
              ? styles.noDividerHorizontal
              : styles.noDividerVertical),
          !isOverlay &&
            hasDivider &&
            isInteracting &&
            !isDragging &&
            styles.handleHover,
          !isOverlay && hasDivider && isDragging && styles.handleActive,
          isDisabled && styles.disabled,
          xstyle,
        ),
        className,
      )}
      {...props}
      // Keyboard resizing must fire from the focusable separator, not a child:
      // keydown fires on the focused element and bubbles up, so a handler on a
      // descendant never runs (per the WAI-ARIA window-splitter pattern).
      // Placed after {...props} and composed with any consumer onKeyDown so
      // this accessibility-critical handler can't be clobbered by a passed prop.
      onKeyDown={e => {
        props.onKeyDown?.(e);
        handleKeyDown(e);
      }}>
      {/* Wider invisible hit area for pointer interaction */}
      <div
        {...stylex.props(
          styles.hitArea,
          isHorizontal ? styles.hitAreaHorizontal : styles.hitAreaVertical,
          isHorizontal
            ? dynamicStyles.hitAreaBiasX(hitAreaBias(effectiveSide))
            : dynamicStyles.hitAreaBiasY(hitAreaBias(effectiveSide)),
          isDisabled && styles.disabled,
        )}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => {
          if (!isDragging) {
            setIsHovered(false);
          }
        }}
      />
      {/* Pill grip indicator — themed via .astryx-resize-handle-pill */}
      {children ?? (
        <div
          {...mergeProps(
            themeProps('resize-handle-pill'),
            stylex.props(
              styles.pill,
              isHorizontal ? styles.pillHorizontal : styles.pillVertical,
              effectiveSide !== 'center' &&
                (isHorizontal
                  ? dynamicStyles.pillOffsetX(
                      effectiveSide === 'start' ? -1 : 1,
                    )
                  : dynamicStyles.pillOffsetY(
                      effectiveSide === 'start' ? -1 : 1,
                    )),
              isAlwaysVisible ? styles.pillVisible : styles.pillHidden,
              isInteracting && !isDragging && styles.pillHover,
              isDragging && styles.pillActive,
            ),
          )}
        />
      )}
    </div>
  );
}

ResizeHandle.displayName = 'ResizeHandle';
