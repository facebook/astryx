// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Levenshtein edit distance — pure, dependency-free.
 *
 * Lives apart from string-utils.mjs (which dynamically imports node:fs/path
 * for component search) so browser-bundled code — the XLE/XLO layout
 * language — can use fuzzy matching without dragging node: schemes into the
 * webpack graph.
 *
 * @input  two strings
 * @output edit distance (number)
 * @position lib — shared by string-utils.mjs and lib/xle/validate.mjs
 */

/**
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
  // Early exit: the distance is always ≥ |m − n|, so once the length gap
  // exceeds the loosest fuzzy-match threshold any caller uses (the hook
  // suggester keeps distance ≤ 5) the pair can never match — skip the O(m·n)
  // DP entirely. Closes the DoS surface where a long query (>3k chars) caused
  // multi-second CPU spins (8,860 calls × O(n²) per search).
  if (Math.abs(m - n) > 5) return 999;
  /** @type {number[][]} */
  const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}
