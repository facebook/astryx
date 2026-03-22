'use client';

/**
 * @file XDSDivider.tsx
 * @input Uses React, stylex, spacing and color tokens
 * @output Exports XDSDivider component and XDSDividerProps
 * @position Divider component; provides visual separation with optional label
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Divider/Divider.doc.mjs
 * - /packages/core/src/Divider/XDSDivider.test.tsx
 * - /apps/storybook/stories/Divider.stories.tsx
 */


import {type HTMLAttributes, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  lineHeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

/**
 * Extensible variant map for XDSDivider.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@xds/core/Divider' {
 *   interface XDSDividerVariantMap {
 *     'accent': true;
 *   }
 * }
 * ```
 */
export interface XDSDividerVariantMap {
  subtle: true;
  strong: true;
}

/**
 * Divider variant type. Extensible via module augmentation of XDSDividerVariantMap.
 */
export type XDSDividerVariant = keyof XDSDividerVariantMap;

export interface XDSDividerProps extends Omit<
  XDSBaseProps<HTMLDivElement>,
  'children'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
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
   * - 'subtle': Uses --color-border (default)
   * - 'strong': Uses --color-border-emphasized
   * @default 'subtle'
   */
  variant?: XDSDividerVariant;

  /**
   * Makes the divider escape its parent's container padding.
   * Uses negative margins to extend to the container edges.
   * @default false
   */
  isFullBleed?: boolean;

  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;
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
    backgroundColor: colorVars['--color-border'],
  },
  strong: {
    backgroundColor: colorVars['--color-border-emphasized'],
  },
});

const labelStyles = stylex.create({
  label: {
    flexShrink: 0,
    paddingInline: spacingVars['--spacing-3'],
    backgroundColor: colorVars['--color-surface'],
    // Small secondary text styling
    fontSize: typeScaleVars['--text-supporting-size'],
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
export function XDSDivider({
  orientation = 'horizontal',
  label,
  variant = 'subtle',
  isFullBleed = false,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSDividerProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      role="separator"
      aria-orientation={orientation}
      {...mergeProps(
        xdsClassName('divider', {variant, orientation}),
        stylex.props(
          isHorizontal ? baseStyles.horizontal : baseStyles.vertical,
          isFullBleed &&
            (isHorizontal
              ? fullBleedStyles.horizontal
              : fullBleedStyles.vertical),
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      <div
        {...stylex.props(
          isHorizontal ? lineStyles.horizontalLine : lineStyles.verticalLine,
          lineStyles[variant],
        )}
      />
      {label && (
        <div
          {...stylex.props(
            labelStyles.label,
            !isHorizontal && labelStyles.verticalLabel,
          )}>
          {label}
        </div>
      )}
      {label && (
        <div
          {...stylex.props(
            isHorizontal ? lineStyles.horizontalLine : lineStyles.verticalLine,
            lineStyles[variant],
          )}
        />
      )}
    </div>
  );
}

XDSDivider.displayName = 'XDSDivider';
