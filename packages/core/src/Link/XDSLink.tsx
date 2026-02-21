/**
 * @file XDSLink.tsx
 * @input Uses React forwardRef, AnchorHTMLAttributes, ReactNode
 * @output Exports XDSLink component, XDSLinkProps
 * @position Core implementation; consumed by index.ts, tested by XDSLink.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Link/README.md (props table, features, implementation notes)
 * - /packages/core/src/Link/XDSLink.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Link/index.ts (exports if types change)
 * - /apps/storybook/stories/Link.stories.tsx (storybook stories)
 */

import {
  forwardRef,
  useContext,
  type AnchorHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  transitionVars,
  textSizeVars,
  lineHeightVars,
  spacingVars,
} from '../theme/tokens.stylex';
import {ThemeContext} from '../theme/ThemeContext';
import type {StyleXStyles as ThemeStyleXStyles} from '../theme/types';
import {XDSIcon} from '../Icon';
import {XDSTooltip} from '../Layer';
import {XDSText} from '../Text';
import type {
  XDSTextType,
  XDSTextSize,
  XDSTextColor,
  XDSTextWeight,
  XDSTextDisplay,
} from '../theme/types';

/**
 * Base link styles
 */
const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-0-5'],
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    fontWeight: 'inherit',
    textDecoration: {
      default: 'none',
      ':hover': 'underline',
    },
    cursor: 'pointer',
    transitionProperty: 'color, text-decoration',
    transitionDuration: transitionVars['--transition-fast'],
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  hasUnderline: {
    textDecoration: 'underline',
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    pointerEvents: 'none',
  },
  standalone: {
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
  },
});

/**
 * Link color styles — applied to the <a> element so the underline
 * and icon colors match the text color set by XDSText.
 */
const linkColorStyles = stylex.create({
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
// Module Augmentation - Register Link's style surfaces with ComponentStyles
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    link?: {
      root?: ThemeStyleXStyles;
    };
  }
}

export interface XDSLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'children'
> {
  /**
   * Accessible label for the link (required for accessibility).
   * Used as aria-label when content is not self-descriptive.
   */
  label: string;
  /**
   * Link destination URL.
   */
  href?: string;
  /**
   * Whether the link should always display an underline.
   * When false, underline only appears on hover.
   * @default false
   */
  hasUnderline?: boolean;
  /**
   * Whether the link is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the link opens in a new tab with an external link icon.
   * When true, sets target="_blank" and rel="noopener noreferrer".
   * @default false
   */
  isExternalLink?: boolean;
  /**
   * Where to open the linked document.
   * Overridden to "_blank" when isExternalLink is true.
   */
  target?: string;
  /**
   * Click event handler.
   */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /**
   * Tooltip text to display on hover.
   */
  tooltip?: string;
  /**
   * Whether the link is standalone (not inline within text).
   * Applies base font sizing when true.
   * @default false
   */
  isStandalone?: boolean;
  /**
   * Semantic text type for XDSText. Determines base typography.
   * @default 'body'
   */
  type?: XDSTextType;
  /**
   * Explicit font size override. Forwarded to XDSText.
   */
  size?: XDSTextSize;
  /**
   * Font weight override. Forwarded to XDSText.
   */
  weight?: XDSTextWeight;
  /**
   * Text color. Forwarded to XDSText.
   * @default 'active'
   */
  color?: XDSTextColor;
  /**
   * Display type for XDSText. Forwarded to XDSText.
   * @default 'inline'
   */
  display?: XDSTextDisplay;
  /**
   * Maximum lines before truncation. Forwarded to XDSText.
   * @default 0
   */
  maxLines?: number;
  /**
   * Link content (required).
   */
  children: ReactNode;
}

/**
 * A styled anchor link component.
 *
 * Uses XDSText internally for typography styling.
 * Wrap your app in <Theme> to apply a theme.
 *
 * @example
 * ```tsx
 * // Basic link
 * <XDSLink label="Documentation" href="/docs">Documentation</XDSLink>
 *
 * // External link (opens in new tab with icon)
 * <XDSLink label="GitHub" href="https://github.com" isExternalLink>GitHub</XDSLink>
 *
 * // Link with custom color
 * <XDSLink label="Settings" href="/settings" color="secondary">Settings</XDSLink>
 *
 * // Always underlined link
 * <XDSLink label="Privacy Policy" href="/privacy" hasUnderline>Privacy Policy</XDSLink>
 * ```
 */
export const XDSLink = forwardRef<HTMLAnchorElement, XDSLinkProps>(
  (
    {
      label,
      href,
      hasUnderline = false,
      isDisabled = false,
      isExternalLink = false,
      target,
      onClick,
      tooltip,
      isStandalone = false,
      type = 'body',
      size,
      weight,
      color = 'active',
      display = 'inline',
      maxLines = 0,
      children,
      rel,
      ...props
    },
    ref,
  ) => {
    // Determine target and rel based on isExternalLink
    const computedTarget = isExternalLink ? '_blank' : target;
    const computedRel = isExternalLink
      ? rel
        ? `${rel} noopener noreferrer`
        : 'noopener noreferrer'
      : rel;

    // Get theme context for component-level overrides (optional)
    const themeContext = useContext(ThemeContext);
    const rootOverride = themeContext?.theme.components?.link?.root;

    const linkElement = (
      <a
        ref={ref}
        href={href}
        target={computedTarget}
        rel={computedRel}
        onClick={onClick}
        aria-label={label}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        {...stylex.props(
          styles.base,
          linkColorStyles[color],
          hasUnderline && styles.hasUnderline,
          isStandalone && styles.standalone,
          isDisabled && styles.disabled,
          rootOverride,
        )}
        {...props}>
        <XDSText
          type={type}
          size={size}
          weight={weight}
          color={color}
          display={display}
          maxLines={maxLines}>
          {children}
        </XDSText>
        {isExternalLink && (
          <XDSIcon icon="externalLink" size="xsm" color="inherit" />
        )}
      </a>
    );

    // Wrap with tooltip if provided
    if (tooltip) {
      return (
        <XDSTooltip content={tooltip} placement="above">
          {linkElement}
        </XDSTooltip>
      );
    }

    return linkElement;
  },
);

XDSLink.displayName = 'XDSLink';
