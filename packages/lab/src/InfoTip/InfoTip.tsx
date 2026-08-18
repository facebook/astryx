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

import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
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
import {focusOutlineStyles} from '@astryxdesign/core/utils';

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
    transitionProperty: 'color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
});

/**
 * An inline info-icon help affordance: a small "i" button that reveals a
 * tooltip on hover and keyboard focus. Use it next to labels, values, and
 * metrics for permission notes, metric definitions, and field help.
 *
 * The value over hand-composing Icon inside Tooltip is the pre-wired
 * accessible trigger: a real button with an aria-label, Tab-reachable,
 * tooltip on hover AND focus, and Escape dismissal.
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
export function InfoTip({
  content,
  label = 'More information',
  size = 'sm',
}: InfoTipProps): ReactNode {
  // Escape dismissal: `true` force-hides the tooltip (Tooltip isOpen={false});
  // `false` returns control to Tooltip's own hover/focus triggers (isOpen
  // undefined). Reset when the pointer or focus leaves the trigger so the
  // tooltip can re-open on the next hover/focus.
  const [isDismissed, setIsDismissed] = useState(false);
  const isOpenRef = useRef(false);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    isOpenRef.current = isOpen;
  }, []);

  // Escape dismissal is claimed with a native listener on the trigger, not a
  // React `onKeyDown`. React dispatches synthetic events at the root container,
  // by which point an enclosing dialog's own element-level listener has already
  // run and closed it, and the browser has already taken the un-consumed press
  // as a close request for the layer behind — so one press dismissed both the
  // tip and the dialog hosting it (#5168). Only presses that actually dismiss a
  // showing tooltip are claimed; otherwise the press belongs to the layer
  // behind, and is left alone.
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !isOpenRef.current) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setIsDismissed(true);
    };

    trigger.addEventListener('keydown', handleKeyDown);
    return () => trigger.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleReset = useCallback(() => {
    setIsDismissed(false);
  }, []);

  return (
    <Tooltip
      content={content}
      isOpen={isDismissed ? false : undefined}
      onOpenChange={handleOpenChange}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        onBlur={handleReset}
        onMouseLeave={handleReset}
        {...stylex.props(focusOutlineStyles.focusVisible, styles.trigger)}>
        <Icon icon="info" size={size} />
      </button>
    </Tooltip>
  );
}

InfoTip.displayName = 'InfoTip';
