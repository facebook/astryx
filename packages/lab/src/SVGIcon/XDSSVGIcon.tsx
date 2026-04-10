'use client';

/**
 * @file XDSSVGIcon.tsx
 * @input SVG path data, variation preset, size, color
 * @output CSS-variable-driven SVG icon component
 * @position Core implementation for the lab SVG icon system
 *
 * Renders SVG icons using a two-layer system (primary + secondary) where
 * all visual properties (fill, stroke, opacity, stroke-width) are controlled
 * via CSS custom properties. A single set of SVG paths renders as outline,
 * bold, two-tone, bulk, or broken — entirely through CSS.
 */

import {type CSSProperties, type SVGProps} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '@xds/core/theme/tokens.stylex';
import {xdsClassName, mergeProps} from '@xds/core/utils';
import {iconVars} from './tokens.stylex';
import {variations, opticalSize} from './variations.stylex';

// =============================================================================
// Types
// =============================================================================

export type SVGIconVariation =
  | 'linear'
  | 'bold'
  | 'twotone'
  | 'bulk'
  | 'broken';
export type SVGIconSize = 'xsm' | 'sm' | 'md' | 'lg';
export type SVGIconColor =
  | 'primary'
  | 'secondary'
  | 'disabled'
  | 'accent'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'inherit';

/** Shape element within an icon layer */
export interface IconShape {
  /** SVG element type */
  type: 'path' | 'circle' | 'rect' | 'line' | 'polyline' | 'polygon';
  /** SVG attributes for this shape (d, cx, cy, r, points, x1, y1, etc.) */
  attrs: Record<string, string>;
}

/** Definition of an SVG icon's geometry */
export interface SVGIconDef {
  /** Display name */
  name: string;
  /** ViewBox dimensions (default: "0 0 24 24") */
  viewBox?: string;
  /** Primary layer shapes (main outlines) */
  primary: IconShape[];
  /** Secondary layer shapes (detail elements) */
  secondary?: IconShape[];
}

export interface XDSSVGIconProps extends Omit<
  SVGProps<SVGSVGElement>,
  'color'
> {
  /** The icon definition containing path data */
  icon: SVGIconDef;
  /**
   * Visual variation preset.
   * @default 'linear'
   */
  variation?: SVGIconVariation;
  /**
   * Icon size with optical stroke compensation.
   * @default 'md'
   */
  size?: SVGIconSize;
  /**
   * Semantic color.
   * @default 'primary'
   */
  color?: SVGIconColor;
  /**
   * Override stroke width (bypasses optical compensation).
   */
  strokeWidth?: number;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'inline-flex',
    flexShrink: 0,
    width: iconVars['--icon-size'],
    height: iconVars['--icon-size'],
    paddingInlineStart: iconVars['--icon-inline-offset'],
    paddingBlockStart: iconVars['--icon-block-offset'],
  },
});

const colorStyles = stylex.create({
  primary: {color: colorVars['--color-icon-primary']},
  secondary: {color: colorVars['--color-icon-secondary']},
  disabled: {color: colorVars['--color-icon-disabled']},
  accent: {color: colorVars['--color-accent']},
  positive: {color: colorVars['--color-success']},
  negative: {color: colorVars['--color-error']},
  warning: {color: colorVars['--color-warning']},
  inherit: {color: 'inherit'},
});

// =============================================================================
// Shape Renderer
// =============================================================================

function renderShape(shape: IconShape, index: number) {
  const {type, attrs} = shape;
  const props = {...attrs, key: index};

  switch (type) {
    case 'path':
      return <path {...props} />;
    case 'circle':
      return <circle {...props} />;
    case 'rect':
      return <rect {...props} />;
    case 'line':
      return <line {...props} />;
    case 'polyline':
      return <polyline {...props} />;
    case 'polygon':
      return <polygon {...props} />;
    default:
      return null;
  }
}

// =============================================================================
// Component
// =============================================================================

/**
 * CSS-variable-driven SVG icon. A single set of paths renders as multiple
 * visual variations (linear, bold, twotone, bulk, broken) entirely through CSS.
 *
 * @example
 * ```
 * <XDSSVGIcon icon={bellIcon} variation="twotone" size="md" color="accent" />
 * ```
 */
export function XDSSVGIcon({
  icon,
  variation = 'linear',
  size = 'md',
  color = 'primary',
  strokeWidth,
  style,
  ...props
}: XDSSVGIconProps) {
  const viewBox = icon.viewBox ?? '0 0 24 24';
  const hasSecondary = icon.secondary && icon.secondary.length > 0;

  const overrideStyle: CSSProperties = {
    ...(style as CSSProperties),
    ...(strokeWidth != null
      ? ({
          [iconVars['--icon-stroke-width'] as string]: String(strokeWidth),
        } as Record<string, string>)
      : undefined),
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      aria-hidden="true"
      {...mergeProps(
        xdsClassName('svg-icon', {variation, size, color}),
        stylex.props(
          styles.root,
          colorStyles[color],
          variations[variation],
          opticalSize[size],
        ),
      )}
      style={overrideStyle}
      {...props}>
      {/* Primary layer — defineVars values are already var(--xhash) */}
      <g
        style={{
          fill: iconVars['--icon-layer-primary-fill'] as string,
          stroke: iconVars['--icon-layer-primary-stroke'] as string,
          opacity: iconVars['--icon-layer-primary-opacity'] as string,
          strokeWidth: iconVars['--icon-stroke-width'] as string,
          strokeLinecap: iconVars[
            '--icon-stroke-linecap'
          ] as unknown as 'round',
          strokeLinejoin: iconVars[
            '--icon-stroke-linejoin'
          ] as unknown as 'round',
        }}>
        {icon.primary.map(renderShape)}
      </g>

      {/* Secondary layer */}
      {hasSecondary && (
        <g
          style={{
            fill: iconVars['--icon-layer-secondary-fill'] as string,
            stroke: iconVars['--icon-layer-secondary-stroke'] as string,
            opacity: iconVars['--icon-layer-secondary-opacity'] as string,
            strokeWidth: iconVars['--icon-stroke-width'] as string,
            strokeLinecap: iconVars[
              '--icon-stroke-linecap'
            ] as unknown as 'round',
            strokeLinejoin: iconVars[
              '--icon-stroke-linejoin'
            ] as unknown as 'round',
          }}>
          {icon.secondary!.map(renderShape)}
        </g>
      )}
    </svg>
  );
}

XDSSVGIcon.displayName = 'XDSSVGIcon';
