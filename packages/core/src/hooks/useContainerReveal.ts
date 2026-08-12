// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useContainerReveal.ts
 * @input Uses the containerReveal styles
 * @output Exports useContainerReveal — a headless hover/focus reveal primitive
 * @position Core hook. Consumed by any component that reveals (or conceals)
 *   content when its container is hovered or focused — e.g. Thumbnail's remove
 *   button, TreeList row actions.
 *
 * Gives a container a scoped hover/focus-within trigger that reveals or
 * conceals content inside it, entirely in CSS (no hover state in JS, no
 * re-render on hover). The caller authors NO StyleX: the hook hands out the
 * container style and the matching content styles.
 *
 * Scoping is by inheritance: the container publishes its reveal state as
 * custom properties on itself and the content reads them, so a nested
 * container shadows its ancestor's state for its own subtree. See
 * containerReveal.stylex.ts.
 *
 * ACCESSIBILITY (WCAG 2.2 by construction):
 * - Revealed content is visually hidden at rest via position + opacity, so it
 *   stays in the accessibility tree and tab order — never display:none.
 * - Keyboard: revealed on :focus-within, so tabbing in shows it.
 * - Touch: always visible on coarse pointers; never gated behind hover.
 * - Concealed (inverted) content is a mouse-only visual swap: it ignores
 *   :focus-within (a keyboard user must never watch content vanish) and stays
 *   visible on touch and in the a11y tree.
 * - Motion: honors prefers-reduced-motion.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts (export)
 * - containerReveal.stylex.ts (if the style blocks change)
 */

import type {CSSProperties} from 'react';
import * as stylex from '@stylexjs/stylex';
import {styles} from './containerReveal.stylex';

export interface UseContainerRevealOptions {
  /**
   * When false the hook is inert: the container gets no styles and content
   * getters return no styles, so content is always shown. Read on every
   * render, so a component can flip it with its own prop (e.g.
   * `revealOn === 'hover'`).
   * @default true
   */
  isEnabled?: boolean;
}

export interface ContentRevealOptions {
  /**
   * Conceal-on-hover instead of reveal-on-hover: content is visible at rest
   * and fades out while the container is hovered. Mouse-only and visual —
   * stays in the a11y tree, ignores focus-within, stays visible on touch.
   * @default false
   */
  isRevealInverted?: boolean;
  /**
   * Reserve the content's layout box while hidden (opacity-only) instead of
   * collapsing it, to avoid layout shift when it appears.
   * @default false
   */
  isLayoutPreserved?: boolean;
}

export interface UseContainerRevealReturn {
  /** Spread onto the container whose hover/focus-within drives the reveal. */
  getContainerProps: () => {className?: string; style?: CSSProperties};
  /** Spread onto each revealed / concealed child. */
  getContentRevealProps: (options?: ContentRevealOptions) => {
    className?: string;
    style?: CSSProperties;
  };
}

const EMPTY = Object.freeze({});

/**
 * Scoped, CSS-only hover/focus reveal for content inside a container.
 *
 * @example
 * ```
 * const {getContainerProps, getContentRevealProps} = useContainerReveal({
 *   isEnabled: revealOn === 'hover',
 * });
 *
 * <div {...mergeProps(getContainerProps(), stylex.props(styles.row))}>
 *   {label}
 *   <span {...mergeProps(getContentRevealProps(), stylex.props(styles.actions))}>
 *     {actions}
 *   </span>
 * </div>
 * ```
 */
export function useContainerReveal(
  options: UseContainerRevealOptions = {},
): UseContainerRevealReturn {
  const {isEnabled = true} = options;

  if (!isEnabled) {
    return {
      getContainerProps: () => EMPTY,
      getContentRevealProps: () => EMPTY,
    };
  }

  return {
    getContainerProps: () => stylex.props(styles.container),
    getContentRevealProps: (contentOptions: ContentRevealOptions = {}) => {
      const {isRevealInverted = false, isLayoutPreserved = false} =
        contentOptions;
      const style = isRevealInverted
        ? isLayoutPreserved
          ? styles.concealLayoutPreserved
          : styles.conceal
        : isLayoutPreserved
          ? styles.revealLayoutPreserved
          : styles.reveal;
      return stylex.props(style);
    },
  };
}
