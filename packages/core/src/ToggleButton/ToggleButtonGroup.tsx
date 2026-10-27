// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ToggleButtonGroup.tsx
 * @input Layer-scoped React context, ToggleButton children
 * @output Exports ToggleButtonGroup component and types
 * @position Groups toggle buttons for single or multi-select behavior
 *
 * Uses a discriminated union on `type` to enforce type-safe value/onChange:
 * - type='single' → value: string | null, onChange: (v: string | null) => void
 * - type='multiple' → value: string[], onChange: (v: string[]) => void
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ToggleButton/index.ts
 * - /apps/storybook/stories/ToggleButton.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/ToggleButton/ (showcase blocks)
 */

import {
  useCallback,
  use,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import {createLayerScopedContext as createContext} from '../Layer/layerScopedContext';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import type {ButtonSize} from '../Button';
import {mergeProps} from '../utils';
import type {ActionGroupTarget} from '../hooks/actionGroupTracker';
import {useActionGroupTracking} from '../hooks/useActionGroupTracking';
import {resolveHitTarget, watchHitArea, writeHitInsets} from '../utils/hitArea';
import {PRESS_GROUP_ITEM_ATTRIBUTE} from '../utils/pressFeedback';
import type {StyleXStyles} from '@stylexjs/stylex';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Context
// =============================================================================

/** The toggles the group tracks: each carries the group item marker. */
const TRACKED_TOGGLE = `[${PRESS_GROUP_ITEM_ATTRIBUTE}]`;

/**
 * The toggle under a finger, from the toggles measured when the press began:
 * the nearest one whose target, grown toward 44 px and clamped against its
 * neighbours (utils/hitArea.ts `resolveHitTarget`), holds the point. The
 * tracker asks only for a finger's press; a mouse or a pen hit-tests the
 * toggles' own boxes.
 */
const resolveTrackedToggle = (
  x: number,
  y: number,
  targets: ReadonlyArray<ActionGroupTarget>,
): HTMLElement | null =>
  targets[resolveHitTarget(x, y, targets)]?.element ?? null;

/**
 * Whether the group takes a press that lands on `target`: one on a tracked
 * toggle, or on the group itself (its hit layer). A press on any other
 * member keeps that member's own press and click. A group with no box (not
 * rendered) takes none.
 */
function takesPress(group: HTMLElement | null, target: unknown): boolean {
  if (group == null || !(target instanceof Element)) {
    return false;
  }
  const box = group.getBoundingClientRect();
  if (box.width <= 0 || box.height <= 0) {
    return false;
  }
  return target === group || target.closest(TRACKED_TOGGLE) != null;
}

interface ToggleButtonGroupContextValue {
  /** Currently selected value(s). */
  selectedValues: Set<string>;
  /** Toggle a value on/off. */
  toggle: (value: string) => void;
  /** Group size default — individual buttons can override. */
  size?: ButtonSize;
  /** Group disabled state. */
  isDisabled?: boolean;
  /**
   * Whether the group tracks a held pointer across its toggles
   * (`family:action-groups`): each toggle carries the group item marker
   * (`utils/pressFeedback.ts` PRESS_GROUP_ITEM_ATTRIBUTE).
   */
  tracksPress?: boolean;
}

const ToggleButtonGroupContext =
  createContext<ToggleButtonGroupContextValue | null>(null);
ToggleButtonGroupContext.displayName = 'ToggleButtonGroupContext';

/**
 * Hook for ToggleButton to read group context.
 * Returns null when used outside a group.
 */
export function useToggleButtonGroup(): ToggleButtonGroupContextValue | null {
  return use(ToggleButtonGroupContext);
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
  /**
   * The touch target (`family:action-groups` FR5): under a coarse pointer an
   * invisible layer extends the group by the insets utils/hitArea.ts writes
   * (toward 44 px, clamped against whatever sits outside the group), so a
   * finger just past a small toggle lands on the group, whose tracker picks
   * that toggle. Under the toggles, in the group's own stacking context;
   * absent under a fine pointer. The custom properties are hitArea.ts's
   * HIT_INSET_PROPERTIES; physical sides, as it measures them.
   */
  hitArea: {
    position: {default: null, '@media (pointer: coarse)': 'relative'},
    isolation: {default: null, '@media (pointer: coarse)': 'isolate'},
    '::after': {
      content: {default: null, '@media (pointer: coarse)': '""'},
      position: 'absolute',
      inset:
        'calc(var(--astryx-hit-inset-top, 0px) * -1) calc(var(--astryx-hit-inset-right, 0px) * -1) calc(var(--astryx-hit-inset-bottom, 0px) * -1) calc(var(--astryx-hit-inset-left, 0px) * -1)',
      zIndex: -1,
    },
  },
});

// =============================================================================
// Props — Discriminated Union
// =============================================================================

interface ToggleButtonGroupBaseProps {
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
  size?: ButtonSize;

  /**
   * Whether all buttons in the group are disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * StyleX styles for layout customization (margins, positioning, sizing).
   * Must be a `stylex.create()` value — not an inline style object.
   *
   * @example
   * ```
   * const styles = stylex.create({ wrapper: { marginTop: 8 } });
   * <ToggleButtonGroup xstyle={styles.wrapper} />
   * ```
   */
  xstyle?: StyleXStyles;

  /** Test ID for testing frameworks. */
  'data-testid'?: string;
}

/**
 * Single-select group props.
 * Only one button can be active at a time. Clicking the active
 * button deselects it (value becomes null).
 */
export interface ToggleButtonGroupSingleProps extends ToggleButtonGroupBaseProps {
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
export interface ToggleButtonGroupMultipleProps extends ToggleButtonGroupBaseProps {
  /** Multiple selection mode. */
  type: 'multiple';

  /** Currently selected values. */
  value: string[];

  /** Called when selection changes. */
  onChange: (value: string[]) => void;
}

/** Discriminated union of single and multiple group props. */
export type ToggleButtonGroupProps =
  ToggleButtonGroupSingleProps | ToggleButtonGroupMultipleProps;

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
 * <ToggleButtonGroup value={view} onChange={setView} label="View mode">
 *   <ToggleButton value="list" label="List" icon={<ListIcon />} />
 *   <ToggleButton value="grid" label="Grid" icon={<GridIcon />} />
 * </ToggleButtonGroup>
 * ```
 */
export function ToggleButtonGroup(props: ToggleButtonGroupProps): ReactNode {
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
      return new Set(props.value);
    }
    const singleValue = props.value;
    return singleValue != null ? new Set([singleValue]) : new Set<string>();
  }, [isMultiple, props.value]);

  const toggle = useCallback(
    (itemValue: string) => {
      if (isMultiple) {
        const current = props.value;
        const onChange = props.onChange;
        if (current.includes(itemValue)) {
          onChange(current.filter(v => v !== itemValue));
        } else {
          onChange([...current, itemValue]);
        }
      } else {
        const current = props.value;
        const onChange = props.onChange;
        // Allow deselection: clicking active → null
        onChange(current === itemValue ? null : itemValue);
      }
    },
    [isMultiple, props.value, props.onChange],
  );

  // The toggles are an action group (`family:action-groups`): a held
  // pointer, a finger, a pen or a mouse, is tracked across them, the toggle
  // under it highlights, and the lift toggles only that one, through its own
  // click (FR4); a lift outside the group toggles nothing. Each toggle
  // carries the group item marker (ToggleButton reads `tracksPress`). A
  // disabled group tracks nothing; the keyboard is unchanged.
  const tracksPress = !isDisabled;
  const groupRef = useRef<HTMLDivElement>(null);
  useActionGroupTracking(groupRef, {
    itemSelector: TRACKED_TOGGLE,
    highlightOnsetMs: 0,
    highlightExpansion: 0,
    resolveTarget: resolveTrackedToggle,
    shouldTrack: target => takesPress(groupRef.current, target),
    isEnabled: tracksPress,
  });
  // A finger's 44 px target, without the toggles growing (FR5): the hit
  // layer's insets, live while the group tracks; hitArea.ts measures only
  // where the primary pointer is coarse.
  useEffect(() => {
    const element = groupRef.current;
    if (!tracksPress || element == null) {
      return undefined;
    }
    return watchHitArea(element, insets => writeHitInsets(element, insets));
  }, [tracksPress]);

  const contextValue = useMemo(
    () => ({selectedValues, toggle, size, isDisabled, tracksPress}),
    [selectedValues, toggle, size, isDisabled, tracksPress],
  );

  return (
    <ToggleButtonGroupContext value={contextValue}>
      <div
        ref={groupRef}
        role="group"
        aria-label={label}
        data-testid={testId}
        {...mergeProps(
          themeProps('toggle-button-group'),
          stylex.props(
            styles.group,
            tracksPress && styles.hitArea,
            orientation === 'vertical' && styles.vertical,
            xstyle,
          ),
        )}>
        {children}
      </div>
    </ToggleButtonGroupContext>
  );
}

ToggleButtonGroup.displayName = 'ToggleButtonGroup';
