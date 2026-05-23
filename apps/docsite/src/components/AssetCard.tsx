// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * AssetCard — a presentational card component that uses a single generic
 * background image with Material 3 shapes and gradient overlays.
 *
 * Replaces individual per-page asset images with a consistent visual system.
 */

import * as stylex from '@stylexjs/stylex';
import type {ReactNode} from 'react';

// M3 shape definitions
type M3Shape =
  | 'rounded-sm'
  | 'rounded-md'
  | 'rounded-lg'
  | 'rounded-xl'
  | 'pill'
  | 'circle';

const shapeRadius: Record<M3Shape, string> = {
  'rounded-sm': '8px',
  'rounded-md': '12px',
  'rounded-lg': '16px',
  'rounded-xl': '28px',
  pill: '9999px',
  circle: '50%',
};

// Gradient presets
type GradientPreset =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'warm'
  | 'cool'
  | 'neutral';

const gradients: Record<GradientPreset, string> = {
  primary:
    'linear-gradient(135deg, var(--color-accent, #6750A4) 0%, var(--color-accent-muted, #9A82DB) 100%)',
  secondary:
    'linear-gradient(135deg, var(--color-secondary, #625B71) 0%, var(--color-secondary-muted, #958DA5) 100%)',
  tertiary:
    'linear-gradient(135deg, var(--color-tertiary, #7D5260) 0%, var(--color-tertiary-muted, #B58392) 100%)',
  warm: 'linear-gradient(135deg, #F4845F 0%, #F7B267 100%)',
  cool: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
  neutral:
    'linear-gradient(135deg, var(--color-background-muted, #E7E0EC) 0%, var(--color-background-card, #F7F2FA) 100%)',
};

const styles = stylex.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'url(/hero-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.15,
  },
  gradientOverlay: {
    position: 'absolute',
    inset: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});

export interface AssetCardProps {
  /** M3 shape for the container border radius */
  shape?: M3Shape;
  /** Gradient overlay preset */
  gradient?: GradientPreset;
  /** Custom aspect ratio (e.g. '2/1', '16/10') */
  aspectRatio?: string;
  /** Whether to show the generic background texture */
  showBackground?: boolean;
  /** Children rendered in the center */
  children?: ReactNode;
  /** Additional StyleX styles */
  xstyle?: stylex.StyleXStyles;
}

export function AssetCard({
  shape = 'rounded-lg',
  gradient = 'neutral',
  aspectRatio = '2/1',
  showBackground = true,
  children,
  xstyle,
}: AssetCardProps) {
  return (
    <div
      {...stylex.props(styles.container, xstyle)}
      style={{
        borderRadius: shapeRadius[shape],
        aspectRatio,
      }}>
      {showBackground && <div {...stylex.props(styles.background)} />}
      <div
        {...stylex.props(styles.gradientOverlay)}
        style={{background: gradients[gradient]}}
      />
      <div {...stylex.props(styles.content)}>{children}</div>
    </div>
  );
}
