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
 */
const sizeStyles = stylex.create({
  xsm: {
    width: 12,
    height: 12,
  },
  sm: {
    width: 16,
    height: 16,
  },
  md: {
    width: 20,
    height: 20,
  },
  lg: {
    width: 24,
    height: 24,
  },
});

/**
 * Size styles for string-based (registry) icons.
 * Includes fontSize so that 1em-based icons from the registry scale correctly.
 */
const spanSizeStyles = stylex.create({
  xsm: {
    width: 12,
    height: 12,
    fontSize: 12,
  },
  sm: {
    width: 16,
    height: 16,
    fontSize: 16,
  },
  md: {
    width: 20,
    height: 20,
    fontSize: 20,
  },
  lg: {
    width: 24,
    height: 24,
    fontSize: 24,
  },
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
   * - 'xsm': 12px
   * - 'sm': 16px
   * - 'md': 20px
   * - 'lg': 24px
   * @default 'md'
   */
  size?: IconSize;
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
  ref,
  ...props
}: IconProps) {
  // String mode: resolve from icon registry, wrap in styled span
  if (typeof icon === 'string') {
    return (
      <IconFromRegistry
        name={icon}
        color={color}
        size={size}
        spanProps={props}
      />
    );
  }

  // Component mode: render SVG component directly with ref forwarding
  const IconComponent = icon;
  return (
    <IconComponent
      ref={ref}
      aria-hidden="true"
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
  spanProps,
}: {
  name: IconName;
  color: IconColor;
  size: IconSize;
  spanProps?: Omit<SVGProps<SVGSVGElement>, 'ref' | 'color'>;
}) {
  const resolvedIcon = getIcon(name);

  if (resolvedIcon == null) {
    return null;
  }

  return (
    <span
      {...(spanProps as React.HTMLAttributes<HTMLSpanElement>)}
      {...mergeProps(
        themeProps('icon', {size, color}),
        stylex.props(styles.span, colorStyles[color], spanSizeStyles[size]),
      )}
      aria-hidden="true">
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
