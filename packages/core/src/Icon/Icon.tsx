// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Icon.tsx
 * @input Uses ReactSVGProps, icon components or semantic icon names
 * @output Exports Icon component, IconProps, IconColor, IconSize, IconType types
 * @position Core implementation; consumed by index.ts, tested by Icon.test.tsx
 *
 * Supports two modes:
 * - Component mode: Pass an SVG icon component (e.g. from @heroicons/react) — rendered
 *   directly with and spread SVG props.
 * - String mode: Pass a semantic name (e.g. 'close', 'chevronDown') — resolved from the
 *   theme's icon registry (or built-in fallback SVGs) and wrapped in a styled span.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Icon/Icon.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Icon/Icon.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Icon/index.ts (exports if types change)
 * - /apps/storybook/stories/Icon.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Icon/ (showcase blocks)
 */

import React, {type ComponentType, type SVGProps} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {getIcon} from './globalIconRegistry';
import type {IconName} from './globalIconRegistry';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    flexShrink: 0,
  },
  /** Wrapper for string-based (registry) icons */
  span: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

const colorStyles = stylex.create({
  primary: {
    color: colorVars['--color-icon-primary'],
  },
  secondary: {
    color: colorVars['--color-icon-secondary'],
  },
  tertiary: {
    color: colorVars['--color-icon-secondary'],
  },
  disabled: {
    color: colorVars['--color-icon-disabled'],
  },
  accent: {
    color: colorVars['--color-accent'],
  },
  success: {
    color: colorVars['--color-success'],
  },
  error: {
    color: colorVars['--color-error'],
  },
  warning: {
    color: colorVars['--color-warning'],
  },
  inherit: {
    color: 'inherit',
  },
  // Non-semantic colors
  blue: {
    color: colorVars['--color-icon-blue'],
  },
  red: {
    color: colorVars['--color-icon-red'],
  },
  green: {
    color: colorVars['--color-icon-green'],
  },
  gray: {
    color: colorVars['--color-icon-gray'],
  },
  cyan: {
    color: colorVars['--color-icon-cyan'],
  },
  teal: {
    color: colorVars['--color-icon-teal'],
  },
  yellow: {
    color: colorVars['--color-icon-yellow'],
  },
  orange: {
    color: colorVars['--color-icon-orange'],
  },
  pink: {
    color: colorVars['--color-icon-pink'],
  },
  purple: {
    color: colorVars['--color-icon-purple'],
  },
});

/**
 * Size styles for direct SVG icon components.
 * Uses width/height only — SVG components handle their own viewBox scaling.
 *
 * Sizes are expressed in `rem` (relative to the root font-size) so icons scale
 * in step with text when the document font-size changes, matching the rest of
 * the design system's rem-based type scale. Values are the px-equivalents at a
 * 16px root: 12px → 0.75rem, 16px → 1rem, 20px → 1.25rem, 24px → 1.5rem.
 */
const sizeStyles = stylex.create({
  xsm: {
    width: '0.75rem',
    height: '0.75rem',
  },
  sm: {
    width: '1rem',
    height: '1rem',
  },
  md: {
    width: '1.25rem',
    height: '1.25rem',
  },
  lg: {
    width: '1.5rem',
    height: '1.5rem',
  },
});

/**
 * Size styles for string-based (registry) icons.
 * Includes fontSize so that 1em-based icons from the registry scale correctly.
 *
 * Expressed in `rem` for the same reason as {@link sizeStyles} — icons track the
 * root font-size instead of being locked to absolute pixels.
 */
const spanSizeStyles = stylex.create({
  /* eslint-disable @astryx/no-hardcoded-styles -- fontSize here sizes 1em-based
     registry SVGs to the icon box; icons use their own 12/16/20/24 scale, not
     the 14px-anchored textSizeVars type scale. Values are rem so icons track
     the root font-size. */
  xsm: {
    width: '0.75rem',
    height: '0.75rem',
    fontSize: '0.75rem',
  },
  sm: {
    width: '1rem',
    height: '1rem',
    fontSize: '1rem',
  },
  md: {
    width: '1.25rem',
    height: '1.25rem',
    fontSize: '1.25rem',
  },
  lg: {
    width: '1.5rem',
    height: '1.5rem',
    fontSize: '1.5rem',
  },
  /* eslint-enable @astryx/no-hardcoded-styles */
});

// =============================================================================
// Types
// =============================================================================

export type IconColor = keyof typeof colorStyles;
export type IconSize = keyof typeof sizeStyles;

/**
 * Type for icon components that can be passed to Icon.
 * Use this type when accepting an icon prop in other components.
 */
export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Props for Icon component.
 * Extends SVGProps to allow passing additional SVG attributes (used when icon is a component).
 */
export interface IconProps extends Omit<
  SVGProps<SVGSVGElement>,
  'ref' | 'color'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<SVGSVGElement>;
  /**
   * Icon to render. Can be:
   * - A semantic name string (e.g. 'close', 'chevronDown') — resolved from theme or built-in fallback
   * - An SVG icon component (e.g. from @heroicons/react) — rendered directly
   */
  icon: IconType | IconName;
  /**
   * The color variant of the icon.
   * @default 'inherit'
   */
  color?: IconColor;
  /**
   * The size of the icon.
   * - 'xsm': 0.75rem (12px at a 16px root)
   * - 'sm': 1rem (16px at a 16px root)
   * - 'md': 1.25rem (20px at a 16px root)
   * - 'lg': 1.5rem (24px at a 16px root)
   * @default 'md'
   */
  size?: IconSize;
  /**
   * Accessible name for the icon. Set this only when the icon is MEANINGFUL on
   * its own — a standalone status glyph or an icon-only indicator with no
   * adjacent text conveying the same information. Providing it exposes the icon
   * to assistive tech as `role="img"` with this string as the accessible name
   * (via `aria-label`) and drops the default `aria-hidden="true"`.
   *
   * Omit it (the default) for decorative icons — the common case, e.g. an icon
   * beside a text label — and the icon stays hidden from assistive tech
   * (`aria-hidden="true"`). An empty string (`''`) is treated the same as
   * omitting it (decorative), since an empty accessible name is meaningless.
   *
   * Don't set `label` when an interactive parent (Button, IconButton, link)
   * already names the control — that produces a duplicate announcement.
   *
   * @example
   * ```
   * // Meaningful, standalone icon
   * <Icon icon="success" label="Completed" />
   *
   * // Decorative icon (default) — omit label
   * <Icon icon="search" />
   * ```
   */
  label?: string;
}

/**
 * Derives the ARIA attributes for an icon from its `label` prop.
 *
 * - Non-empty `label` → meaningful image: `role="img"` + `aria-label`, and no
 *   `aria-hidden` (an `aria-hidden` element is removed from the accessibility
 *   tree, so its accessible name would be ignored).
 * - Omitted or empty `label` → decorative default: `aria-hidden="true"`.
 *
 * The result is spread BEFORE `{...props}` in both render modes so an explicit
 * `aria-hidden` / `role` / `aria-label` from the consumer always wins.
 */
function getIconA11yProps(
  label: string | undefined,
): {role: 'img'; 'aria-label': string} | {'aria-hidden': 'true'} {
  return label != null && label !== ''
    ? {role: 'img', 'aria-label': label}
    : {'aria-hidden': 'true'};
}

// =============================================================================
// Component
// =============================================================================

/**
 * Renders an icon from the icon registry or a custom SVG component.
 *
 * @example
 * ```
 * <Icon icon="close" size="md" color="primary" />
 * ```
 */
export function Icon({
  icon,
  color = 'inherit',
  size = 'md',
  label,
  ref,
  ...props
}: IconProps) {
  // Derive ARIA from `label`: decorative (aria-hidden) by default, or a
  // meaningful image (role="img" + aria-label) when `label` is non-empty.
  const a11yProps = getIconA11yProps(label);

  // String mode: resolve from icon registry, wrap in styled span
  if (typeof icon === 'string') {
    return (
      <IconFromRegistry
        name={icon}
        color={color}
        size={size}
        a11yProps={a11yProps}
        spanProps={props}
      />
    );
  }

  // Component mode: render SVG component directly with ref forwarding
  const IconComponent = icon;
  return (
    <IconComponent
      ref={ref}
      // Derived a11y (decorative default or meaningful `label`) is spread
      // BEFORE {...props} so an explicit aria-hidden/role/aria-label from the
      // consumer still wins as an escape hatch.
      {...a11yProps}
      {...mergeProps(
        themeProps('icon', {size, color}),
        stylex.props(styles.root, colorStyles[color], sizeStyles[size]),
      )}
      {...props}
    />
  );
}

Icon.displayName = 'Icon';

// =============================================================================
// Internal: Registry Icon Renderer
// =============================================================================

/**
 * Internal component that resolves a semantic icon name from the registry
 * and renders it in a styled span with proper sizing.
 *
 * Extracted as a separate component so getIcon is only called
 * when the icon prop is a string.
 */
function IconFromRegistry({
  name,
  color,
  size,
  a11yProps,
  spanProps,
}: {
  name: IconName;
  color: IconColor;
  size: IconSize;
  a11yProps: {role: 'img'; 'aria-label': string} | {'aria-hidden': 'true'};
  spanProps?: Omit<SVGProps<SVGSVGElement>, 'ref' | 'color'>;
}) {
  const resolvedIcon = getIcon(name);

  if (resolvedIcon == null) {
    return null;
  }

  return (
    <span
      // Derived a11y — decorative (aria-hidden) by default, or a meaningful
      // image (role="img" + aria-label) when `label` is set. Placed BEFORE the
      // prop spread so consumers can still override it with explicit
      // aria-hidden/role/aria-label. This mirrors component-mode Icon.
      {...a11yProps}
      {...(spanProps as React.HTMLAttributes<HTMLSpanElement>)}
      {...mergeProps(
        themeProps('icon', {size, color}),
        stylex.props(styles.span, colorStyles[color], spanSizeStyles[size]),
      )}>
      {resolvedIcon}
    </span>
  );
}

/**
 * Renders an icon slot value. Handles semantic names, ReactNode values, and
 * component types:
 * - If the value is a semantic icon name string, wraps it in Icon.
 * - If the value is a component (function or forwardRef object), wraps it in Icon.
 * - Otherwise, renders the ReactNode directly.
 */
export function renderIconSlot(
  icon: React.ReactNode | IconType,
  props?: {size?: IconSize; color?: IconColor},
): React.ReactNode {
  if (typeof icon === 'string') {
    return <Icon icon={icon as IconName} {...props} />;
  }

  if (
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && 'render' in icon)
  ) {
    return <Icon icon={icon as unknown as IconType} {...props} />;
  }
  return icon;
}
