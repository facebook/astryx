// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ButtonGroup.tsx
 * @input Uses React, StyleX, Button/IconButton children
 * @output Exports ButtonGroup component, context, and types
 * @position Groups buttons with connected styling; consumed by index.ts
 *
 * Children (Button, IconButton) consume the ButtonGroup context to apply
 * position-aware styles in pure CSS — no cloneElement or wrapper divs needed.
 * The end-cap radius rules live in Button.tsx; see IS_LAST_ITEM there for why
 * the trailing edge cannot use :last-child (#2508).
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ButtonGroup/ButtonGroup.doc.mjs (props table, features)
 * - /packages/core/src/ButtonGroup/ButtonGroup.test.tsx (tests)
 * - /packages/core/src/ButtonGroup/index.ts (exports if types change)
 * - /apps/storybook/stories/ButtonGroup.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/ButtonGroup/ (showcase blocks)
 */

import {useEffect, useMemo, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {ButtonSize} from '../Button';
import {radiusVars, shadowVars} from '../theme/tokens.stylex';
import type {Elevation} from '../utils/types';
import {SizeProvider, useSize} from '../SizeContext/SizeContext';
import {useListFocus} from '../hooks/useListFocus';
import {
  resolveNearestAction,
  useActionGroupTracking,
} from '../hooks/useActionGroupTracking';
import {watchHitArea, writeHitInsets} from '../utils/hitArea';
import {PRESS_GROUP_ITEM_ATTRIBUTE} from '../utils/pressFeedback';
import {mergeProps, composeEventHandlers} from '../utils';
import type {BaseProps} from '../BaseProps';
import {ButtonGroupContext} from './ButtonGroupContext';
import type {ButtonGroupOrientation} from './ButtonGroupContext';
import {themeProps} from '../utils/themeProps';

import {useMergedRefs} from '../hooks/useMergedRefs';
// =============================================================================
// Props
// =============================================================================

export interface ButtonGroupProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Button or IconButton children.
   */
  children: ReactNode;

  /**
   * Accessible label for the group (used as aria-label).
   */
  label: string;

  /**
   * Orientation of the button group.
   * @default 'horizontal'
   */
  orientation?: ButtonGroupOrientation;

  /**
   * Default size for buttons in the group.
   * Individual buttons can override this with their own `size` prop.
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Resting elevation for the group. The connected buttons share one surface,
   * so the shadow sits on the group and lifts them together. Use for a floating
   * group of actions above content.
   * @default 'none'
   */
  elevation?: Elevation;

  /**
   * Whether all buttons in the group are disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  group: {
    display: 'inline-flex',
    alignItems: 'stretch',
  },
  vertical: {
    flexDirection: 'column',
  },
  /**
   * The touch target (`family:action-groups` FR5): under a coarse pointer an
   * invisible layer extends the group by the insets utils/hitArea.ts writes
   * (toward 44 px, clamped against whatever sits outside the group), so a
   * finger just past a small button lands on the group, whose tracker picks
   * that button. Under the buttons, in the group's own stacking context;
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

// Resting elevation for the whole group — the connected buttons share one
// surface, so the shadow sits on the group wrapper and lifts them as a unit.
// The wrapper takes the element radius so the shadow follows the group's
// rounded outer corners rather than a bare rectangle. 'none' is the default.
const elevationStyles = stylex.create({
  none: {boxShadow: 'none'},
  low: {
    boxShadow: shadowVars['--shadow-low'],
    borderRadius: radiusVars['--radius-element'],
  },
  med: {
    boxShadow: shadowVars['--shadow-med'],
    borderRadius: radiusVars['--radius-element'],
  },
  high: {
    boxShadow: shadowVars['--shadow-high'],
    borderRadius: radiusVars['--radius-element'],
  },
});

// =============================================================================
// Press tracking
// =============================================================================

/** The buttons the group tracks: each carries the group item marker. */
const TRACKED_BUTTON = `[${PRESS_GROUP_ITEM_ATTRIBUTE}]`;

/**
 * Whether the group takes a press that lands on `target`: one on a tracked
 * button, or on the group itself (its hit layer). A press on a member the
 * group leaves to itself, such as a menu trigger, keeps that member's own
 * press and click. A group with no box (not rendered) takes none.
 */
function takesPress(group: HTMLElement | null, target: unknown): boolean {
  if (group == null || !(target instanceof Element)) {
    return false;
  }
  const box = group.getBoundingClientRect();
  if (box.width <= 0 || box.height <= 0) {
    return false;
  }
  return target === group || target.closest(TRACKED_BUTTON) != null;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Groups buttons with connected styling — shared borders, proper border-radius
 * handling (only on outer edges), and horizontal or vertical orientation.
 *
 * Children automatically detect the group via context and apply position-aware
 * styles in pure CSS.
 *
 * The group is a single tab stop: arrow keys move between members along the
 * orientation, Home/End jump to the ends, focus wraps, and disabled members are
 * skipped (the APG roving tabindex technique, via `useListFocus`).
 *
 * Members that render their own layer — a Button with a `tooltip`, or a
 * DropdownMenu — compose correctly, including as the trailing member.
 *
 * @example
 * ```
 * <ButtonGroup label="Actions">
 *   <Button label="Copy" />
 *   <Button label="Cut" />
 *   <Button label="Paste" />
 * </ButtonGroup>
 * ```
 *
 * @example
 * ```
 * <ButtonGroup label="Approve action">
 *   <Button label="Allow once" variant="primary" />
 *   <DropdownMenu
 *     button={{label: 'Allow options', variant: 'primary', isIconOnly: true, icon: <Icon icon="chevronDown" />}}
 *     items={[{label: 'Allow for 30 minutes'}, {label: 'Always allow'}]}
 *   />
 * </ButtonGroup>
 * ```
 */
export function ButtonGroup({
  children,
  label,
  orientation = 'horizontal',
  size: sizeProp,
  isDisabled = false,
  elevation = 'none',
  xstyle,
  className,
  style,
  ref,
  'data-testid': testId,
  onKeyDown,
  onFocus,
  ...props
}: ButtonGroupProps): ReactNode {
  const size = useSize(sizeProp, 'md');

  const {listRef, handleKeyDown, handleFocus} = useListFocus<HTMLDivElement>({
    // Roving rewrites `tabindex` on every item, so the selector cannot key off
    // a value: `[tabindex="0"]` would drop each member the moment it is
    // stamped -1. `a[href]` catches a Button rendered with `href`.
    itemSelector: 'button, a[href], [tabindex]',
    // A member's layer renders inline inside the group (useLayer does not
    // portal it), so a key pressed in an open DropdownMenu bubbles here. The
    // boundary is the group's own root or any layer, whichever is nearer to
    // the target. Naming the group's own root is what keeps a group rendered
    // inside a Popover or Toast working: bailing on any [popover] ancestor
    // instead would swallow every arrow key it owns.
    boundarySelector: '[role="group"], [popover]',
    orientation,
    hasRovingTabIndex: true,
  });

  // The buttons are an action group (`family:action-groups`): a held
  // pointer, a finger, a pen or a mouse, is tracked across them. The button
  // under it highlights at once, the highlight follows it from button to
  // button, and the lift runs the button under it through its own click;
  // nothing runs for a lift outside the group. Each tracked button carries
  // the group item marker (Button reads `tracksPress`), so the document press
  // controller leaves its press to the tracker. A disabled group tracks
  // nothing. The keyboard and assistive technology are unchanged.
  const tracksPress = !isDisabled;
  const groupRef = useRef<HTMLDivElement>(null);
  useActionGroupTracking(groupRef, {
    itemSelector: TRACKED_BUTTON,
    // At touch-down and with no margin, as UIKit's action rows (the
    // tracker waits the content-touch delay inside a scroller).
    highlightOnsetMs: 0,
    highlightExpansion: 0,
    // The button under a finger: the nearest whose 44 px target holds the
    // point, with disabled buttons as neighbours (a mouse or a pen
    // hit-tests the buttons' own boxes).
    resolveTarget: resolveNearestAction,
    shouldTrack: target => takesPress(groupRef.current, target),
    isEnabled: tracksPress,
  });
  // A finger's 44 px target, without the buttons growing (FR5): the hit
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
    () => ({orientation, isDisabled, tracksPress}),
    [orientation, isDisabled, tracksPress],
  );

  return (
    <ButtonGroupContext value={contextValue}>
      <SizeProvider value={size}>
        <div
          ref={useMergedRefs(ref, listRef, groupRef)}
          {...props}
          {...mergeProps(
            themeProps('button-group', {size, orientation, elevation}),
            stylex.props(
              styles.group,
              tracksPress && styles.hitArea,
              orientation === 'vertical' && styles.vertical,
              elevationStyles[elevation],
              xstyle,
            ),
            className,
            style,
          )}
          role="group"
          aria-label={label}
          onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
          onFocus={composeEventHandlers(onFocus, handleFocus)}
          aria-disabled={isDisabled || undefined}
          data-testid={testId}>
          {children}
        </div>
      </SizeProvider>
    </ButtonGroupContext>
  );
}

ButtonGroup.displayName = 'ButtonGroup';
