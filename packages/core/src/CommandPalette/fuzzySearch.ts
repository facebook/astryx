/**
 * @file fuzzySearch.ts
 * @input Uses XDSCommand, HistoryEntry, MatchRange, ScoredCommand types
 * @output Exports fuzzySearch scoring utility with match ranges
 * @position Utility; consumed by XDSCommandPaletteProvider.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CommandPalette/README.md
 */

import type {
  XDSCommand,
  HistoryEntry,
  MatchRange,
  ScoredCommand,
} from './types';

/**
 * Score a single text against a query, returning a score and match ranges.
 * Only contiguous matches are supported: exact, starts-with, and contains.
 */
function scoreText(
  query: string,
  text: string,
): {score: number; matchRanges: MatchRange[]} {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();

  if (lowerText === lowerQuery) {
    return {score: 100, matchRanges: [{start: 0, end: text.length}]};
  }

  if (lowerText.startsWith(lowerQuery)) {
    return {score: 80, matchRanges: [{start: 0, end: query.length}]};
  }

  const containsIndex = lowerText.indexOf(lowerQuery);
  if (containsIndex !== -1) {
    return {
      score: 70,
      matchRanges: [{start: containsIndex, end: containsIndex + query.length}],
    };
  }

  return {score: 0, matchRanges: []};
}

/**
 * Score and filter commands against a search query, returning match ranges.
 *
 * Scoring (higher is better):
 * 1. Exact label match: 100
 * 2. Label starts-with: 80
 * 3. Label contains (contiguous substring): 70
 * 4. Alias match (same tiers as label, no highlighting): 100/80/70
 * 5. Keyword match: 40
 * 6. History boost: +10
 * 7. Priority tiebreaker: +priority
 *
 * All matches require contiguous substrings. Scattered subsequence
 * matching is intentionally not supported to avoid false positives.
 */
export function fuzzySearch(
  commands: XDSCommand[],
  query: string,
  history: HistoryEntry[],
): ScoredCommand[] {
  if (query.length === 0) {
    return commands.map(command => ({command, score: 0, matchRanges: []}));
  }

  const lowerQuery = query.toLowerCase();
  const historySet = new Set(history.map(h => h.id));
  const scored: ScoredCommand[] = [];

  for (const command of commands) {
    // Score against label first
    const labelResult = scoreText(query, command.label);
    let score = labelResult.score;
    let matchRanges = labelResult.matchRanges;

    // If no label match, try aliases (same scoring tiers, no highlighting)
    if (score === 0 && command.aliases) {
      for (const alias of command.aliases) {
        const aliasResult = scoreText(query, alias);
        if (aliasResult.score > score) {
          score = aliasResult.score;
          matchRanges = []; // No label highlighting for alias matches
        }
      }
    }

    // If no label or alias match, try keywords
    if (score === 0) {
      if (command.keywords?.some(kw => kw.toLowerCase().includes(lowerQuery))) {
        score = 40;
        matchRanges = [];
      }
    }

    if (score === 0) continue;

    // History boost
    if (historySet.has(command.id)) {
      score += 10;
    }

    // Priority tiebreaker
    score += (command.priority ?? 0) * 0.1;

    scored.push({command, score, matchRanges});
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}
