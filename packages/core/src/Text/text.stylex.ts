/**
 * @file text.stylex.ts
 * @input Uses StyleX, theme tokens
 * @output Exports StyleX styles for XDSText and XDSHeading props
 * @position Styles module; consumed by XDSText.tsx, XDSHeading.tsx
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Text/README.md
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  fontWeightVars,
} from '../theme/tokens.stylex';

// =============================================================================
// Color Styles
// =============================================================================

export const colorStyles = stylex.create({
  primary: {
    color: colorVars['--color-text-primary'],
  },
  secondary: {
    color: colorVars['--color-text-secondary'],
  },
  disabled: {
    color: colorVars['--color-text-disabled'],
  },
  placeholder: {
    color: colorVars['--color-text-placeholder'],
  },
  active: {
    color: colorVars['--color-accent'],
  },
  inherit: {
    color: 'inherit',
  },
});

// =============================================================================
// Weight Styles
// =============================================================================

export const weightStyles = stylex.create({
  normal: {
    fontWeight: fontWeightVars['--font-weight-normal'],
  },
  medium: {
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  semibold: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  bold: {
    fontWeight: fontWeightVars['--font-weight-bold'],
  },
});

// =============================================================================
// Display Styles
// =============================================================================

export const displayStyles = stylex.create({
  inline: {
    display: 'inline',
  },
  block: {
    display: 'block',
  },
});

// =============================================================================
// Truncation Styles
// =============================================================================

export const truncationStyles = stylex.create({
  // Single-line truncation (maxLines=1)
  singleLine: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
  },
  // Multi-line truncation base (maxLines>1)
  // Note: -webkit-line-clamp value is set via inline style
  multiLine: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
  },
});

// =============================================================================
// Word Break Styles
// =============================================================================

export const wordBreakStyles = stylex.create({
  'break-word': {
    wordBreak: 'normal',
    overflowWrap: 'break-word',
  },
  'break-all': {
    wordBreak: 'break-all',
  },
});

// =============================================================================
// Text Wrap Styles
// =============================================================================

export const textWrapStyles = stylex.create({
  wrap: {
    textWrap: 'wrap',
  },
  nowrap: {
    textWrap: 'nowrap',
  },
  balance: {
    textWrap: 'balance',
  },
  pretty: {
    textWrap: 'pretty',
  },
});

// =============================================================================
// Capsize Styles (Text Box Trim)
// =============================================================================

export const capsizeStyles = stylex.create({
  enabled: {
    textBoxEdge: 'cap alphabetic',
    textBoxTrim: 'trim-both',
    display: 'block',
  },
});

// =============================================================================
// Decoration Styles
// =============================================================================

export const decorationStyles = stylex.create({
  strikethrough: {
    textDecoration: 'line-through',
  },
});

// =============================================================================
// Tabular Numbers Style
// =============================================================================

export const tabularNumbersStyle = stylex.create({
  enabled: {
    fontVariantNumeric: 'tabular-nums',
  },
});

// =============================================================================
// Truncation Tooltip Content Style
// =============================================================================

export const truncationTooltipStyles = stylex.create({
  content: {
    maxWidth: '300px',
    wordBreak: 'break-word',
  },
});
