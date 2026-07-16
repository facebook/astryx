// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file composeEventHandlers.ts
 * @input Multiple React event handlers (or undefined)
 * @output A single handler that calls each in order, stopping if one prevents default
 * @position Utility; used by components that own an interaction (a click that
 *   selects, a keydown that drives arrow navigation) but also accept a consumer
 *   handler for the same event through {...rest}. Composes them instead of
 *   letting one clobber the other.
 *
 * Order is call order: the first argument runs first. Put the consumer handler
 * first so it can opt out of the component's built-in behavior via
 * `event.preventDefault()`; put the component's handler first when its behavior
 * must always run regardless of the consumer.
 */

import type {SyntheticEvent} from 'react';

/**
 * Compose event handlers into one. Each handler runs in argument order; if any
 * calls `event.preventDefault()`, the remaining handlers are skipped.
 *
 * @example
 * ```tsx
 * // Consumer first: a consumer onClick can preventDefault to block selection.
 * <button onClick={composeEventHandlers(onClickProp, handleSelect)} />
 *
 * // Component first: built-in keyboard nav always runs.
 * <div onKeyDown={composeEventHandlers(handleArrowKeys, onKeyDownProp)} />
 * ```
 */
export function composeEventHandlers<E extends SyntheticEvent>(
  ...handlers: (((event: E) => void) | undefined)[]
): (event: E) => void {
  return (event: E) => {
    for (const handler of handlers) {
      handler?.(event);
      if (event.defaultPrevented) {
        return;
      }
    }
  };
}
