// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Container.tsx
 * @input Uses React, StyleX, spacing tokens
 * @output Exports Container component and ContainerProps
 * @position Core layout primitive; centered max-width column with fluid side gutters
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Container/Container.doc.mjs
 * - /packages/core/src/Container/Container.test.tsx
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {spacingVars} from '../theme/tokens.stylex';
import type {SizeValue, SpacingStep} from '../utils/types';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  base: {
    boxSizing: 'border-box',
    width: '100%',
    marginInlineStart: 'auto',
    marginInlineEnd: 'auto',
  },
  // Fluid gutter: shrinks with the viewport, bounded by spacing tokens so
  // themes control the endpoints rather than apps hard-coding pixel values.
  fluidGutter: {
    paddingInline: `clamp(${spacingVars['--spacing-5']}, 4vw, ${spacingVars['--spacing-10']})`,
  },
});

// Dynamic style for the max-width value
const dynamicStyles = stylex.create({
  maxWidth: (maxWidth: SizeValue) => ({maxWidth}),
});

const gutterStyles = stylex.create({
  0: {paddingInline: spacingVars['--spacing-0']},
  0.5: {paddingInline: spacingVars['--spacing-0-5']},
  1: {paddingInline: spacingVars['--spacing-1']},
  1.5: {paddingInline: spacingVars['--spacing-1-5']},
  2: {paddingInline: spacingVars['--spacing-2']},
  3: {paddingInline: spacingVars['--spacing-3']},
  4: {paddingInline: spacingVars['--spacing-4']},
  5: {paddingInline: spacingVars['--spacing-5']},
  6: {paddingInline: spacingVars['--spacing-6']},
  8: {paddingInline: spacingVars['--spacing-8']},
  10: {paddingInline: spacingVars['--spacing-10']},
});

export interface ContainerProps extends BaseProps<HTMLElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;

  /**
   * Maximum width of the centered column.
   * Numbers are treated as pixels, strings are used as-is (e.g., '80ch').
   * @default 1280
   */
  maxWidth?: SizeValue;

  /**
   * Horizontal gutter (padding-inline) inside the container.
   * - `'fluid'`: viewport-relative gutter — `clamp()` between spacing tokens,
   *   so it tightens on small screens and is theme-controlled.
   * - Spacing step: fixed gutter from the spacing scale
   *   (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10).
   * @default 'fluid'
   */
  gutter?: 'fluid' | SpacingStep;

  /**
   * HTML tag to render.
   * The default is a neutral `<div>`; pass a landmark tag when the container
   * is also the section boundary.
   * @default 'div'
   */
  as?: 'div' | 'section' | 'main' | 'article' | 'header' | 'footer';

  /**
   * Content to render inside the centered column.
   */
  children?: ReactNode;
}

/**
 * A centered, max-width content column with responsive side gutters — the
 * canonical page container.
 *
 * Unlike Section, Container centers itself (margin-inline auto), keeps a
 * fluid gutter that shrinks on small screens, renders a neutral element,
 * and never escapes parent padding.
 *
 * @example
 * ```
 * <Container maxWidth={1280}>
 *   <PageContent />
 * </Container>
 * ```
 */
export function Container({
  maxWidth = 1280,
  gutter = 'fluid',
  as: Tag = 'div',
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: ContainerProps) {
  const stylexProps = mergeProps(
    themeProps('container'),
    stylex.props(
      styles.base,
      gutter === 'fluid' ? styles.fluidGutter : gutterStyles[gutter],
      dynamicStyles.maxWidth(maxWidth),
      xstyle,
    ),
    className,
    style,
  );

  return (
    <Tag ref={ref as React.Ref<never>} {...stylexProps} {...props}>
      {children}
    </Tag>
  );
}

Container.displayName = 'Container';
