'use client';

/**
 * @file XDSCheckboxListItem.tsx
 * @input Uses React, XDSCheckboxInput, XDSCheckboxListContext, XDSListContext
 * @output Exports XDSCheckboxListItem component, XDSCheckboxListItemProps
 * @position Core implementation; consumed by index.ts, tested by XDSCheckboxList.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CheckboxList/CheckboxList.doc.mjs
 * - /packages/core/src/CheckboxList/XDSCheckboxList.test.tsx
 * - /packages/core/src/CheckboxList/index.ts
 * - /apps/storybook/stories/CheckboxList.stories.tsx
 */

import {useContext, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  spacingVars,
  durationVars,
  easeVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import {XDSCheckboxInput} from '../CheckboxInput/XDSCheckboxInput';
import {XDSListContext} from '../List/XDSListContext';
import {XDSCheckboxListContext} from './XDSCheckboxListContext';
import {xdsClassName, mergeProps} from '../utils';

const styles = stylex.create({
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    position: 'relative',
    boxSizing: 'border-box',
    textAlign: 'start',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast-min'],
    transitionTimingFunction: easeVars['--ease-standard'],
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
      ':active': colorVars['--color-overlay-pressed'],
    },
  },
  focusWithinOutline: {
    outline: {
      default: 'none',
      ':focus-within': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-within': '2px',
    },
  },
  withRadius: {
    borderRadius: radiusVars['--radius-element'],
  },
  noRadius: {
    borderRadius: 0,
  },
  withDivider: {
    borderBlockEnd: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
    ':last-child': {
      borderBlockEnd: 'none',
    },
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    pointerEvents: 'none' as const,
  },
  busy: {
    opacity: 0.6,
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: colorVars['--color-text-primary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  description: {
    color: colorVars['--color-text-secondary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
  endContent: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    marginInlineStart: 'auto',
  },
});

const densityStyles = stylex.create({
  compact: {
    paddingBlock: spacingVars['--spacing-1'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  balanced: {
    paddingBlock: spacingVars['--spacing-2'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  spacious: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-3'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
});

export interface XDSCheckboxListItemProps {
  /**
   * Primary text label for the item.
   */
  label: string;
  /**
   * Identity key for collection mode (REQUIRED inside XDSCheckboxList).
   * Throws a runtime error if missing when used inside XDSCheckboxList.
   */
  value?: string;
  /**
   * Secondary text below the label.
   */
  description?: string;
  /**
   * Content rendered after the label area.
   */
  endContent?: ReactNode;
  /**
   * Whether this individual item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Direct checked state (standalone mode only).
   * Ignored when inside XDSCheckboxList.
   */
  isChecked?: boolean | 'indeterminate';
  /**
   * Direct check handler (standalone mode only).
   * Ignored when inside XDSCheckboxList.
   */
  onCheck?: (checked: boolean) => void;
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLLIElement>;
  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;
  /**
   * Test ID for the checkbox list item container.
   */
  'data-testid'?: string;
}

/**
 * A checkbox item for use within XDSCheckboxList (collection mode)
 * or XDSList (standalone mode).
 *
 * In collection mode, checked state is derived from the parent's value array.
 * In standalone mode, uses isChecked/onCheck props directly.
 *
 * @example
 * ```
 * <XDSCheckboxListItem label="Email" value="email" />
 * <XDSCheckboxListItem
 *   label="Accept terms"
 *   isChecked={accepted}
 *   onCheck={setAccepted}
 * />
 * ```
 */
export function XDSCheckboxListItem({
  label,
  value,
  description,
  endContent,
  isDisabled: isItemDisabled = false,
  isChecked,
  onCheck,
  ref,
  xstyle,
  className,
  style,
  'data-testid': dataTestId,
}: XDSCheckboxListItemProps) {
  const ctx = useContext(XDSCheckboxListContext);
  const listCtx = useContext(XDSListContext);

  if (ctx && value === undefined) {
    throw new Error(
      'XDSCheckboxListItem requires a `value` prop when used inside XDSCheckboxList.',
    );
  }

  // Density from XDSListContext (set by XDSList inside XDSCheckboxList, or standalone XDSList)
  const density = listCtx?.density ?? 'balanced';
  const hasDividers = listCtx?.hasDividers ?? false;
  const checkboxSize = density === 'compact' ? 'sm' : 'md';

  // Disabled: parent-level OR item-level
  const effectiveDisabled = (ctx?.isDisabled ?? false) || isItemDisabled;
  const isBusy = ctx?.isBusy ?? false;

  // Resolve checked state:
  // 1. Collection mode (inside XDSCheckboxList with value[])
  // 2. Standalone mode (isChecked prop)
  // 3. Neither → unchecked
  let resolvedChecked: boolean | 'indeterminate' = false;
  if (ctx && ctx.value !== undefined) {
    resolvedChecked = ctx.value.includes(value!);
  } else if (isChecked !== undefined) {
    resolvedChecked = isChecked;
  }

  const handleToggle = (newChecked?: boolean) => {
    if (effectiveDisabled || isBusy) return;

    if (ctx && ctx.value !== undefined) {
      // Collection mode
      const currentlyChecked = ctx.value.includes(value!);
      const shouldCheck = newChecked ?? !currentlyChecked;
      if (shouldCheck) {
        ctx.onChange?.([...ctx.value, value!]);
      } else {
        ctx.onChange?.(ctx.value.filter(v => v !== value));
      }
    } else {
      // Standalone mode
      const shouldCheck =
        newChecked ?? (resolvedChecked === true ? false : true);
      onCheck?.(shouldCheck);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (effectiveDisabled || isBusy) return;
    const target = e.target as HTMLElement;
    // Don't fire if click originated from an interactive child
    if (target.closest('button, a, input, select, textarea')) return;
    handleToggle();
  };

  return (
    <li
      ref={ref}
      data-testid={dataTestId}
      aria-busy={isBusy || undefined}
      aria-disabled={effectiveDisabled || undefined}
      onClick={handleContainerClick}
      {...mergeProps(
        xdsClassName('checkbox-list-item'),
        stylex.props(
          styles.item,
          densityStyles[density],
          hasDividers ? styles.noRadius : styles.withRadius,
          hasDividers && styles.withDivider,
          !effectiveDisabled && styles.focusWithinOutline,
          !effectiveDisabled && stylex.defaultMarker(),
          effectiveDisabled && styles.disabled,
          isBusy && !effectiveDisabled && styles.busy,
          xstyle,
        ),
        className,
        style,
      )}>
      <XDSCheckboxInput
        label={label}
        isLabelHidden
        value={resolvedChecked}
        onChange={newChecked => handleToggle(newChecked)}
        isDisabled={effectiveDisabled}
        size={checkboxSize}
      />
      <div {...stylex.props(styles.labelWrapper)}>
        <span {...stylex.props(styles.label)}>{label}</span>
        {description != null && (
          <span {...stylex.props(styles.description)}>{description}</span>
        )}
      </div>
      {endContent != null && (
        <span {...stylex.props(styles.endContent)}>{endContent}</span>
      )}
    </li>
  );
}

XDSCheckboxListItem.displayName = 'XDSCheckboxListItem';
