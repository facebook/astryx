'use client';

/**
 * @file XDSResizeHandle.tsx
 * @input direction, isDisabled, label, ResizableProps from adjacent panels
 * @output Styled drag handle with WAI-ARIA separator role and keyboard support
 * @position Between resizable panels; consumed directly by builders
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
  grip: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    touchAction: 'none',
    userSelect: 'none',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: null,
      ':focus-visible': '-2px',
    },
  },
  horizontal: {
    width: 'var(--resize-handle-hit-area, 16px)',
    cursor: 'col-resize',
    height: '100%',
  },
  vertical: {
    height: 'var(--resize-handle-hit-area, 16px)',
    cursor: 'row-resize',
    width: '100%',
  },
  disabled: {
    cursor: 'default',
    pointerEvents: 'none',
  },
  pill: {
    borderRadius: 2,
    backgroundColor: colorVars['--color-border-emphasized'],
    opacity: 0,
    transitionProperty: 'opacity, background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  pillHorizontal: {
    width: 'var(--resize-handle-width, 3px)',
    height: 'var(--resize-handle-height, 32px)',
  },
  pillVertical: {
    height: 'var(--resize-handle-width, 3px)',
    width: 'var(--resize-handle-height, 32px)',
  },
  pillHover: {
    opacity: 0.6,
  },
  pillActive: {
    opacity: 1,
    backgroundColor: colorVars['--color-icon-primary'],
  },
  pillFocusVisible: {
    opacity: 0.6,
  },
});

export interface XDSResizeHandleProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'style' | 'className'
> {
  ref?: React.Ref<HTMLDivElement>;
  /** Layout direction. @default 'horizontal' */
  direction?: 'horizontal' | 'vertical';
  /** @default false */
  isDisabled?: boolean;
  /** Accessible label. @default 'Resize handle' */
  label?: string;
  /** Resize props from the preceding panel's useXDSResizable region. */
  resizable?: ResizableProps;
  /** Custom handle content. Default renders pill indicator. */
  children?: ReactNode;
  /** StyleX styles override. */
  xstyle?: stylex.StyleXStyles;
}

export function XDSResizeHandle({
  direction = 'horizontal',
  isDisabled = false,
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

  const getRTLMultiplier = useCallback((): number => {
    const el = handleRef.current;
    if (!el) return 1;
    return getComputedStyle(el).direction === 'rtl' ? -1 : 1;
  }, []);

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
        const delta = (currentPos - startPos) * rtl;
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
    [isDisabled, resizable, isHorizontal, getRTLMultiplier],
  );

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
          resizable._onResizeMove(step * (isHorizontal ? rtl : 1));
          resizable._onResizeEnd();
          break;
        }
        case 'ArrowLeft':
        case 'ArrowUp': {
          e.preventDefault();
          resizable._onResizeStart();
          resizable._onResizeMove(-step * (isHorizontal ? rtl : 1));
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
    [isDisabled, resizable, isHorizontal, getRTLMultiplier],
  );

  const handleDoubleClick = useCallback(() => {
    if (isDisabled || !resizable || !resizable._collapsible) return;
    resizable._onResizeStart();
    resizable._onResizeMove(
      resizable._isCollapsed ? resizable._minSizePx : -resizable._size,
    );
    resizable._onResizeEnd();
  }, [isDisabled, resizable]);

  useEffect(() => {
    return () => {
      if (isDragging) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isDragging]);

  const ariaValueNow = resizable ? resizable._size : undefined;
  const ariaValueMin = resizable ? resizable._minSizePx : undefined;
  const ariaValueMax =
    resizable && resizable._maxSizePx !== Infinity
      ? resizable._maxSizePx
      : undefined;

  const showPillHover = isHovered && !isDragging;
  const showPillActive = isDragging;
  const showPillFocus = isFocused && !isDragging && !isHovered;

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
      onPointerDown={handlePointerDown}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        if (!isDragging) setIsHovered(false);
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={handleKeyDown}
      onDoubleClick={handleDoubleClick}
      data-resizing={isDragging || undefined}
      {...mergeProps(
        xdsClassName('resize-handle'),
        stylex.props(
          styles.grip,
          isHorizontal ? styles.horizontal : styles.vertical,
          isDisabled && styles.disabled,
          xstyle,
        ),
      )}
      {...props}>
      {children ?? (
        <div
          {...stylex.props(
            styles.pill,
            isHorizontal ? styles.pillHorizontal : styles.pillVertical,
            showPillHover && styles.pillHover,
            showPillActive && styles.pillActive,
            showPillFocus && styles.pillFocusVisible,
          )}
        />
      )}
    </div>
  );
}

XDSResizeHandle.displayName = 'XDSResizeHandle';
