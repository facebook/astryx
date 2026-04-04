/**
 * @file markdown.stylex.ts
 * @input Uses StyleX, XDS design tokens
 * @output Exports StyleX styles for XDSMarkdown element rendering
 * @position Styles; consumed by XDSMarkdown.tsx
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
  fontWeightVars,
  typeScaleVars,
  borderVars,
} from '@xds/core/theme/tokens.stylex';

const cursorBlink = stylex.keyframes({
  '0%, 100%': {opacity: 1},
  '50%': {opacity: 0},
});

export const rootStyles = stylex.create({
  base: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  },
});

export const blockStyles = stylex.create({
  default: {
    marginBlockStart: spacingVars['--spacing-3'],
    marginBlockEnd: spacingVars['--spacing-3'],
  },
  compact: {
    marginBlockStart: spacingVars['--spacing-1'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  firstChild: {
    marginBlockStart: '0',
  },
  lastChild: {
    marginBlockEnd: '0',
  },
});

export const headingStyles = stylex.create({
  base: {
    fontFamily: typographyVars['--font-family-heading'],
    color: colorVars['--color-text-primary'],
  },
  h1: {
    fontSize: typeScaleVars['--text-heading-1-size'],
    fontWeight: typeScaleVars['--text-heading-1-weight'],
    lineHeight: typeScaleVars['--text-heading-1-leading'],
    marginBlockStart: spacingVars['--spacing-6'],
    marginBlockEnd: spacingVars['--spacing-3'],
  },
  h1Compact: {
    fontSize: typeScaleVars['--text-heading-1-size'],
    fontWeight: typeScaleVars['--text-heading-1-weight'],
    lineHeight: typeScaleVars['--text-heading-1-leading'],
    marginBlockStart: spacingVars['--spacing-3'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  h2: {
    fontSize: typeScaleVars['--text-heading-2-size'],
    fontWeight: typeScaleVars['--text-heading-2-weight'],
    lineHeight: typeScaleVars['--text-heading-2-leading'],
    marginBlockStart: spacingVars['--spacing-6'],
    marginBlockEnd: spacingVars['--spacing-3'],
  },
  h2Compact: {
    fontSize: typeScaleVars['--text-heading-2-size'],
    fontWeight: typeScaleVars['--text-heading-2-weight'],
    lineHeight: typeScaleVars['--text-heading-2-leading'],
    marginBlockStart: spacingVars['--spacing-3'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  h3: {
    fontSize: typeScaleVars['--text-heading-3-size'],
    fontWeight: typeScaleVars['--text-heading-3-weight'],
    lineHeight: typeScaleVars['--text-heading-3-leading'],
    marginBlockStart: spacingVars['--spacing-5'],
    marginBlockEnd: spacingVars['--spacing-2'],
  },
  h3Compact: {
    fontSize: typeScaleVars['--text-heading-3-size'],
    fontWeight: typeScaleVars['--text-heading-3-weight'],
    lineHeight: typeScaleVars['--text-heading-3-leading'],
    marginBlockStart: spacingVars['--spacing-3'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  h4: {
    fontSize: typeScaleVars['--text-heading-4-size'],
    fontWeight: typeScaleVars['--text-heading-4-weight'],
    lineHeight: typeScaleVars['--text-heading-4-leading'],
    marginBlockStart: spacingVars['--spacing-4'],
    marginBlockEnd: spacingVars['--spacing-2'],
  },
  h4Compact: {
    fontSize: typeScaleVars['--text-heading-4-size'],
    fontWeight: typeScaleVars['--text-heading-4-weight'],
    lineHeight: typeScaleVars['--text-heading-4-leading'],
    marginBlockStart: spacingVars['--spacing-2'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
});

export const inlineStyles = stylex.create({
  strong: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  em: {
    fontStyle: 'italic',
  },
  del: {
    textDecoration: 'line-through',
    color: colorVars['--color-text-secondary'],
  },
  inlineCode: {
    fontFamily: typographyVars['--font-family-code'],
    fontSize: '0.9em',
    backgroundColor: colorVars['--color-background-muted'],
    paddingInline: spacingVars['--spacing-1'],
    paddingBlock: '1px',
    borderRadius: radiusVars['--radius-inner'],
  },
});

export const linkStyles = stylex.create({
  base: {
    color: colorVars['--color-text-accent'],
    textDecoration: {
      default: 'none',
      ':hover': 'underline',
    },
  },
});

export const blockquoteStyles = stylex.create({
  default: {
    marginBlock: spacingVars['--spacing-4'],
    marginInline: 0,
    paddingInlineStart: spacingVars['--spacing-4'],
    borderInlineStart: `3px solid ${colorVars['--color-accent']}`,
    color: colorVars['--color-text-secondary'],
  },
  compact: {
    marginBlock: spacingVars['--spacing-2'],
    marginInline: 0,
    paddingInlineStart: spacingVars['--spacing-3'],
    borderInlineStart: `3px solid ${colorVars['--color-accent']}`,
    color: colorVars['--color-text-secondary'],
  },
});

export const listStyles = stylex.create({
  ul: {
    paddingInlineStart: spacingVars['--spacing-5'],
    listStyleType: 'disc',
  },
  ol: {
    paddingInlineStart: spacingVars['--spacing-5'],
    listStyleType: 'decimal',
  },
  li: {
    marginBlockStart: spacingVars['--spacing-1'],
  },
  liCompact: {
    marginBlockStart: '0',
  },
  taskListItem: {
    listStyleType: 'none',
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-2'],
  },
  taskCheckbox: {
    marginBlockStart: '0.3em',
    accentColor: colorVars['--color-accent'],
  },
});

export const codeBlockStyles = stylex.create({
  pre: {
    marginBlock: spacingVars['--spacing-4'],
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-muted'],
    border: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
    overflow: 'auto',
  },
  preCompact: {
    marginBlock: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-muted'],
    border: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
    overflow: 'auto',
  },
  code: {
    display: 'block',
    fontFamily: typographyVars['--font-family-code'],
    fontSize: typeScaleVars['--text-code-size'],
    lineHeight: typeScaleVars['--text-code-leading'],
    padding: spacingVars['--spacing-4'],
    whiteSpace: 'pre',
    overflowX: 'auto',
  },
});

export const tableStyles = stylex.create({
  wrapper: {
    marginBlock: spacingVars['--spacing-4'],
    overflowX: 'auto',
  },
  wrapperCompact: {
    marginBlock: spacingVars['--spacing-2'],
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
  th: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
    textAlign: 'start',
    borderBottom: `2px solid ${colorVars['--color-border']}`,
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
  },
  td: {
    borderBottom: `1px solid ${colorVars['--color-border']}`,
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    verticalAlign: 'top',
  },
});

export const hrStyles = stylex.create({
  default: {
    marginBlock: spacingVars['--spacing-6'],
    border: 'none',
    borderTop: `1px solid ${colorVars['--color-border']}`,
  },
  compact: {
    marginBlock: spacingVars['--spacing-3'],
    border: 'none',
    borderTop: `1px solid ${colorVars['--color-border']}`,
  },
});

export const imgStyles = stylex.create({
  base: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: radiusVars['--radius-element'],
  },
});

export const streamingStyles = stylex.create({
  cursor: {
    display: 'inline-block',
    width: '2px',
    height: '1.1em',
    backgroundColor: colorVars['--color-accent'],
    marginInlineStart: '1px',
    verticalAlign: 'text-bottom',
    animationName: cursorBlink,
    animationDuration: '1s',
    animationIterationCount: 'infinite',
  },
});
