'use client';

/**
 * @file XDSToggleButtonGroup.tsx
 * @input Uses React Context, XDSToggleButton children
 * @output Exports XDSToggleButtonGroup component and types
 * @position Groups toggle buttons for single or multi-select behavior
 *
 * Uses a discriminated union on `type` to enforce type-safe value/onChange:
 * - type='single' → value: string | null, onChange: (v: string | null) => void
 * - type='multiple' → value: string[], onChange: (v: string[]) => void
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ToggleButton/index.ts
 * - /apps/storybook/stories/ToggleButton.stories.tsx
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import type {XDSButtonSize} from '../Button';
import {xdsClassName, mergeProps} from '../utils';
import type {StyleXStyles} from '@stylexjs/stylex';

// =============================================================================
// Context
// =============================================================================

interface ToggleButtonGroupContextValue {
  /** Currently selected value(s). */
  selectedValues: Set<string>;
  /** Toggle a value on/off. */
  toggle: (value: string) => void;
  /** Group size default — individual buttons can override. */
  size?: XDSButtonSize;
  /** Group disabled state. */
  isDisabled?: boolean;
}

export const ToggleButtonGroupContext =
  createContext<ToggleButtonGroupContextValue | null>(null);

/**
 * Hook for XDSToggleButton to read group context.
 * Returns null when used outside a group.
 */
export function useXDSToggleButtonGroup(): ToggleButtonGroupContextValue | null {
  return useContext(ToggleButtonGroupContext);
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  group: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  vertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});

// =============================================================================
// Props — Discriminated Union
// =============================================================================

interface XDSToggleButtonGroupBaseProps {
  /** Toggle button children. */
  children: ReactNode;

  /**
   * Accessible label for the group (used as aria-label).
   */
  label: string;

  /**
   * Orientation of the button group.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Default size for buttons in the group.
   * Individual buttons can override this with their own `size` prop.
   * @default 'md'
   */
  size?: XDSButtonSize;

  /**
   * Whether all buttons in the group are disabled.
   * @default false
   */
  isDisabled?: boolean;

  /** StyleX overrides for the group container. */
  xstyle?: StyleXStyles;

  /** Test ID for testing frameworks. */
  'data-testid'?: string;
}

/**
 * Single-select group props.
 * Only one button can be active at a time. Clicking the active
 * button deselects it (value becomes null).
 */
export interface XDSToggleButtonGroupSingleProps extends XDSToggleButtonGroupBaseProps {
  /**
   * Single selection mode (default).
   * @default 'single'
   */
  type?: 'single';

  /** Currently selected value, or null if none selected. */
  value: string | null;

  /** Called when selection changes. */
  onChange: (value: string | null) => void;
}

/**
 * Multi-select group props.
 * Multiple buttons can be active simultaneously.
 */
export interface XDSToggleButtonGroupMultipleProps extends XDSToggleButtonGroupBaseProps {
  /** Multiple selection mode. */
  type: 'multiple';

  /** Currently selected values. */
  value: string[];

  /** Called when selection changes. */
  onChange: (value: string[]) => void;
}

/** Discriminated union of single and multiple group props. */
export type XDSToggleButtonGroupProps =
  | XDSToggleButtonGroupSingleProps
  | XDSToggleButtonGroupMultipleProps;

// =============================================================================
// Component
// =============================================================================

/**
 * Groups toggle buttons for exclusive (single) or multi-select behavior.
 *
 * Uses a discriminated union on `type` for type-safe value/onChange:
 * - `'single'` (default): `value: string | null`, click active deselects
 * - `'multiple'`: `value: string[]`, toggles individual items
 *
 * @example
 * ```
 * const [view, setView] = useState<string | null>('grid');
 * <XDSToggleButtonGroup value={view} onChange={setView} label="View mode">
 *   <XDSToggleButton value="list" label="List" icon={<ListIcon />} />
 *   <XDSToggleButton value="grid" label="Grid" icon={<GridIcon />} />
 * </XDSToggleButtonGroup>
 * ```
 */
export function XDSToggleButtonGroup(
  props: XDSToggleButtonGroupProps,
): ReactNode {
  const {
    children,
    label,
    orientation = 'horizontal',
    size,
    isDisabled = false,
    xstyle,
    'data-testid': testId,
  } = props;

  const isMultiple = props.type === 'multiple';

  const selectedValues = useMemo(() => {
    if (isMultiple) {
      return new Set(props.value as string[]);
    }
    const singleValue = props.value as string | null;
    return singleValue != null ? new Set([singleValue]) : new Set<string>();
  }, [isMultiple, props.value]);

  const toggle = useCallback(
    (itemValue: string) => {
      if (isMultiple) {
        const current = props.value as string[];
        const onChange = props.onChange as (value: string[]) => void;
        if (current.includes(itemValue)) {
          onChange(current.filter(v => v !== itemValue));
        } else {
          onChange([...current, itemValue]);
        }
      } else {
        const current = props.value as string | null;
        const onChange = props.onChange as (value: string | null) => void;
        // Allow deselection: clicking active → null
        onChange(current === itemValue ? null : itemValue);
      }
    },
    [isMultiple, props.value, props.onChange],
  );

  const contextValue = useMemo(
    () => ({selectedValues, toggle, size, isDisabled}),
    [selectedValues, toggle, size, isDisabled],
  );

  return (
    <ToggleButtonGroupContext.Provider value={contextValue}>
      <div
        role="group"
        aria-label={label}
        data-testid={testId}
        {...mergeProps(
          xdsClassName('toggle-button-group'),
          stylex.props(
            styles.group,
            orientation === 'vertical' && styles.vertical,
            xstyle,
          ),
        )}>
        {children}
      </div>
    </ToggleButtonGroupContext.Provider>
  );
}

XDSToggleButtonGroup.displayName = 'XDSToggleButtonGroup';
