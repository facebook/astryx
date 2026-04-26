'use client';

/**
 * @file XDSResizeHandle.tsx
 * @input direction, isReversed, hasDivider, isAlwaysVisible, ResizableProps
 * @output Styled drag handle with WAI-ARIA separator role and keyboard support
 * @position Between resizable panels; consumed directly by builders
 *
 * Shadcn-inspired approach: the handle element is 1px wide (the divider line
 * itself), with an absolutely-positioned wider hit area for pointer interaction.
 * Optional pill grip indicator centered on the line.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {HTMLAttributes, ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, durationVars, easeVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import type {ResizableProps} from './useXDSResizable';

const KEYBOARD_STEP = 10;
const KEYBOARD_LARGE_STEP = 50;

const styles = stylex.create({
  // The handle is 1px in layout flow — the visible divider line itself.
  // A wider hit area is achieved via the hitArea child.
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
      ':focus-visible': '2px',
    },
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
  // Zero-footprint mode: handle takes 0px in layout when no divider.
  // Hit area + pill use absolute positioning so they still work.
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

  // Wider invisible hit area — extends beyond the 1px line.
  hitArea: {
    position: 'absolute',
    zIndex: 1,
    touchAction: 'none',
    userSelect: 'none',
  },
  hitAreaHorizontal: {
    width: 'var(--resize-handle-hit-area, 16px)',
    top: 0,
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    cursor: 'col-resize',
  },
  hitAreaVertical: {
    height: 'var(--resize-handle-hit-area, 16px)',
    left: 0,
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'row-resize',
  },

  // Pill grip indicator — absolutely positioned so it's not constrained
  // by the 1px handle container. Without this, the vertical pill (3px tall)
  // gets squished to 1px by the flex layout of the 1px-tall handle.
  pill: {
    position: 'absolute',
    zIndex: 2,
    borderRadius: 2,
    backgroundColor: colorVars['--color-border'],
    transitionProperty: 'opacity, background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  pillHorizontal: {
    width: 'var(--resize-handle-width, 3px)',
    height: 'var(--resize-handle-height, 32px)',
    // Centered on the 1px vertical line
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  pillVertical: {
    height: 'var(--resize-handle-width, 3px)',
    width: 'var(--resize-handle-height, 32px)',
    // Centered on the 1px horizontal line
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
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

export interface XDSResizeHandleProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'style' | 'className'
> {
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Layout direction — determines cursor and indicator orientation.
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical';

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
   * Accessible label for the separator.
   * @default 'Resize handle'
   */
  label?: string;

  /** Resize props from useXDSResizable region. */
  resizable?: ResizableProps;

  /** Custom handle content. Overrides the default pill. */
  children?: ReactNode;

  /** StyleX styles override. */
  xstyle?: stylex.StyleXStyles;
}

export function XDSResizeHandle({
  direction = 'horizontal',
  isReversed = false,
  isDisabled = false,
  hasDivider = false,
  isAlwaysVisible = true,
  label = 'Resize handle',
  resizable,
  children,
  xstyle,
  ref,
  ...props
}: XDSResizeHandleProps) {
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isHorizontal = direction === 'horizontal';
  const sign = isReversed ? -1 : 1;

  const getRTLMultiplier = useCallback((): number => {
    const el = handleRef.current;
    if (!el) return 1;
    return getComputedStyle(el).direction === 'rtl' ? -1 : 1;
  }, []);

  const isInteracting = isHovered || isFocused;

  // --- Pointer drag ---
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isDisabled || !resizable) return;
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
      if (isDisabled || !resizable) return;
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
    if (isDisabled || !resizable || !resizable._collapsible) return;
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
      ref={node => {
        (handleRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
        if (typeof ref === 'function') ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
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
        xdsClassName('resize-handle'),
        stylex.props(
          styles.handle,
          isHorizontal ? styles.horizontal : styles.vertical,
          !hasDivider &&
            (isHorizontal
              ? styles.noDividerHorizontal
              : styles.noDividerVertical),
          hasDivider && isInteracting && !isDragging && styles.handleHover,
          hasDivider && isDragging && styles.handleActive,
          isDisabled && styles.disabled,
          xstyle,
        ),
      )}
      {...props}>
      {/* Wider invisible hit area for pointer interaction */}
      <div
        {...stylex.props(
          styles.hitArea,
          isHorizontal ? styles.hitAreaHorizontal : styles.hitAreaVertical,
          isDisabled && styles.disabled,
        )}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => {
          if (!isDragging) setIsHovered(false);
        }}
        onKeyDown={handleKeyDown}
      />
      {/* Pill grip indicator */}
      {children ?? (
        <div
          {...stylex.props(
            styles.pill,
            isHorizontal ? styles.pillHorizontal : styles.pillVertical,
            isAlwaysVisible ? styles.pillVisible : styles.pillHidden,
            isInteracting && !isDragging && styles.pillHover,
            isDragging && styles.pillActive,
          )}
        />
      )}
    </div>
  );
}

XDSResizeHandle.displayName = 'XDSResizeHandle';
