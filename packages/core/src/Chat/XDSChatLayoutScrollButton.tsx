// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSChatLayoutScrollButton.tsx
 * @input Uses React, StyleX, XDSButton, XDSIcon, theme tokens
 * @output Exports XDSChatLayoutScrollButton component
 * @position Composable scroll-to-bottom button for use inside XDSChatLayout
 *
 * Renders inside the layout's dock container. Fades in when visible,
 * expands to show a label when provided (e.g. "New messages").
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /packages/cli/templates/blocks/components/ChatLayoutScrollButton/ (block examples)
 */

import React from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  shadowVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {XDSIcon} from '../Icon';
import {XDSButton} from '../Button';
import type {XDSBaseProps} from '../XDSBaseProps';
import {mergeProps} from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface XDSChatLayoutScrollButtonProps extends Omit<
  XDSBaseProps<HTMLDivElement>,
  'onClick'
> {
  ref?: React.Ref<HTMLDivElement>;
  /** Whether the button is visible. */
  isVisible: boolean;
  /** Optional label — expands the button (e.g. "New messages"). */
  label?: string;
  /** Click handler. */
  onClick: () => void;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    paddingBlockEnd: spacingVars['--spacing-3'],
  },
  container: {
    pointerEvents: 'auto',
    contain: 'layout style',
    overflow: 'hidden',
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-background-popover'],
    boxShadow: shadowVars['--shadow-med'],
    height: '32px',
    transitionProperty: 'opacity, transform, max-width',
    transitionTimingFunction: easeVars['--ease-standard'],
    transitionDuration: durationVars['--duration-fast-max'],
  },
  hidden: {
    opacity: 0,
    pointerEvents: 'none',
    maxWidth: '32px',
  },
  visible: {
    opacity: 1,
    pointerEvents: 'auto',
  },
  collapsed: {
    maxWidth: '32px',
  },
  expanded: {
    maxWidth: '200px',
  },
  button: {
    [radiusVars['--radius-element'] as string]: radiusVars['--radius-full'],
    whiteSpace: 'nowrap',
    paddingInline: spacingVars['--spacing-2'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Floating scroll-to-bottom button for use inside XDSChatLayout.
 *
 * @example
 * ```
 * <XDSChatLayoutScrollButton isVisible={!isAtBottom} onClick={scrollToBottom} />
 * ```
 */
export function XDSChatLayoutScrollButton({
  ref,
  isVisible,
  label,
  onClick,
  xstyle,
  className,
  style,
}: XDSChatLayoutScrollButtonProps) {
  return (
    <div
      ref={ref}
      {...mergeProps(stylex.props(styles.wrapper, xstyle), className, style)}>
      <div
        {...stylex.props(
          styles.container,
          isVisible ? styles.visible : styles.hidden,
          label ? styles.expanded : styles.collapsed,
        )}>
        <XDSButton
          label={label ?? 'Scroll to bottom'}
          aria-label={label ?? 'Scroll to bottom'}
          icon={<XDSIcon icon="chevronDown" size="md" />}
          variant="ghost"
          size="md"
          onClick={onClick}
          xstyle={styles.button}>
          {label ?? undefined}
        </XDSButton>
      </div>
    </div>
  );
}

XDSChatLayoutScrollButton.displayName = 'XDSChatLayoutScrollButton';
