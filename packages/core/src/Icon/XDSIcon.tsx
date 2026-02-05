/**
 * @file XDSIcon.tsx
 * @input Uses React forwardRef, SVGProps, and @heroicons/react icon components
 * @output Exports XDSIcon component, XDSIconProps, XDSIconColor, XDSIconSize, XDSIconType types
 * @position Core implementation; consumed by index.ts, tested by XDSIcon.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Icon/README.md (props table, features, implementation notes)
 * - /packages/core/src/Icon/XDSIcon.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Icon/index.ts (exports if types change)
 * - /apps/storybook/stories/Icon.stories.tsx (storybook stories)
 */

import {forwardRef, type ComponentType, type SVGProps} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
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
 * Extends SVGProps to allow passing additional SVG attributes.
 */
export interface XDSIconProps extends Omit<
  SVGProps<SVGSVGElement>,
  'ref' | 'color'
> {
  /**
   * The Hero Icon component to render.
   * Import from @heroicons/react/24/outline or @heroicons/react/24/solid.
   */
  icon: XDSIconType;
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

export const XDSIcon = forwardRef<SVGSVGElement, XDSIconProps>(
  ({icon: IconComponent, color = 'primary', size = 'md', ...props}, ref) => {
    return (
      <IconComponent
        ref={ref}
        aria-hidden="true"
        {...stylex.props(styles.root, colorStyles[color], sizeStyles[size])}
        {...props}
      />
    );
  },
);

XDSIcon.displayName = 'XDSIcon';
