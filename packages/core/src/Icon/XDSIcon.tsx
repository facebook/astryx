/**
 * @file XDSIcon.tsx
 * @input Uses React forwardRef/SVGProps, icon components or semantic icon names
 * @output Exports XDSIcon component, XDSIconProps, XDSIconColor, XDSIconSize, XDSIconType types
 * @position Core implementation; consumed by index.ts, tested by XDSIcon.test.tsx
 *
 * Supports two modes:
 * - Component mode: Pass an SVG icon component (e.g. from @heroicons/react) — rendered
 *   directly with forwardRef and spread SVG props.
 * - String mode: Pass a semantic name (e.g. 'close', 'chevronDown') — resolved from the
 *   theme's icon registry (or built-in fallback SVGs) and wrapped in a styled span.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Icon/Icon.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Icon/XDSIcon.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Icon/index.ts (exports if types change)
 * - /apps/storybook/stories/Icon.stories.tsx (storybook stories)
 */

'use client';

import {forwardRef, type ComponentType, type SVGProps} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {useXDSIcon, type XDSIconName} from './IconRegistry';
import {xdsClassName, mergeProps} from '../utils';

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
    color: colorVars['--color-icon-tertiary'],
  },
  disabled: {
    color: colorVars['--color-icon-disabled'],
  },
  accent: {
    color: colorVars['--color-accent'],
  },
  positive: {
    color: colorVars['--color-positive'],
  },
  negative: {
    color: colorVars['--color-negative'],
  },
  warning: {
    color: colorVars['--color-warning'],
  },
  inherit: {
    color: 'inherit',
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

export type XDSIconColor = keyof typeof colorStyles;
export type XDSIconSize = keyof typeof sizeStyles;

/**
 * Type for icon components that can be passed to XDSIcon.
 * Use this type when accepting an icon prop in other components.
 */
export type XDSIconType = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Props for XDSIcon component.
 * Extends SVGProps to allow passing additional SVG attributes (used when icon is a component).
 */
export interface XDSIconProps extends Omit<
  SVGProps<SVGSVGElement>,
  'ref' | 'color'
> {
  /**
   * Icon to render. Can be:
   * - A semantic name string (e.g. 'close', 'chevronDown') — resolved from theme or built-in fallback
   * - An SVG icon component (e.g. from @heroicons/react) — rendered directly
   */
  icon: XDSIconType | XDSIconName;
  /**
   * The color variant of the icon.
   * @default 'primary'
   */
  color?: XDSIconColor;
  /**
   * The size of the icon.
   * - 'xsm': 12px
   * - 'sm': 16px
   * - 'md': 20px
   * - 'lg': 24px
   * @default 'md'
   */
  size?: XDSIconSize;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Renders an icon from the icon registry or a custom SVG component.
 *
 * @example
 * ```
 * <XDSIcon icon="close" size="md" color="primary" />
 * ```
 */
export const XDSIcon = forwardRef<SVGSVGElement, XDSIconProps>(
  ({icon, color = 'primary', size = 'md', ...props}, ref) => {
    // String mode: resolve from icon registry, wrap in styled span
    if (typeof icon === 'string') {
      return <IconFromRegistry name={icon} color={color} size={size} />;
    }

    // Component mode: render SVG component directly with ref forwarding
    const IconComponent = icon;
    return (
      <IconComponent
        ref={ref}
        aria-hidden="true"
        {...mergeProps(
          xdsClassName('icon', {size, color}),
          stylex.props(styles.root, colorStyles[color], sizeStyles[size]),
        )}
        {...props}
      />
    );
  },
);

XDSIcon.displayName = 'XDSIcon';

// =============================================================================
// Internal: Registry Icon Renderer
// =============================================================================

/**
 * Internal component that resolves a semantic icon name from the registry
 * and renders it in a styled span with proper sizing.
 *
 * Extracted as a separate component so the useXDSIcon hook is only called
 * when the icon prop is a string.
 */
function IconFromRegistry({
  name,
  color,
  size,
}: {
  name: XDSIconName;
  color: XDSIconColor;
  size: XDSIconSize;
}) {
  const resolvedIcon = useXDSIcon(name);

  if (resolvedIcon == null) {
    return null;
  }

  return (
    <span
      {...mergeProps(
        xdsClassName('icon', {size, color}),
        stylex.props(styles.span, colorStyles[color], spanSizeStyles[size]),
      )}
      aria-hidden="true">
      {resolvedIcon}
    </span>
  );
}
