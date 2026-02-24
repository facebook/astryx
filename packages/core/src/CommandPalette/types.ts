/**
 * @file types.ts
 * @input None
 * @output Exports shared types for the CommandPalette component
 * @position Type definitions; consumed by all CommandPalette files
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CommandPalette/README.md (types section)
 * - /packages/core/src/CommandPalette/index.ts (exports if types change)
 */

import type {XDSIconType, XDSIconName} from '../Icon';

/**
 * A character range within a label where the search query matched.
 */
export interface MatchRange {
  start: number;
  end: number;
}

/**
 * A command paired with its fuzzy search score and match ranges.
 */
export interface ScoredCommand {
  command: XDSCommand;
  score: number;
  matchRanges: MatchRange[];
}

/**
 * A command that can be registered with the command palette.
 */
export interface XDSCommand {
  /**
   * Unique identifier for the command.
   */
  id: string;

  /**
   * Display label shown in the palette.
   */
  label: string;

  /**
   * Alternative names for the command.
   * Aliases are matched with the same scoring tiers as the label
   * (exact, starts-with, contains, subsequence) but don't produce
   * label highlighting since the alias text isn't displayed.
   */
  aliases?: string[];

  /**
   * Additional search keywords for matching.
   */
  keywords?: string[];

  /**
   * Group name for visual grouping in the palette.
   */
  group?: string;

  /**
   * Icon displayed before the label.
   * Can be a semantic name string (e.g. 'close', 'chevronDown') or an SVG component.
   */
  icon?: XDSIconType | XDSIconName;

  /**
   * Keyboard shortcut display hint (e.g. "mod+shift+c").
   * This is display-only and does not register a global listener.
   */
  shortcut?: string;

  /**
   * Callback executed when the command is selected.
   */
  onSelect: () => void;

  /**
   * Opens a sub-page in the palette instead of executing onSelect.
   */
  page?: string;

  /**
   * Higher values are ranked higher in results.
   * @default 0
   */
  priority?: number;

  /**
   * Whether the command is available.
   * @default true
   */
  isEnabled?: boolean;
}

/**
 * Context value provided by XDSCommandPaletteProvider.
 */
export interface XDSCommandPaletteContextValue {
  /**
   * Register commands with the palette. Returns an unregister function.
   */
  register: (commands: XDSCommand[]) => () => void;

  /**
   * Open the command palette, optionally to a specific page.
   */
  open: (page?: string) => void;

  /**
   * Close the command palette.
   */
  close: () => void;

  /**
   * Whether the palette is currently open.
   */
  isOpen: boolean;

  /**
   * Record a command selection to history.
   */
  recordHistory: (commandId: string) => void;

  /**
   * Remove a single command from history.
   */
  clearHistoryEntry: (commandId: string) => void;

  /**
   * Get all registered commands.
   */
  getCommands: () => XDSCommand[];

  /**
   * Get history entries ordered by most recent.
   */
  getHistory: () => HistoryEntry[];
}

/**
 * A recorded history entry for recently used commands.
 */
export interface HistoryEntry {
  /**
   * The command ID that was selected.
   */
  id: string;

  /**
   * When the command was last selected.
   */
  timestamp: number;

  /**
   * How many times this command has been invoked.
   */
  count: number;
}
