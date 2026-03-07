/**
 * @file filter.ts
 * @input Search string and item value/keywords
 * @output Score between 0 and 1 indicating match quality
 * @position Utility; used by CommandPaletteContext for default filtering
 */

import type {CommandPaletteFilterFn} from './types';

/**
 * Default filter function for command palette.
 * Uses substring matching with keyword support.
 * Returns a score between 0 (no match) and 1 (exact match).
 */
export const defaultFilter: CommandPaletteFilterFn = (
  value: string,
  search: string,
  keywords?: string[],
): number => {
  if (search.length === 0) return 1;

  const searchLower = search.toLowerCase();
  const valueLower = value.toLowerCase();

  // Exact match
  if (valueLower === searchLower) return 1;

  // Starts with
  if (valueLower.startsWith(searchLower)) return 0.9;

  // Contains
  if (valueLower.includes(searchLower)) return 0.7;

  // Check keywords
  if (keywords) {
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      if (keywordLower.startsWith(searchLower)) return 0.6;
      if (keywordLower.includes(searchLower)) return 0.5;
    }
  }

  // No match
  return 0;
};
