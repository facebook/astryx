// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Divider.tsx
 * @input Uses React, stylex, spacing and color tokens
 * @output Exports Divider component and DividerProps
 * @position Divider component; provides visual separation with optional label
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Divider/Divider.doc.mjs
 * - /packages/core/src/Divider/Divider.test.tsx
 * - /apps/storybook/stories/Divider.stories.tsx
 * - /packages/cli/templates/blocks/components/Divider/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

/**
 * Extensible variant map for Divider.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/Divider' {
 *   interface DividerVariantMap {
 *     'accent': true;
 *   }
 * }
 * ```
 */
export interface DividerVariantMap {
  subtle: true;
  strong: true;
}

/**
 * Divider variant type. Extensible via module augmentation of DividerVariantMap.
 */
export type DividerVariant = keyof DividerVariantMap;

export interface DividerProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
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
  variant?: DividerVariant;

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
    height: borderVars['--border-width'],
    flexGrow: 1,
    flexShrink: 1,
  },
  verticalLine: {
    width: borderVars['--border-width'],
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
    // Small secondary text styling
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
  },
  verticalLabel: {
    paddingInline: 0,
    paddingBlock: spacingVars['--spacing-3'],
  },
});

const fullBleedStyles = stylex.create({
  horizontal: {
    marginInlineStart: 'calc(-1 * var(--container-padding-inline-start, 0px))',
    marginInlineEnd: 'calc(-1 * var(--container-padding-inline-end, 0px))',
    width:
      'calc(100% + var(--container-padding-inline-start, 0px) + var(--container-padding-inline-end, 0px))',
  },
  vertical: {
    marginBlockStart: 'calc(-1 * var(--container-padding-block-start, 0px))',
    marginBlockEnd: 'calc(-1 * var(--container-padding-block-end, 0px))',
    height:
      'calc(100% + var(--container-padding-block-start, 0px) + var(--container-padding-block-end, 0px))',
  },
});

/**
 * Divider component for visual separation of content.
 *
 * Provides horizontal and vertical dividers with optional labels.
 * Uses Astryx design tokens for colors and spacing.
 *
 * @example
 * ```
 * <Divider label="or" />
 * ```
 */
export function Divider({
  orientation = 'horizontal',
  label,
  variant = 'subtle',
  isFullBleed = false,
  xstyle,
  className,
  style,
  ref,
  ...props
}: DividerProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      {...mergeProps(
        themeProps('divider', {variant, orientation}),
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

Divider.displayName = 'Divider';
