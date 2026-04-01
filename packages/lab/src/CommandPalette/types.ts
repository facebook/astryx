/**
 * @file types.ts
 * @input None
 * @output Exports shared types for CommandPalette components
 * @position Type definitions; consumed by CommandPalette components
 */

/**
 * Custom filter function. Return a score between 0 and 1.
 * 0 means no match (hidden), 1 means perfect match.
 */
export type CommandPaletteFilterFn = (
  value: string,
  search: string,
  keywords?: string[],
) => number;
