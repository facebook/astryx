// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useContainerReveal.ts
 * @input Uses React, the generated marker pool, useDevWarning
 * @output Exports useContainerReveal — a headless hover/focus reveal primitive
 * @position Core hook. Consumed by any component that reveals (or conceals)
 *   content when its container is hovered or focused — e.g. Thumbnail's remove
 *   button, TreeList row actions.
 *
 * Gives a container a scoped hover/focus-within trigger that reveals or
 * conceals content inside it, entirely in CSS (no hover state in JS, no
 * re-render on hover). The caller authors NO StyleX: the hook hands out a
 * marker + matching reveal styles from a pre-compiled pool.
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
 * - containerReveal.pool.stylex.ts (if the slot shape changes)
 */

import {useState, useEffect, type CSSProperties} from 'react';
import * as stylex from '@stylexjs/stylex';
import {POOL, POOL_SIZE, type RevealSlot} from './containerReveal.pool.stylex';
import {useDevWarning} from './useDevWarning';

// Module-level free-list. Each mounted, enabled useContainerReveal claims a
// distinct pool slot so that any two CONCURRENTLY mounted containers — in
// particular a nested container inside another's revealed content — get
// different markers and cannot leak hover/focus into one another. Slots are
// returned on unmount. Sibling containers that would only ever collide when
// the pool is exhausted are harmless (a sibling is never an ancestor), so the
// pool only needs to cover the number of concurrently mounted containers, not
// instances over time.
const claimed: boolean[] = new Array(POOL_SIZE).fill(false);

interface Claim {
  /** Pool index to use. */
  index: number;
  /** True when the pool was full and this claim fell back to a shared slot. */
  isExhausted: boolean;
}

function claimSlot(): Claim {
  for (let i = 0; i < POOL_SIZE; i++) {
    if (!claimed[i]) {
      claimed[i] = true;
      return {index: i, isExhausted: false};
    }
  }
  // Exhausted: fall back to slot 0. Safe for siblings (a sibling is never an
  // ancestor); only nesting deeper than POOL_SIZE could reintroduce a leak.
  // Surfaced via useDevWarning so the pool can be grown.
  return {index: 0, isExhausted: true};
}

function releaseSlot(index: number, isExhausted: boolean): void {
  // A fallback claim never owned the slot exclusively; leave it as-is.
  if (!isExhausted) {
    claimed[index] = false;
  }
}

export interface UseContainerRevealOptions {
  /**
   * When false the hook is inert: no marker is applied and content getters
   * return no styles, so content is always shown. Lets a component gate on its
   * own prop (e.g. `revealOn === 'hover'`).
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
 * ```tsx
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

  // Claim a slot for this container's lifetime. Assigned in the initializer
  // (not the render body) and released on unmount so the free-list stays
  // effect-scoped and StrictMode-safe.
  const [claim] = useState<Claim | null>(() =>
    isEnabled ? claimSlot() : null,
  );

  useEffect(() => {
    if (claim == null) {
      return;
    }
    return () => releaseSlot(claim.index, claim.isExhausted);
  }, [claim]);

  useDevWarning(
    'useContainerReveal',
    `More than ${POOL_SIZE} reveal containers are mounted at once; nested ` +
      `containers beyond the pool may share a marker. Add markers to ` +
      `containerReveal.pool.stylex.ts and raise POOL_SIZE.`,
    claim?.isExhausted ?? false,
  );

  if (claim == null) {
    return {
      getContainerProps: () => EMPTY,
      getContentRevealProps: () => EMPTY,
    };
  }

  const slot: RevealSlot = POOL[claim.index];

  return {
    getContainerProps: () => stylex.props(slot.marker),
    getContentRevealProps: (contentOptions: ContentRevealOptions = {}) => {
      const {isRevealInverted = false, isLayoutPreserved = false} =
        contentOptions;
      const style = isRevealInverted
        ? isLayoutPreserved
          ? slot.concealLayoutPreserved
          : slot.conceal
        : isLayoutPreserved
          ? slot.revealLayoutPreserved
          : slot.reveal;
      return stylex.props(style);
    },
  };
}
