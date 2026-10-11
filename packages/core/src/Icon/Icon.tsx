// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Icon.tsx
 * @input Ordinary SVG components or semantic names with independent explicit size/appearance/weight
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
 * - /packages/cli/assets/templates/blocks/components/Icon/ (showcase blocks)
 */

import React, {type ComponentType, type SVGProps} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {useThemeDefinition} from '../theme/useTheme';
import {resolveIconWithContext} from './iconResolution';
import type {IconName, NamespacedIconName} from './globalIconRegistry';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {useIconContextSize} from './IconDefaultSizeContext';
import {
  iconBoxSizeStyles,
  iconSizeStyles,
  iconDimensionStyles,
  type IconSize as BuiltInIconSize,
} from './IconSize.stylex';
import type {IconSize, IconAppearance, IconWeight} from './iconCapabilities';

export type {IconSize} from './iconCapabilities';

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

// =============================================================================
// Types
// =============================================================================

export type IconColor = keyof typeof colorStyles;

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
   * - A namespaced extension key (e.g. 'richtext:bold') for a glyph owned by
   *   one component or library — resolved the same way, themeable by key
   * - An SVG icon component (e.g. from @heroicons/react) — rendered directly
   */
  icon: IconType | IconName | NamespacedIconName;
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
   *
   * An explicit value wins. When omitted, Icon uses the nearest default supplied
   * by an owning Astryx component for its icon slot, then falls back to 'md'.
   */
  size?: IconSize;
  /** Explicit supplied-artwork appearance; independent from size and numeric weight. */
  appearance?: IconAppearance;
  /** Exact supplied weight or an unchanged finite number inside a declared range. */
  weight?: IconWeight;
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
   * Meaningful, standalone icon: give it a label.
   *
   * @example
   * ```
   * <Icon icon="success" label="Completed" />
   * ```
   *
   * Decorative icon (the default): omit label.
   *
   * @example
   * ```
   * <Icon icon="search" />
   * ```
   */
  label?: string;
  /**
   * StyleX styles created via `stylex.create()`. Folded into the icon's own
   * `stylex.props()` call (as the last argument) so it merges with the base
   * color/size styles for optimal deduplication, matching how other Astryx
   * components accept `xstyle`.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { opacity: 0.5 } });
   * <Icon icon="search" xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
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
  size: sizeProp,
  appearance,
  weight,
  label,
  ref,
  className,
  style,
  xstyle,
  ...props
}: IconProps) {
  const legacyContextSize = useIconContextSize();
  const theme = useThemeDefinition();
  const resolution = resolveIconWithContext(
    icon,
    {size: sizeProp, appearance, weight},
    theme,
    {legacyContextSize, renderNode: typeof icon === 'string'},
  );
  const size = resolution.inspection.size.selected as IconSize;
  const {dimension, customDimension} = resolution.inspection;
  const a11yProps = getIconA11yProps(label);

  if (typeof icon === 'string') {
    return (
      <IconFromRegistry
        resolvedIcon={resolution.node}
        color={color}
        size={size}
        dimension={dimension}
        customDimension={customDimension}
        a11yProps={a11yProps}
        className={className}
        style={style}
        xstyle={xstyle}
        spanProps={props}
      />
    );
  }

  // Ordinary SVG components keep their exact SVGProps contract. Presentation
  // requests are resolved/diagnosed but never forwarded as arbitrary SVG props.
  const IconComponent = icon;
  return (
    <IconComponent
      ref={ref}
      {...a11yProps}
      {...mergeProps(
        themeProps('icon', {size, color}),
        stylex.props(
          styles.root,
          colorStyles[color],
          customDimension
            ? iconDimensionStyles.svg(dimension)
            : iconSizeStyles[size as BuiltInIconSize],
          xstyle,
        ),
        className ?? undefined,
        style,
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
 * The public wrapper resolves caller intent once. This private renderer keeps
 * the released registry span, accessibility and style/ref ownership unchanged.
 */
function IconFromRegistry({
  resolvedIcon,
  color,
  size,
  dimension,
  customDimension,
  a11yProps,
  className,
  style,
  xstyle,
  spanProps,
}: {
  resolvedIcon: React.ReactNode;
  color: IconColor;
  size: IconSize;
  dimension: string;
  customDimension: boolean;
  a11yProps: {role: 'img'; 'aria-label': string} | {'aria-hidden': 'true'};
  className?: string;
  style?: React.CSSProperties;
  xstyle?: StyleXStyles;
  spanProps?: Omit<SVGProps<SVGSVGElement>, 'ref' | 'color'>;
}) {
  if (resolvedIcon == null) {
    return null;
  }

  // The styling props (className, style, xstyle) are handled here so they
  // COMPOSE with the internal astryx-icon + StyleX classes/styles instead of
  // being shadowed by the later spread: xstyle folds into stylex.props, and
  // className/style merge via mergeProps. Other span props keep their prior
  // precedence (spread before the internal merge).
  const restSpanProps =
    (spanProps as React.HTMLAttributes<HTMLSpanElement>) ?? {};

  return (
    <span
      // Derived a11y — decorative (aria-hidden) by default, or a meaningful
      // image (role="img" + aria-label) when `label` is set. Placed BEFORE the
      // prop spread so consumers can still override it with explicit
      // aria-hidden/role/aria-label. This mirrors component-mode Icon.
      {...a11yProps}
      {...restSpanProps}
      {...mergeProps(
        themeProps('icon', {size, color}),
        stylex.props(
          styles.span,
          colorStyles[color],
          customDimension
            ? iconDimensionStyles.box(dimension)
            : iconBoxSizeStyles[size as BuiltInIconSize],
          xstyle,
        ),
        className ?? undefined,
        style,
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
