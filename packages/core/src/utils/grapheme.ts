// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file grapheme.ts
 * @input Strings that may contain multi-code-unit graphemes (emoji, flags,
 *        ZWJ sequences, combining marks)
 * @output Exports graphemeLength, firstGrapheme, truncateGraphemes —
 *         grapheme-cluster-safe replacements for .length / .charAt(0) /
 *         .slice(0, n) on user-visible strings
 * @position Shared utility; consumed by Avatar, TextArea, PowerSearch, Table
 *
 * SYNC: When modified, update:
 * - /packages/core/src/utils/grapheme.test.ts
 * - /packages/core/src/utils/index.ts
 */

/**
 * Reuse a single segmenter when the runtime supports Intl.Segmenter.
 */
const graphemeSegmenter =
  typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, {granularity: 'grapheme'})
    : null;

/**
 * Split a string into user-perceived characters (grapheme clusters). The
 * code-point fallback keeps surrogate pairs intact but may split ZWJ
 * sequences and flag pairs on runtimes without Intl.Segmenter.
 */
function splitGraphemes(str: string): string[] {
  if (graphemeSegmenter) {
    return [...graphemeSegmenter.segment(str)].map(s => s.segment);
  }
  return [...str];
}

/**
 * Number of user-perceived characters in a string — the count a person would
 * give, where one emoji, flag, or accented character is one character.
 * Grapheme-safe replacement for `.length` on user-visible strings.
 */
export function graphemeLength(str: string): number {
  if (str === '') {
    return 0;
  }
  return splitGraphemes(str).length;
}

/**
 * The first user-perceived character of a string, or '' when empty.
 * Grapheme-safe replacement for `.charAt(0)`. Reads only the first segment,
 * so cost does not scale with the length of the string.
 */
export function firstGrapheme(str: string): string {
  if (graphemeSegmenter) {
    const first = graphemeSegmenter.segment(str)[Symbol.iterator]().next();
    return first.done ? '' : first.value.segment;
  }
  const codePoint = str.codePointAt(0);
  return codePoint == null ? '' : String.fromCodePoint(codePoint);
}

/**
 * Truncate to at most `max` user-perceived characters, ellipsis included:
 * strings within `max` graphemes pass through unchanged; longer strings are
 * cut so the result — content plus `ellipsis` — is exactly `max` graphemes
 * (or just the ellipsis, when `max` is smaller than the ellipsis itself).
 * Grapheme-safe replacement for `str.slice(0, n) + '…'`.
 *
 * @example
 * ```
 * truncateGraphemes('abcdefghij', 5) // 'abcd…'
 * truncateGraphemes('abcdefghij', 8, '...') // 'abcde...'
 * ```
 */
export function truncateGraphemes(
  str: string,
  max: number,
  ellipsis = '…',
): string {
  const graphemes = splitGraphemes(str);
  if (graphemes.length <= max) {
    return str;
  }
  const keep = Math.max(max - graphemeLength(ellipsis), 0);
  return graphemes.slice(0, keep).join('') + ellipsis;
}
