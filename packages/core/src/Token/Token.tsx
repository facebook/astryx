// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Token.tsx
 * @input Uses React, ReactNode, StyleXStyles
 * @output Exports Token component, TokenProps, TokenColor types
 * @position Core implementation; consumed by index.ts, tested by Token.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Token/Token.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Token/Token.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Token/index.ts (exports if types change)
 * - /apps/storybook/stories/Token.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Token/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  sizeVars,
  durationVars,
  easeVars,
  fontWeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {Icon} from '../Icon';
import {mergeProps} from '../utils';
import {useLinkComponent} from '../Link/useLinkComponent';
import {useInteractiveRole} from '../hooks/useInteractiveRole';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Types
// =============================================================================

/**
 * Available color variants for the token.
 */
export type TokenColor =
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

export type TokenSize = 'sm' | 'md' | 'lg';

export interface TokenProps extends BaseProps<HTMLElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /**
   * The text label displayed in the token.
   */
  label: string;
  /**
   * The size of the token.
   * @default 'md'
   */
  size?: TokenSize;
  /**
   * The color variant of the token.
   * @default 'default'
   */
  color?: TokenColor;
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
    borderRadius: radiusVars['--radius-inner'],
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  interactive: {
    cursor: 'pointer',
    transitionProperty: 'background-image',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`,
      },
      ':active': `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
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
    outline: 'none',
    overflow: 'hidden',
    minWidth: 0,
  },
  focusVisibleOutline: {
    outline: {
      default: null,
      ':has(:focus-visible)': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':has(:focus-visible)': '2px',
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
    borderRadius: radiusVars['--radius-full'],
    width: '16px',
    height: '16px',
    color: 'inherit',
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
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
    height: `calc(${sizeVars['--size-element-sm']} - 8px)`,
    fontSize: typeScaleVars['--text-supporting-size'],
    paddingInline: spacingVars['--spacing-2'],
  },
  md: {
    height: `calc(${sizeVars['--size-element-md']} - 8px)`,
    paddingInline: spacingVars['--spacing-2'],
  },
  lg: {
    height: `calc(${sizeVars['--size-element-lg']} - 8px)`,
    paddingInline: spacingVars['--spacing-2'],
  },
});

const colorStyles = stylex.create({
  default: {
    backgroundColor: colorVars['--color-neutral'],
    color: colorVars['--color-text-primary'],
  },
  red: {
    backgroundColor: colorVars['--color-background-red'],
    color: colorVars['--color-text-red'],
  },
  orange: {
    backgroundColor: colorVars['--color-background-orange'],
    color: colorVars['--color-text-orange'],
  },
  yellow: {
    backgroundColor: colorVars['--color-background-yellow'],
    color: colorVars['--color-text-yellow'],
  },
  green: {
    backgroundColor: colorVars['--color-background-green'],
    color: colorVars['--color-text-green'],
  },
  teal: {
    backgroundColor: colorVars['--color-background-teal'],
    color: colorVars['--color-text-teal'],
  },
  cyan: {
    backgroundColor: colorVars['--color-background-cyan'],
    color: colorVars['--color-text-cyan'],
  },
  blue: {
    backgroundColor: colorVars['--color-background-blue'],
    color: colorVars['--color-text-blue'],
  },
  purple: {
    backgroundColor: colorVars['--color-background-purple'],
    color: colorVars['--color-text-purple'],
  },
  pink: {
    backgroundColor: colorVars['--color-background-pink'],
    color: colorVars['--color-text-pink'],
  },
  gray: {
    backgroundColor: colorVars['--color-background-gray'],
    color: colorVars['--color-text-gray'],
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
 * <Token label="Tag" />
 * <Token label="Status" color="green" />
 * <Token label="Removable" onRemove={() => {}} />
 * <Token label="Clickable" onClick={() => {}} />
 * <Token label="Link" href="/path" />
 * ```
 */
export function Token({
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
  className,
  style,
  'data-testid': testId,
  ref,
}: TokenProps) {
  const LinkComponent = useLinkComponent();
  const role = useInteractiveRole({href, onClick, isDisabled});

  // When role is 'button' via context (no explicit onClick), treat as
  // if onClick was provided — the popover attaches its own handler.
  const effectiveOnClick = onClick ?? (role === 'button' ? () => {} : null);

  const content = (
    <>
      {icon}
      <span
        {...stylex.props(styles.label, isLabelHidden && styles.labelHidden)}>
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
          <Icon icon="close" size="xsm" color="inherit" />
        </button>
      )}
    </>
  );

  const sharedProps = {
    'data-testid': testId,
    'aria-label': isLabelHidden ? label : undefined,
    'aria-description': description,
  };

  if (role === 'link') {
    return (
      <LinkComponent
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href as string}
        aria-disabled={isDisabled || undefined}
        {...sharedProps}
        {...mergeProps(
          themeProps('token', {color, size}),
          stylex.props(
            styles.base,
            sizeStyles[size],
            colorStyles[color],
            styles.interactive,
            isDisabled && styles.disabled,
            xstyle,
          ),
          className,
          style,
        )}>
        {content}
      </LinkComponent>
    );
  }

  if (effectiveOnClick != null) {
    const handleContainerClick = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a')) {
        return;
      }
      effectiveOnClick(e);
    };

    return (
      <span
        ref={ref}
        onClick={isDisabled ? undefined : handleContainerClick}
        {...sharedProps}
        {...mergeProps(
          themeProps('token', {color, size}),
          stylex.props(
            styles.base,
            sizeStyles[size],
            colorStyles[color],
            styles.interactive,
            styles.focusVisibleOutline,
            isDisabled && styles.disabled,
            xstyle,
          ),
          className,
          style,
        )}>
        {icon}
        <button
          type="button"
          onClick={effectiveOnClick}
          disabled={isDisabled}
          {...stylex.props(styles.invisibleButton)}>
          <span
            {...stylex.props(
              styles.label,
              isLabelHidden && styles.labelHidden,
            )}>
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
            <Icon icon="close" size="xsm" color="inherit" />
          </button>
        )}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      {...sharedProps}
      {...mergeProps(
        themeProps('token', {color, size}),
        stylex.props(
          styles.base,
          sizeStyles[size],
          colorStyles[color],
          isDisabled && styles.disabled,
          xstyle,
        ),
        className,
        style,
      )}>
      {content}
    </span>
  );
}

Token.displayName = 'Token';
