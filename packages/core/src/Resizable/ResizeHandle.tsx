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
 *
 * While the panel is collapsed, aria-valuenow is clamped to aria-valuemin
 * (a value below the minimum is invalid per WCAG 4.1.2) and a localized
 * "Collapsed" aria-valuetext announces the real state.
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
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {mergeProps, rtlStyles} from '../utils';
import type {ResizableProps} from './useResizable';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

import {useMergedRefs} from '../hooks/useMergedRefs';
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
 * Hit-area inline bias, expressed as a fraction of the pill's per-side offset.
 *
 * The visible pill is placed by `pillOffsetX`/`pillOffsetY`: anchored at the
 * divider's inline-start edge and pushed one grip-width-plus-gap toward the
 * panel side via a PHYSICAL translate (dir −1 = start, +1 = end). Because that
 * offset is physical, the pill sits on the same physical side of the divider in
 * both LTR and RTL. The grab zone must sit OVER that pill, so it has to use the
 * exact same anchor + physical-offset construction as the pill (just wider) —
 * anchoring the hit area at the divider centre (`insetInlineStart: 50%`) and
 * biasing with a percentage translate mixes a logical anchor (which flips under
 * RTL) with a physical translate (which doesn't), leaving the grab zone stranded
 * to one side under RTL. Returning the pill's `dir` here lets the hit area reuse
 * `pillOffsetX`/`pillOffsetY` so the two elements are positioned identically.
 */
function hitAreaBiasDir(
  effectiveSide: 'start' | 'end' | 'center',
): number | null {
  if (effectiveSide === 'center') {
    return null;
  }
  return effectiveSide === 'start' ? -1 : 1;
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
    insetInlineStart: 0,
    insetInlineEnd: 0,
    height: 'var(--resize-handle-hit-area, 16px)',
  },
  horizontal: {
    width: 1,
    height: '100%',
    cursor: {
      default: 'col-resize',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  vertical: {
    height: 1,
    width: '100%',
    cursor: {
      default: 'row-resize',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
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
    cursor: {
      default: 'col-resize',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  hitAreaVertical: {
    height: spacingVars['--spacing-4'],
    insetInlineStart: 0,
    insetInlineEnd: 0,
    cursor: {
      default: 'row-resize',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  // Centered grab zone (pillPlacement 'center' / no bias): sit the hit area on
  // the divider itself. Inline centering comes from rtlStyles.centerInline at
  // the call site (correct in LTR and RTL); this block owns only the block axis.
  hitAreaCenteredY: {
    insetBlockStart: '50%',
    transform: 'translateY(-50%)',
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
  // Hit-area inline offset — mirrors the pill's `pillOffsetX`/`pillOffsetY`
  // construction so the grab zone sits centred on the visible pill in BOTH
  // directions. Both anchor at the divider's inline-start edge
  // (`insetInlineStart: 0`) and travel toward the panel side with the SAME
  // physical translate `dir * (gripWidth + gap)`, so they share the pill's
  // near edge. The hit area is wider, so it also shifts by half the width
  // difference `(16px − 3px) / 2 = 6.5px` to align the two CENTRES. That
  // centring shift is along the inline axis (a box grows from its inline-start
  // edge toward inline-end), so it must flip physical sign under RTL — unlike
  // the `dir * (...)` travel, which is physical and identical in both
  // directions because the pill's own offset is physical. Mixing the previous
  // divider-relative `50%` anchor with a percentage translate stranded the grab
  // zone to one side under RTL; this construction keeps it on the pill.
  //
  // Only the offset axis is translated. Unlike the pill — a small box anchored
  // at the divider's midpoint, so it needs a −50% self-shift to centre — the
  // grab zone is STRETCHED along the handle by hitAreaHorizontal/Vertical's
  // 0/0 insets, so it is already in place on that axis. A percentage there
  // would displace it by half the handle's own length, growing with the panel.
  hitAreaOffsetX: (dir: number) => ({
    insetInlineStart: 0,
    transform: {
      default: `translateX(calc(${dir} * (3px + ${spacingVars['--spacing-1']}) - 6.5px))`,
      ':is([dir="rtl"] *)': `translateX(calc(${dir} * (3px + ${spacingVars['--spacing-1']}) + 6.5px))`,
    },
  }),
  hitAreaOffsetY: (dir: number) => ({
    insetBlockStart: 0,
    transform: `translateY(calc(${dir} * (3px + ${spacingVars['--spacing-1']}) - 6.5px))`,
  }),
  pillOffsetX: (dir: number) => ({
    insetInlineStart: 0,
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
  label: labelFromProps,
  resizable,
  children,
  xstyle,
  className,
  ref,
  ...props
}: ResizeHandleProps) {
  const t = useTranslator();
  const label = labelFromProps ?? t('@astryx.resizable.handle.label');
  const handleRef = useRef<HTMLDivElement>(null);
  // Removes the in-flight drag's window listeners (and resets body styles).
  // Held in a ref so unmount can tear down a drag that never got a pointerup.
  const dragCleanupRef = useRef<(() => void) | null>(null);
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
  // Physical offset direction shared by the pill and the grab zone (null =
  // centered / no bias). Keeps the two positioned identically in LTR and RTL.
  const hitBiasDir = hitAreaBiasDir(effectiveSide);

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
        dragCleanupRef.current = null;
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
      dragCleanupRef.current = cleanup;
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
  // A drag in flight when the handle unmounts never gets its pointerup, so
  // tear down the window listeners here too — otherwise every pointermove
  // keeps driving the (still-mounted) region's resize state after the handle
  // is gone, and the body cursor/user-select overrides stick.
  useEffect(() => {
    return () => {
      if (dragCleanupRef.current) {
        dragCleanupRef.current();
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, []);

  // --- ARIA ---
  // When collapsed the panel's real size (0) sits below aria-valuemin, which
  // is invalid per WCAG 4.1.2. Clamp aria-valuenow to the minimum and announce
  // the true state via aria-valuetext instead; the valuetext is removed as
  // soon as the panel expands so the numeric value reads again.
  const isCollapsed = resizable?._isCollapsed ?? false;
  const ariaValueNow = resizable
    ? isCollapsed
      ? Math.max(resizable._size, resizable._minSizePx)
      : resizable._size
    : undefined;
  const ariaValueMin = resizable ? resizable._minSizePx : undefined;
  const ariaValueMax =
    resizable && resizable._maxSizePx !== Infinity
      ? resizable._maxSizePx
      : undefined;
  const ariaValueText =
    resizable && isCollapsed ? t('@astryx.resizable.collapsed') : undefined;

  return (
    <div
      ref={useMergedRefs(ref, handleRef)}
      role="separator"
      aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
      aria-valuenow={ariaValueNow}
      aria-valuemin={ariaValueMin}
      aria-valuemax={ariaValueMax}
      aria-valuetext={ariaValueText}
      aria-label={label}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : 0}
      onDoubleClick={handleDoubleClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      data-resizing={isDragging || undefined}
      {...mergeProps(
        themeProps('resize-handle'),
        focusOutlineProps.focusVisible(
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
          // Bias the grab zone to sit over the visible pill. When the pill is
          // centered (no bias) just center the hit area on the divider; when
          // it's offset to a panel side, reuse the pill's physical-offset
          // construction so the two stay aligned in LTR and RTL alike.
          hitBiasDir == null
            ? isHorizontal
              ? rtlStyles.centerInline('0px')
              : styles.hitAreaCenteredY
            : isHorizontal
              ? dynamicStyles.hitAreaOffsetX(hitBiasDir)
              : dynamicStyles.hitAreaOffsetY(hitBiasDir),
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
              effectiveSide === 'center'
                ? rtlStyles.centerInline('-50%')
                : isHorizontal
                  ? dynamicStyles.pillOffsetX(
                      effectiveSide === 'start' ? -1 : 1,
                    )
                  : dynamicStyles.pillOffsetY(
                      effectiveSide === 'start' ? -1 : 1,
                    ),
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
