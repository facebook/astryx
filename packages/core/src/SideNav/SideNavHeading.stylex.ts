// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  fontWeightVars,
  radiusVars,
  typeScaleVars,
} from '../theme/tokens.stylex';

export const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    minHeight: spacingVars['--spacing-8'],
    paddingInlineStart: {
      default: spacingVars['--spacing-2'],
      ':has(.astryx-nav-icon)': 0,
    },
    paddingInlineEnd: spacingVars['--spacing-2'],
    paddingBlock: 0,
    boxSizing: 'border-box',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'default',
  },
  rootCollapsed: {
    justifyContent: 'center',
    paddingInline: 0,
  },
  interactive: {
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    borderRadius: radiusVars['--radius-element'],
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: fontWeightVars['--font-weight-normal'],
    textAlign: 'start',
    ':hover:where(:not(:disabled,[aria-disabled="true"]))': {
      '@media (hover: hover)': {
        backgroundColor: colorVars['--color-overlay-hover'],
      },
    },
  },
  // Menu trigger: like interactive but no hover background.
  // Only cursor:pointer signals interactivity; the popover provides context.
  menuTrigger: {
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    borderRadius: radiusVars['--radius-element'],
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: fontWeightVars['--font-weight-normal'],
    textAlign: 'start',
  },
  interactiveCollapsed: {
    backgroundColor: {
      default: 'transparent',
      ':hover:where(:not(:disabled,[aria-disabled="true"]))': {
        '@media (hover: hover)': 'transparent',
      },
    },
  },
  icon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  superheading: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  heading: {
    fontSize: typeScaleVars['--text-large-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: typeScaleVars['--text-large-leading'],
    color: colorVars['--color-text-primary'],
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // When super/sub headings are present, keep same size but allow compact layout
  headingCompact: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  subheading: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  headingLink: {
    textDecoration: 'none',
    color: 'inherit',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chevron: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: spacingVars['--spacing-7'],
    minHeight: spacingVars['--spacing-7'],
    color: colorVars['--color-icon-secondary'],
    // 28px is the hit/alignment box, not the glyph. Icon sizes its own span
    // with a matching font-size (the registry chevron is a 1em SVG), so pin
    // font-size back to inherit to keep the glyph at the 14px it renders at
    // today. The 28px min box still wins over Icon's width/height.
    fontSize: 'inherit',
  },
  headerEndContent: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    marginInlineStart: 'auto',
  },
  popoverContent: {
    padding: spacingVars['--spacing-1'],
    overflow: 'hidden',
  },
  // Static heading replica inside the popover — matches inline heading layout.
  // Clickable to close the popover.
  popoverHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    minHeight: spacingVars['--spacing-8'],
    paddingInlineStart: {
      default: spacingVars['--spacing-2'],
      ':has(.astryx-nav-icon)': 0,
    },
    paddingInlineEnd: spacingVars['--spacing-2'],
    paddingBlock: 0,
    marginBlockStart: spacingVars['--spacing-1'],
    marginBlockEnd: spacingVars['--spacing-2'],
    marginInline: spacingVars['--spacing-1'],
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  // Chevron inside the popover heading — same as chevron but rotated up
  popoverChevron: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: spacingVars['--spacing-7'],
    minHeight: spacingVars['--spacing-7'],
    color: colorVars['--color-icon-secondary'],
    // See `chevron` — keep the glyph on the inherited font-size.
    fontSize: 'inherit',
    transform: 'rotate(180deg)',
  },
  // Glyph inside a chevron *trigger* (the button already carries the 28px box
  // and the color, so the Icon only has to avoid resizing itself).
  chevronGlyph: {
    fontSize: 'inherit',
  },
  popover: {
    minWidth: 'anchor-size(width)',
    marginBlockStart: spacingVars['--spacing-1'],
  },
  // Overlap variant: popover covers the trigger so heading appears "in place".
  // Add 4px padding inside, then widen and shift to compensate so the
  // heading text inside the popover still aligns with the inline heading.
  popoverOverlap: {
    minWidth: 'calc(anchor-size(width) + 16px)',
    marginBlockStart: 'calc(-1 * anchor-size(height) - 8px)',
    marginInlineStart: '-8px',
  },
});
