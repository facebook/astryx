/**
 * @file XDSLayoutSlotsContext.ts
 * @input Uses React createContext
 * @output Exports XDSLayoutSlotsContext and LayoutSlots type
 * @position Context for layout slot information
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/XDSLayout/README.md
 * - /packages/core/src/Layout/XDSLayout/index.ts
 */

import { createContext } from 'react';

/**
 * Information about which layout slots are filled.
 * Used by content area components to determine their edge positions
 * and apply appropriate outer padding.
 */
export interface LayoutSlots {
  /** Whether a header is rendered */
  hasHeader: boolean;
  /** Whether a footer is rendered */
  hasFooter: boolean;
  /** Whether a start panel is rendered */
  hasStart: boolean;
  /** Whether an end panel is rendered */
  hasEnd: boolean;
  /** Whether outer padding should be removed (full bleed mode) */
  isFullBleed: boolean;
}

/**
 * Default slot state - no slots filled, not full bleed.
 */
const defaultSlots: LayoutSlots = {
  hasHeader: false,
  hasFooter: false,
  hasStart: false,
  hasEnd: false,
  isFullBleed: false,
};

/**
 * Context for layout slot information.
 * Content area components use this to:
 * - Determine if they are at an edge (for outer padding)
 * - Check if full bleed mode is enabled
 */
export const XDSLayoutSlotsContext = createContext<LayoutSlots>(defaultSlots);
