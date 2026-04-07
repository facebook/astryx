'use client';

/**
 * @file XDSChatComposerAttachments.tsx
 * @input Uses React, StyleX, XDSBaseProps
 * @output Exports XDSChatComposerAttachments flex-wrap container
 * @position Core implementation; consumed by index.ts
 *
 * Simple flex-wrap layout container for attachment chips inside
 * the chat composer.
 */

import {type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface XDSChatComposerAttachmentsProps
  extends XDSBaseProps<HTMLDivElement> {
  /** Attachment chip elements */
  children: ReactNode;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-1'],
    alignItems: 'center',
  },
});

// =============================================================================
// Component
// =============================================================================

export function XDSChatComposerAttachments(
  props: XDSChatComposerAttachmentsProps,
) {
  const {children, xstyle, className, style, ...rest} = props;

  return (
    <div
      {...mergeProps(
        xdsClassName('chat-composer-attachments'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

XDSChatComposerAttachments.displayName = 'XDSChatComposerAttachments';
