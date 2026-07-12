// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatLayoutScrollButton.tsx
 * @input Uses React, StyleX, Button, Icon, theme tokens
 * @output Exports ChatLayoutScrollButton component
 * @position Composable scroll-to-bottom button for use inside ChatLayout
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
import {Icon} from '../Icon';
import {Button} from '../Button';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface ChatLayoutScrollButtonProps extends Omit<
  BaseProps<HTMLDivElement>,
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
  // When a label is shown, the icon sits on the leading edge and the text on
  // the trailing edge. Symmetric padding leaves the text cramped against the
  // pill's rounded edge, so give the trailing side extra breathing room.
  buttonWithLabel: {
    paddingInlineEnd: spacingVars['--spacing-3'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Floating scroll-to-bottom button for use inside ChatLayout.
 *
 * @example
 * ```
 * <ChatLayoutScrollButton isVisible={!isAtBottom} onClick={scrollToBottom} />
 * ```
 */
export function ChatLayoutScrollButton({
  ref,
  isVisible,
  label,
  onClick,
  xstyle,
  className,
  style,
  ...rest
}: ChatLayoutScrollButtonProps) {
  return (
    <div
      ref={ref}
      {...mergeProps(stylex.props(styles.wrapper, xstyle), className, style)}
      {...rest}>
      <div
        {...stylex.props(
          styles.container,
          isVisible ? styles.visible : styles.hidden,
          label ? styles.expanded : styles.collapsed,
        )}>
        <Button
          label={label ?? 'Scroll to bottom'}
          aria-label={label ?? 'Scroll to bottom'}
          icon={<Icon icon="chevronDown" size="md" />}
          variant="ghost"
          size="md"
          onClick={onClick}
          xstyle={[styles.button, label ? styles.buttonWithLabel : null]}>
          {label ?? undefined}
        </Button>
      </div>
    </div>
  );
}

ChatLayoutScrollButton.displayName = 'ChatLayoutScrollButton';
