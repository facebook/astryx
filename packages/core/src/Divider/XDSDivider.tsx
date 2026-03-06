/**
 * @file XDSDivider.tsx
 * @input Uses React forwardRef, stylex, spacing and color tokens
 * @output Exports XDSDivider component and XDSDividerProps
 * @position Divider component; provides visual separation with optional label
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Divider/README.md
 * - /packages/core/src/Divider/XDSDivider.test.tsx
 * - /apps/storybook/stories/Divider.stories.tsx
 */

'use client';

import {
  forwardRef,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {ThemeContext} from '../theme/ThemeContext';
import type {StyleXStyles as ThemeStyleXStyles} from '../theme/types';

// =============================================================================
// Module Augmentation - Register Divider's style surfaces with ComponentStyles
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    divider?: {
      root?: ThemeStyleXStyles;
      line?: ThemeStyleXStyles;
      label?: ThemeStyleXStyles;
    };
  }
}

export interface XDSDividerProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'style' | 'className' | 'children'
> {
  /**
   * Orientation of the divider.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Optional label to display centered on the divider.
   * Rendered with small, secondary text styling.
   */
  label?: ReactNode;

  /**
   * Visual weight of the divider line.
   * - 'subtle': Uses --color-divider (default)
   * - 'strong': Uses --color-divider-emphasized
   * @default 'subtle'
   */
  variant?: 'subtle' | 'strong';

  /**
   * Makes the divider escape its parent's container padding.
   * Uses negative margins to extend to the container edges.
   * @default false
   */
  isFullBleed?: boolean;

  /**
   * StyleX styles to apply to the divider container.
   */
  xstyle?: StyleXStyles;
}

const baseStyles = stylex.create({
  horizontal: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  vertical: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },
});

const lineStyles = stylex.create({
  horizontalLine: {
    height: '1px',
    flexGrow: 1,
    flexShrink: 1,
  },
  verticalLine: {
    width: '1px',
    flexGrow: 1,
    flexShrink: 1,
  },
  subtle: {
    backgroundColor: colorVars['--color-divider'],
  },
  strong: {
    backgroundColor: colorVars['--color-divider-emphasized'],
  },
});

const labelStyles = stylex.create({
  label: {
    flexShrink: 0,
    paddingInline: spacingVars['--spacing-3'],
    backgroundColor: colorVars['--color-surface'],
    // Small secondary text styling
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-normal'],
    color: colorVars['--color-text-secondary'],
  },
  verticalLabel: {
    paddingInline: 0,
    paddingBlock: spacingVars['--spacing-3'],
  },
});

const fullBleedStyles = stylex.create({
  horizontal: {
    marginInline: 'calc(-1 * var(--container-padding, 0px))',
  },
  vertical: {
    marginBlock: 'calc(-1 * var(--container-padding, 0px))',
  },
});

/**
 * Divider component for visual separation of content.
 *
 * Provides horizontal and vertical dividers with optional labels.
 * Uses XDS design tokens for colors and spacing.
 *
 * @example
 * ```
 * <XDSDivider label="or" />
 * ```
 */
export const XDSDivider = forwardRef<HTMLElement, XDSDividerProps>(
  function XDSDivider(
    {
      orientation = 'horizontal',
      label,
      variant = 'subtle',
      isFullBleed = false,
      xstyle,
      ...props
    },
    ref,
  ) {
    const isHorizontal = orientation === 'horizontal';

    // Get theme context for component-level overrides (optional)
    const themeContext = useContext(ThemeContext);
    const rootOverride = themeContext?.theme.components?.divider?.root;
    const lineOverride = themeContext?.theme.components?.divider?.line;
    const labelOverride = themeContext?.theme.components?.divider?.label;

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role="separator"
        aria-orientation={orientation}
        {...stylex.props(
          isHorizontal ? baseStyles.horizontal : baseStyles.vertical,
          isFullBleed &&
            (isHorizontal
              ? fullBleedStyles.horizontal
              : fullBleedStyles.vertical),
          rootOverride,
          xstyle,
        )}
        {...props}>
        <div
          {...stylex.props(
            isHorizontal ? lineStyles.horizontalLine : lineStyles.verticalLine,
            lineStyles[variant],
            lineOverride,
          )}
        />
        {label && (
          <div
            {...stylex.props(
              labelStyles.label,
              !isHorizontal && labelStyles.verticalLabel,
              labelOverride,
            )}>
            {label}
          </div>
        )}
        {label && (
          <div
            {...stylex.props(
              isHorizontal
                ? lineStyles.horizontalLine
                : lineStyles.verticalLine,
              lineStyles[variant],
              lineOverride,
            )}
          />
        )}
      </div>
    );
  },
);

XDSDivider.displayName = 'XDSDivider';
