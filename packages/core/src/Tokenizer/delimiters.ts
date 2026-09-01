// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file delimiters.ts
 * @input A delimiter set (list of literal strings or a RegExp) and input text
 * @output Exports escapeDelimiter, toDelimiterPattern, splitOnDelimiters —
 *   pure helpers that turn delimited text into raw segments
 * @position Internal Tokenizer helper; no React, no DOM. Trimming, de-duping,
 *   and capacity limits are the caller's job (see Tokenizer.commitDelimitedText).
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Tokenizer/delimiters.test.ts
 * - /packages/core/src/Tokenizer/Tokenizer.tsx (consumer)
 */

/**
 * Escape every regex metacharacter in a literal delimiter string, so a
 * delimiter like `.` or `|` matches itself rather than acting as a pattern.
 */
export function escapeDelimiter(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Compile a delimiter set into a global RegExp suitable for {@link
 * splitOnDelimiters}, or `null` when the set is empty (the off switch).
 *
 * - A list of strings is escaped and joined with `|`, longest-first so a
 *   multi-character delimiter wins over its own prefix (`[', ', ',']` splits
 *   `"a, b"` into `a` and `b`, not `a` and `" b"`). Empty strings are dropped.
 * - A RegExp is rebuilt with the global flag (needed for the exec loop) and
 *   without the sticky flag (which would anchor at `lastIndex` and miss
 *   delimiters mid-string); every other flag is preserved.
 */
export function toDelimiterPattern(
  delimiters: ReadonlyArray<string> | RegExp,
): RegExp | null {
  if (delimiters instanceof RegExp) {
    let flags = delimiters.flags.replace(/y/g, '');
    if (!flags.includes('g')) {
      flags += 'g';
    }
    return new RegExp(delimiters.source, flags);
  }

  const parts = delimiters.filter(d => d.length > 0);
  if (parts.length === 0) {
    return null;
  }
  const sorted = [...parts].sort((a, b) => b.length - a.length);
  return new RegExp(sorted.map(escapeDelimiter).join('|'), 'g');
}

/**
 * Split `text` into the raw segments between delimiter matches, or return
 * `null` when the text contains no delimiter (the identity signal — the caller
 * leaves the text in the input so single values still offer "Create").
 *
 * Segments are returned untrimmed and may be empty; the caller trims, drops
 * blanks and duplicates, and enforces capacity. Matching uses an `exec` loop
 * rather than `String.prototype.split`, so a caller-supplied RegExp with a
 * capturing group never emits the delimiter itself as a segment. A shared
 * RegExp instance is safe to reuse — `lastIndex` is reset on entry — and a
 * zero-width match never counts as a delimiter: an empty match delimits
 * nothing, so a zero-width-capable pattern such as `,*` splits exactly where
 * `,+` would and reports "no delimiter" on text it never consumes.
 */
export function splitOnDelimiters(
  text: string,
  pattern: RegExp | null,
): string[] | null {
  if (!pattern) {
    return null;
  }
  // Ensure a global, non-sticky pattern so the exec loop advances instead of
  // matching the same index forever. A pattern from toDelimiterPattern is
  // already global, so this only rebuilds a stray hand-passed RegExp.
  const re = pattern.global
    ? pattern
    : new RegExp(pattern.source, pattern.flags.replace(/y/g, '') + 'g');
  re.lastIndex = 0;

  const segments: string[] = [];
  let cursor = 0;
  let matched = false;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    // A zero-width match delimits nothing: counting it would make a pattern
    // like /,*/ report "delimiter found" on every string and tokenize each
    // keystroke into single characters. Skip it — advancing a whole code
    // point, because stepping into the middle of a surrogate pair livelocks
    // the exec loop under the u flag.
    if (match[0].length === 0) {
      const cp = text.codePointAt(re.lastIndex);
      re.lastIndex += cp !== undefined && cp > 0xffff ? 2 : 1;
      continue;
    }
    matched = true;
    segments.push(text.slice(cursor, match.index));
    cursor = match.index + match[0].length;
  }
  if (!matched) {
    return null;
  }
  segments.push(text.slice(cursor));
  return segments;
}
