// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file busyIndicatorLane.tsx
 * @input A wrapper's loading setter, provided around BaseTypeahead
 * @output Context the base uses to hand its busy state to that wrapper
 * @position Package-internal; not exported from the package entry point
 */

import {createContext, use} from 'react';

/**
 * How the base hands its busy state to a wrapper that owns the inline-end lane.
 *
 * Typeahead and Tokenizer both render a clear button and end content in one
 * corner, and both want the busy indicator in that same lane rather than a
 * second one competing for the corner. The base is the only thing that knows
 * when a search starts or settles, so that state has to travel from the base
 * out to its wrapper.
 *
 * A CONTEXT rather than a prop, because a prop cannot be package-internal here:
 * `BaseTypeaheadProps` is re-exported from the package entry point, so every
 * name on it ships as public API however it is commented — an `@internal` tag
 * is a note to a reader, not a boundary. A builder reading the exported
 * declaration would find `__onLoadingChange` and could reasonably wire it,
 * pinning a handoff between two wrappers and their base as permanent API.
 *
 * This module is not exported from `index.ts`, so the seam is closed by module
 * boundary instead of by naming convention.
 */
export interface BusyIndicatorLane {
  /** Called when a search starts or settles. */
  onBusyChange: (isBusy: boolean) => void;
}

const BusyIndicatorLaneContext = createContext<BusyIndicatorLane | null>(null);
BusyIndicatorLaneContext.displayName = 'BusyIndicatorLaneContext';

export const BusyIndicatorLaneProvider = BusyIndicatorLaneContext.Provider;

/**
 * The wrapper's lane, or null when the base is used directly.
 *
 * Null is the released behaviour: the base renders its own visible, named
 * status. Non-null means a wrapper paints it instead, so the base renders
 * nothing and the two cannot both appear.
 */
export function useBusyIndicatorLane(): BusyIndicatorLane | null {
  return use(BusyIndicatorLaneContext);
}
