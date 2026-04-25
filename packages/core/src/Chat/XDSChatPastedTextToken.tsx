'use client';

/**
 * @file XDSChatPastedTextToken.tsx
 * @input Uses React, StyleX, XDSBadge, XDSHoverCard, XDSButton, XDSCodeBlock
 * @output Exports XDSChatPastedTextToken component
 * @position Inline token for pasted text with hover card preview + expand
 *
 * Hover: card with truncated text preview and "Expand" button.
 * Expand replaces the token with the full text in the contentEditable.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /packages/cli/templates/blocks/components/Chat/ (showcase blocks)
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {XDSBadge} from '../Badge';
import {XDSButton} from '../Button';
import {XDSHoverCard} from '../HoverCard';

// =============================================================================
// Types
// =============================================================================

export interface XDSChatPastedTextTokenProps {
  /** The full pasted text. */
  text: string;
  /** Called when the user clicks Expand — dissolves the token into editable text. */
  onExpand?: () => void;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  preview: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
    maxWidth: '480px',
  },
  previewText: {
    fontFamily: typographyVars['--font-family-code'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-primary'],
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxHeight: '240px',
    overflowY: 'auto',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
  },
  meta: {
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
  },
});

// =============================================================================
// Helpers
// =============================================================================

function formatLabel(text: string): string {
  const lines = text.split('\n').length;
  const chars = text.length;
  return lines > 1
    ? `${lines} lines, ${chars} chars`
    : `${chars} chars`;
}



// =============================================================================
// Component
// =============================================================================

export function XDSChatPastedTextToken({
  text,
  onExpand,
}: XDSChatPastedTextTokenProps) {
  const label = formatLabel(text);


  const cardContent = (
    <div {...stylex.props(styles.preview)}>
      <div {...stylex.props(styles.previewText)}>{text}</div>
      <div {...stylex.props(styles.footer)}>
        <span {...stylex.props(styles.meta)}>{label}</span>
        {onExpand && (
          <XDSButton
            label="Expand"
            variant="ghost"
            size="sm"
            onClick={onExpand}
          />
        )}
      </div>
    </div>
  );

  return (
    <XDSHoverCard
      content={cardContent}
      placement="above"
      alignment="start"
      hasHoverIndication={false}>
      <XDSBadge label={label} variant="neutral" />
    </XDSHoverCard>
  );
}

XDSChatPastedTextToken.displayName = 'XDSChatPastedTextToken';
