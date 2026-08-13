// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file InfoTip.tsx
 * @input Uses React, stylex, Tooltip + Icon from @astryxdesign/core, color/spacing/radius/duration/ease tokens
 * @output Exports InfoTip component, InfoTipProps, InfoTipSize types
 * @position Lab experiment (RFC facebook/astryx#3349); core implementation consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/InfoTip/InfoTip.doc.mjs (props table, features)
 * - /packages/lab/src/InfoTip/InfoTip.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/InfoTip/index.ts (exports if types change)
 */

import {useCallback, useRef, useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';

import {Icon, type IconSize} from '@astryxdesign/core/Icon';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {
  colorVars,
  durationVars,
  easeVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';

/**
 * Size of the info icon. Maps 1:1 to Icon sizes
 * (xsm: 12px, sm: 16px, md: 20px, lg: 24px).
 */
export type InfoTipSize = IconSize;

export interface InfoTipProps {
  /**
   * Content to display in the tooltip.
   * Typically short, non-interactive text. Mirrors Tooltip's `content` prop.
   */
  content: ReactNode;
  /**
   * Accessible name for the trigger button.
   * @default 'More information'
   */
  label?: string;
  /**
   * Size of the info icon.
   * @default 'sm'
   */
  size?: InfoTipSize;
}

const styles = stylex.create({
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'middle',
    padding: spacingVars['--spacing-0-5'],
    margin: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    borderRadius: radiusVars['--radius-full'],
    cursor: 'pointer',
    color: {
      default: colorVars['--color-icon-secondary'],
      ':hover': {
        default: null,
        '@media (hover: hover)': colorVars['--color-icon-primary'],
      },
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
    transitionProperty: 'color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
});

/**
 * An inline info-icon help affordance: a small "i" button that reveals a
 * tooltip on hover, keyboard focus, and tap. Use it next to labels, values,
 * and metrics for permission notes, metric definitions, and field help.
 *
 * The value over hand-composing Icon inside Tooltip is the pre-wired
 * accessible trigger: a real button with an aria-label, Tab-reachable,
 * tooltip on hover AND focus, tap-to-toggle for touch, and Escape dismissal.
 *
 * Tapping (or clicking) pins the tooltip open so it survives the pointer
 * leaving; tapping again, Escape, or moving focus away closes it.
 *
 * Composed entirely from core primitives (Tooltip + Icon); the info icon
 * resolves from the global icon registry, so themes can override it.
 *
 * @example
 * ```
 * <InfoTip content="Editors can change this field; viewers cannot." />
 * <InfoTip content="30-day rolling average." label="About this metric" />
 * ```
 */
/**
 * Visibility channel into Tooltip's controlled `isOpen`:
 * - `auto` — `isOpen` undefined: Tooltip's own hover/focus triggers decide.
 * - `pinned` — `isOpen` true: force-shown by a tap/click; outlives pointer-leave.
 * - `dismissed` — `isOpen` false: force-hidden by Escape or a second tap.
 *
 * `dismissed` (not `auto`) is the only way to close: `auto` merely stops
 * overriding Tooltip, and Tooltip's controlled effect no-ops on `undefined`,
 * so returning to `auto` while open would leave the layer stuck open.
 */
type InfoTipVisibility = 'auto' | 'pinned' | 'dismissed';

export function InfoTip({
  content,
  label = 'More information',
  size = 'sm',
}: InfoTipProps): ReactNode {
  const [visibility, setVisibility] = useState<InfoTipVisibility>('auto');
  const isOpenRef = useRef(false);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    isOpenRef.current = isOpen;
  }, []);

  // Tap/click toggles the tooltip. Hover-only help is invisible on touch:
  // core suppresses hover-open under `(hover: none)` and only opens on focus
  // when the trigger is `:focus-visible`, so without this a touch user has no
  // way to open the tooltip at all. Pinning is unconditional rather than
  // toggling on current visibility, so the same tap means the same thing for
  // pointer users — whose hover may or may not have opened it already,
  // depending on whether Tooltip's show delay had elapsed.
  const handleClick = useCallback(() => {
    setVisibility(current => (current === 'pinned' ? 'dismissed' : 'pinned'));
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Escape' && isOpenRef.current) {
        // Only swallow Escape when it actually dismissed the tooltip, so an
        // enclosing dialog still closes on the next press.
        event.stopPropagation();
        setVisibility('dismissed');
      }
    },
    [],
  );

  // Focus leaving closes a pinned tooltip, and otherwise returns control to
  // Tooltip so it can re-open on the next hover/focus.
  const handleBlur = useCallback(() => {
    setVisibility(current => (current === 'pinned' ? 'dismissed' : 'auto'));
  }, []);

  // The pointer leaving must not unpin — surviving pointer-leave is the point
  // of pinning — but it does clear a dismissal so the next hover re-opens.
  const handleMouseLeave = useCallback(() => {
    setVisibility(current => (current === 'dismissed' ? 'auto' : current));
  }, []);

  return (
    <Tooltip
      content={content}
      isOpen={visibility === 'auto' ? undefined : visibility === 'pinned'}
      onOpenChange={handleOpenChange}>
      <button
        type="button"
        aria-label={label}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onMouseLeave={handleMouseLeave}
        {...stylex.props(styles.trigger)}>
        <Icon icon="info" size={size} />
      </button>
    </Tooltip>
  );
}

InfoTip.displayName = 'InfoTip';
