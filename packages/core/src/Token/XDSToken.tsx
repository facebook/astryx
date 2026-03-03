/**
 * @file XDSToken.tsx
 * @input Uses React forwardRef, ReactNode, StyleXStyles
 * @output Exports XDSToken component, XDSTokenProps, XDSTokenColor types
 * @position Core implementation; consumed by index.ts, tested by XDSToken.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Token/README.md (props table, features, implementation notes)
 * - /packages/core/src/Token/XDSToken.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Token/index.ts (exports if types change)
 * - /apps/storybook/stories/Token.stories.tsx (storybook stories)
 */

import {forwardRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  sizeVars,
  transitionVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {XDSIcon} from '../Icon';

// =============================================================================
// Types
// =============================================================================

/**
 * Available color variants for the token.
 */
export type XDSTokenColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'gray';

export type XDSTokenSize = 'sm' | 'md';

export interface XDSTokenProps {
  /**
   * The text label displayed in the token.
   */
  label: string;
  /**
   * The size of the token.
   * @default 'md'
   */
  size?: XDSTokenSize;
  /**
   * The color variant of the token.
   * @default 'default'
   */
  color?: XDSTokenColor;
  /**
   * Optional icon to display before the label.
   */
  icon?: ReactNode;
  /**
   * Whether the token is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Callback when the remove (X) button is clicked.
   * When provided, a remove button is rendered.
   */
  onRemove?: (e: React.MouseEvent) => void;
  /**
   * Click handler. When provided, the token renders as a `<span>` container
   * with an invisible `<button>` inside for accessibility.
   */
  onClick?: (e: React.MouseEvent) => void;
  /**
   * Link URL. When provided, the token renders as an `<a>`.
   */
  href?: string;
  /**
   * Accessible description for the token.
   */
  description?: string;
  /**
   * Content rendered after the label (before the remove button, if present).
   */
  endContent?: ReactNode;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Additional StyleX styles to apply to the root element.
   */
  xstyle?: StyleXStyles;
  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    paddingBlock: 0,
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusVars['--radius-content'],
    fontFamily: 'inherit',
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-snug'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    maxWidth: '100%',
  },
  interactive: {
    cursor: 'pointer',
    transitionProperty: 'background-image',
    transitionDuration: transitionVars['--transition-fast'],
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      },
      ':active': `linear-gradient(${colorVars['--color-pressed-overlay']}, ${colorVars['--color-pressed-overlay']})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    pointerEvents: 'none' as const,
  },
  labelHidden: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  invisibleButton: {
    all: 'unset',
    cursor: 'inherit',
    font: 'inherit',
    color: 'inherit',
  },
  focusWithinOutline: {
    outline: {
      default: null,
      ':focus-within': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-within': '2px',
    },
  },
  removeButton: {
    all: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 0,
    marginInlineEnd: `calc(-1 * ${spacingVars['--spacing-1']})`,
    cursor: 'pointer',
    borderRadius: radiusVars['--radius-rounded'],
    width: '16px',
    height: '16px',
    color: 'inherit',
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    '::after': {
      content: '""',
      position: 'absolute',
      inset: '-14px',
    },
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: `calc(${sizeVars['--size-sm']} - 8px)`,
    fontSize: textSizeVars['--text-xsm'],
    paddingInline: spacingVars['--spacing-2'],
  },
  md: {
    height: `calc(${sizeVars['--size-md']} - 8px)`,
    paddingInline: spacingVars['--spacing-3'],
  },
});

const colorStyles = stylex.create({
  default: {
    backgroundColor: colorVars['--color-deemphasized'],
    color: colorVars['--color-text-primary'],
  },
  red: {
    backgroundColor: colorVars['--color-red-background'],
    color: colorVars['--color-red-text'],
  },
  orange: {
    backgroundColor: colorVars['--color-orange-background'],
    color: colorVars['--color-orange-text'],
  },
  yellow: {
    backgroundColor: colorVars['--color-yellow-background'],
    color: colorVars['--color-yellow-text'],
  },
  green: {
    backgroundColor: colorVars['--color-green-background'],
    color: colorVars['--color-green-text'],
  },
  teal: {
    backgroundColor: colorVars['--color-teal-background'],
    color: colorVars['--color-teal-text'],
  },
  cyan: {
    backgroundColor: colorVars['--color-cyan-background'],
    color: colorVars['--color-cyan-text'],
  },
  blue: {
    backgroundColor: colorVars['--color-blue-background'],
    color: colorVars['--color-blue-text'],
  },
  purple: {
    backgroundColor: colorVars['--color-purple-background'],
    color: colorVars['--color-purple-text'],
  },
  pink: {
    backgroundColor: colorVars['--color-pink-background'],
    color: colorVars['--color-pink-text'],
  },
  gray: {
    backgroundColor: colorVars['--color-gray-background'],
    color: colorVars['--color-gray-text'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * A chip/tag component for displaying entities inline.
 *
 * Renders as a `<span>` by default, `<a>` when `href` is provided, or a
 * `<span>` container with an invisible `<button>` when `onClick` is provided.
 * The invisible button pattern provides real button semantics for accessibility
 * while the container uses `:focus-within` to show focus outlines around the
 * entire token.
 *
 * @example
 * ```
 * <XDSToken label="Tag" />
 * <XDSToken label="Status" color="green" />
 * <XDSToken label="Removable" onRemove={() => {}} />
 * <XDSToken label="Clickable" onClick={() => {}} />
 * <XDSToken label="Link" href="/path" />
 * ```
 */
export const XDSToken = forwardRef<HTMLElement, XDSTokenProps>(
  (
    {
      label,
      size = 'md',
      color = 'default',
      icon,
      isDisabled = false,
      onRemove,
      onClick,
      href,
      description,
      endContent,
      isLabelHidden = false,
      xstyle,
      'data-testid': testId,
    },
    ref,
  ) => {
    const content = (
      <>
        {icon}
        <span {...(isLabelHidden ? stylex.props(styles.labelHidden) : {})}>
          {label}
        </span>
        {endContent}
        {onRemove != null && (
          <button
            type="button"
            aria-label={`Remove ${label}`}
            onClick={e => {
              e.stopPropagation();
              onRemove(e);
            }}
            disabled={isDisabled}
            {...stylex.props(styles.removeButton)}>
            <XDSIcon icon="close" size="xsm" color="inherit" />
          </button>
        )}
      </>
    );

    const sharedProps = {
      'data-testid': testId,
      'aria-label': isLabelHidden ? label : undefined,
      'aria-description': description,
    };

    if (href != null) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          aria-disabled={isDisabled || undefined}
          {...sharedProps}
          {...stylex.props(
            styles.base,
            sizeStyles[size],
            colorStyles[color],
            styles.interactive,
            isDisabled && styles.disabled,
            xstyle,
          )}>
          {content}
        </a>
      );
    }

    if (onClick != null) {
      const handleContainerClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button, a')) return;
        onClick(e);
      };

      return (
        <span
          ref={ref as React.Ref<HTMLSpanElement>}
          onClick={isDisabled ? undefined : handleContainerClick}
          {...sharedProps}
          {...stylex.props(
            styles.base,
            sizeStyles[size],
            colorStyles[color],
            styles.interactive,
            styles.focusWithinOutline,
            isDisabled && styles.disabled,
            xstyle,
          )}>
          {icon}
          <button
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            {...stylex.props(styles.invisibleButton)}>
            <span {...(isLabelHidden ? stylex.props(styles.labelHidden) : {})}>
              {label}
            </span>
          </button>
          {endContent}
          {onRemove != null && (
            <button
              type="button"
              aria-label={`Remove ${label}`}
              onClick={e => {
                e.stopPropagation();
                onRemove(e);
              }}
              disabled={isDisabled}
              {...stylex.props(styles.removeButton)}>
              <XDSIcon icon="close" size="xsm" color="inherit" />
            </button>
          )}
        </span>
      );
    }

    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        {...sharedProps}
        {...stylex.props(
          styles.base,
          sizeStyles[size],
          colorStyles[color],
          isDisabled && styles.disabled,
          xstyle,
        )}>
        {content}
      </span>
    );
  },
);

XDSToken.displayName = 'XDSToken';
