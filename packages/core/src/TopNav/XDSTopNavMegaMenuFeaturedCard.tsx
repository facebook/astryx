/**
 * @file XDSTopNavMegaMenuFeaturedCard.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSTopNavMegaMenuFeaturedCard component
 * @position Standard featured card for the XDSTopNavMegaMenu featured slot.
 *
 * Provides a consistent appearance for promotional/featured content in mega menus.
 * The `featured` slot on XDSTopNavMegaMenu is still open ReactNode — this component
 * is the standard card, but consumers can pass anything.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/index.ts
 */

'use client';

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  image: {
    width: '100%',
    height: 140,
    objectFit: 'cover' as const,
    display: 'block',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
    padding: spacingVars['--spacing-4'],
  },
  title: {
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: lineHeightVars['--leading-base'],
    color: colorVars['--color-text-primary'],
  },
  description: {
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-text-secondary'],
  },
  link: {
    fontSize: textSizeVars['--text-sm'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-accent-text'],
    textDecoration: 'none',
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSTopNavMegaMenuFeaturedCardProps {
  /** Card title. */
  title: string;
  /** Description text below the title. */
  description?: string;
  /** Optional image URL displayed above the body. */
  image?: string;
  /** Alt text for the image. */
  imageAlt?: string;
  /** CTA link text. */
  linkLabel?: string;
  /** CTA link URL. */
  linkHref?: string;
  /** Custom content rendered below the standard body. */
  children?: ReactNode;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Standard featured card for the XDSTopNavMegaMenu `featured` slot.
 *
 * Provides a consistent card with optional image, title, description,
 * and CTA link. For fully custom content, pass any ReactNode directly
 * to the `featured` slot instead.
 *
 * @example
 * ```
 * <XDSTopNavMegaMenu
 *   label="Products"
 *   items={...}
 *   featured={
 *     <XDSTopNavMegaMenuFeaturedCard
 *       title="What's new in v4.0"
 *       description="AI-powered analytics and real-time collaboration."
 *       image="https://example.com/promo.jpg"
 *       imageAlt="Team collaboration"
 *       linkLabel="Read the announcement"
 *       linkHref="/blog/v4"
 *     />
 *   }
 * />
 * ```
 */
export function XDSTopNavMegaMenuFeaturedCard({
  title,
  description,
  image,
  imageAlt,
  linkLabel,
  linkHref,
  children,
}: XDSTopNavMegaMenuFeaturedCardProps) {
  return (
    <div {...stylex.props(styles.root)}>
      {image && (
        <img src={image} alt={imageAlt ?? ''} {...stylex.props(styles.image)} />
      )}
      <div {...stylex.props(styles.body)}>
        <span {...stylex.props(styles.title)}>{title}</span>
        {description && (
          <span {...stylex.props(styles.description)}>{description}</span>
        )}
        {linkLabel && linkHref && (
          <a href={linkHref} {...stylex.props(styles.link)}>
            {linkLabel} →
          </a>
        )}
        {children}
      </div>
    </div>
  );
}

XDSTopNavMegaMenuFeaturedCard.displayName = 'XDSTopNavMegaMenuFeaturedCard';
