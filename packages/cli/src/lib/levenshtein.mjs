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

export function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
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
