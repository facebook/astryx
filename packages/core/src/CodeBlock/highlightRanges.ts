/**
 * @file highlightRanges.ts
 * @input Line divs, per-line token arrays, CSS Custom Highlight API
 * @output Creates/removes highlight Range objects for syntax coloring
 * @position Shared utility consumed by XDSCodeBlock (ranges mode)
 *
 * Tokens are per-line with line-relative offsets, so we map directly
 * from line div → text node → Range. No global text-node map, no
 * binary search, no TreeWalker.
 */

import type {Token, TokenLine} from './tokenizer';
import {ensureHighlightStyles} from './highlightStyles';

// ---------------------------------------------------------------------------
// Dynamic ::highlight() style injection
// ---------------------------------------------------------------------------

const registeredHighlightTypes = new Set<string>();
let dynamicStyleSheet: CSSStyleSheet | null = null;

/**
 * Ensure a ::highlight(xds-{type}) CSS rule exists for the given token type.
 * Static styles cover the built-in types; only injects for unknown ones.
 */
function ensureHighlightType(tokenType: string): void {
  if (registeredHighlightTypes.has(tokenType)) return;
  registeredHighlightTypes.add(tokenType);

  ensureHighlightStyles();
  if (typeof document === 'undefined') return;

  if (!dynamicStyleSheet) {
    const style = document.createElement('style');
    style.setAttribute('data-xds-highlight-dynamic', '');
    document.head.appendChild(style);
    dynamicStyleSheet = style.sheet!;
  }

  const name = `xds-${tokenType}`;
  const colorVar = `var(--color-syntax-${tokenType}, currentColor)`;
  dynamicStyleSheet.insertRule(
    `.xds-codeblock code::highlight(${name}), .xds-codeeditor code::highlight(${name}) { color: ${colorVar}; }`,
  );
}

// ---------------------------------------------------------------------------
// Per-type Highlight cache
// ---------------------------------------------------------------------------

function getOrCreateHighlight(tokenType: string): Highlight {
  ensureHighlightType(tokenType);
  const name = `xds-${tokenType}`;
  let highlight = CSS.highlights.get(name);
  if (!highlight) {
    highlight = new Highlight();
    CSS.highlights.set(name, highlight);
  }
  return highlight;
}

// ---------------------------------------------------------------------------
// Range application — line-based
// ---------------------------------------------------------------------------

interface RangeEntry {
  range: Range;
  highlight: Highlight;
}

/**
 * Apply highlight ranges for a single line's tokens.
 * The line div is expected to contain a single text node as its
 * first child (or a zero-width space placeholder for empty lines).
 */
function applyLineRanges(
  lineDiv: Element,
  tokens: Token[],
  results: RangeEntry[],
): void {
  if (tokens.length === 0) return;

  // The text node is the first child of the line div.
  // In range mode, lines render plain text so this is always a Text node.
  const textNode = lineDiv.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

  const textLength = (textNode as Text).length;

  for (const token of tokens) {
    if (token.start >= textLength || token.end <= 0) continue;

    const start = Math.min(token.start, textLength);
    const end = Math.min(token.end, textLength);

    const highlight = getOrCreateHighlight(token.type);

    try {
      const range = new Range();
      range.setStart(textNode, start);
      range.setEnd(textNode, end);
      highlight.add(range);
      results.push({range, highlight});
    } catch {
      // Skip invalid ranges
    }
  }
}

function cleanupRanges(ranges: RangeEntry[]): void {
  for (const {range, highlight} of ranges) {
    highlight.delete(range);
  }
}

// ---------------------------------------------------------------------------
// Chunked application
// ---------------------------------------------------------------------------

const LINE_CHUNK_SIZE = 50;

/**
 * Apply CSS Custom Highlight API ranges for all lines. Processes
 * lines in chunks via requestAnimationFrame so colors appear
 * progressively without blocking the main thread.
 *
 * @param codeEl - The <code> element containing line divs
 * @param tokenLines - Per-line token arrays from the tokenizer
 * @returns Cleanup function that cancels pending work and removes ranges
 */
export function applyHighlightRangesChunked(
  codeEl: HTMLElement,
  tokenLines: TokenLine[],
  chunkSize: number = LINE_CHUNK_SIZE,
): () => void {
  ensureHighlightStyles();

  // Collect all line divs with data-line attribute
  const lineDivs = codeEl.querySelectorAll('[data-line]');
  const myRanges: RangeEntry[] = [];
  let cursor = 0;
  let rafId = 0;
  let cancelled = false;

  function processChunk() {
    if (cancelled) return;

    const end = Math.min(cursor + chunkSize, lineDivs.length);
    for (let i = cursor; i < end; i++) {
      const lineDiv = lineDivs[i];
      const tokens = tokenLines[i];
      if (tokens && tokens.length > 0) {
        applyLineRanges(lineDiv, tokens, myRanges);
      }
    }
    cursor = end;

    if (cursor < lineDivs.length) {
      rafId = requestAnimationFrame(processChunk);
    }
  }

  // First chunk synchronously for immediate partial coloring
  processChunk();

  return function cleanup() {
    cancelled = true;
    cancelAnimationFrame(rafId);
    cleanupRanges(myRanges);
  };
}

/**
 * Apply highlight ranges for a batch of lines starting at a given
 * line index. Used by the streaming tokenizer to apply highlights
 * progressively as tokens arrive.
 */
export function applyHighlightRangesBatch(
  codeEl: HTMLElement,
  tokenLines: TokenLine[],
  startLine: number,
): RangeEntry[] {
  ensureHighlightStyles();

  const lineDivs = codeEl.querySelectorAll('[data-line]');
  const results: RangeEntry[] = [];

  for (let i = 0; i < tokenLines.length; i++) {
    const divIndex = startLine + i;
    if (divIndex >= lineDivs.length) break;

    const lineDiv = lineDivs[divIndex];
    const tokens = tokenLines[i];
    if (tokens && tokens.length > 0) {
      applyLineRanges(lineDiv, tokens, results);
    }
  }

  return results;
}

/**
 * Cleanup a batch of ranges (returned from applyHighlightRangesBatch).
 */
export {cleanupRanges};
