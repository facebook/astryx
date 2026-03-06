/**
 * @file types.ts
 * @input None
 * @output Exports shared types for CommandPalette components
 * @position Type definitions; consumed by all CommandPalette components
 */

import type {ReactNode} from 'react';
import type {XDSIconType} from '../Icon';

// =============================================================================
// Command type (for registry pattern — Layer 2)
// =============================================================================

/**
 * A command registered via the provider pattern.
 */
export interface XDSCommand {
  /** Unique identifier for the command. */
  id: string;
  /** Display label. */
  label: string;
  /** Callback when the command is selected. */
  onSelect: () => void;
  /** Optional description/subtitle. */
  description?: string;
  /** Icon to display. */
  icon?: XDSIconType;
  /** Keyboard shortcut display string (e.g., "mod+k"). */
  shortcut?: string;
  /** Additional search terms for filtering. */
  keywords?: string[];
  /** Visual group heading. */
  group?: string;
  /** Sort priority within group (higher = first). */
  priority?: number;
  /** Whether the command is disabled. */
  isDisabled?: boolean;
  /** Parent command ID for nested navigation. */
  parent?: string;
  /** Custom render function for the item. */
  renderItem?: (props: CommandItemRenderProps) => ReactNode;
}

/**
 * Render props passed to custom item renderers.
 */
export interface CommandItemRenderProps {
  /** The command being rendered. */
  command: XDSCommand;
  /** Whether this item is currently highlighted via keyboard/mouse. */
  isHighlighted: boolean;
}

// =============================================================================
// Filter function type
// =============================================================================

/**
 * Custom filter function. Return a score between 0 and 1.
 * 0 means no match (hidden), 1 means perfect match.
 */
export type CommandPaletteFilterFn = (
  value: string,
  search: string,
  keywords?: string[],
) => number;
