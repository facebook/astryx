/**
 * @file highlightRanges.ts
 * @input Code element, tokens array, CSS Custom Highlight API
 * @output Creates/removes highlight Range objects for syntax coloring
 * @position Shared utility consumed by XDSCodeBlock (ranges mode)
 */

import type {Token} from './tokenizer';
import {ensureHighlightStyles} from './highlightStyles';

// ---------------------------------------------------------------------------
// Text node mapping
// ---------------------------------------------------------------------------

interface TextNodeEntry {
  node: Text;
  start: number;
}

/**
 * Walk a code element's text nodes and build a sorted map of
 * character offsets. Each entry maps a Text node to its starting
 * offset in the original code string.
 *
 * Zero-width spaces (empty-line placeholders) count as 1 character
 * to stay aligned with the tokenizer's newline-separated offsets.
 */
export function buildTextNodeMap(codeEl: HTMLElement): TextNodeEntry[] {
  const walker = document.createTreeWalker(codeEl, NodeFilter.SHOW_TEXT);
  const textNodes: TextNodeEntry[] = [];
  let charOffset = 0;

  let currentNode = walker.nextNode();
  while (currentNode) {
    const text = currentNode as Text;
    const content = text.textContent ?? '';
    if (content === '\u200b') {
      charOffset += 1;
    } else {
      textNodes.push({node: text, start: charOffset});
      charOffset += content.length + 1;
    }
    currentNode = walker.nextNode();
  }
  return textNodes;
}

// ---------------------------------------------------------------------------
// Binary search
// ---------------------------------------------------------------------------

/**
 * Binary search for the Text node containing a character offset.
 * Returns the node and the local offset within that node, or null
 * if the offset falls outside any mapped node.
 */
function findPosition(
  textNodes: TextNodeEntry[],
  offset: number,
): {node: Text; offset: number} | null {
  let lo = 0;
  let hi = textNodes.length - 1;

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const entry = textNodes[mid];
    if (offset < entry.start) {
      hi = mid - 1;
    } else if (
      mid + 1 < textNodes.length &&
      offset >= textNodes[mid + 1].start
    ) {
      lo = mid + 1;
    } else {
      const localOffset = offset - entry.start;
      if (localOffset <= (entry.node.textContent?.length ?? 0)) {
        return {node: entry.node, offset: localOffset};
      }
      return null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Dynamic ::highlight() style injection
// ---------------------------------------------------------------------------

/**
 * Track which token types already have a ::highlight() CSS rule.
 * Known types are injected statically by ensureHighlightStyles();
 * unknown types (e.g. from a Shiki adapter) get rules injected lazily.
 */
const registeredHighlightTypes = new Set<string>();
let dynamicStyleSheet: CSSStyleSheet | null = null;

/**
 * Ensure a ::highlight(xds-{type}) CSS rule exists for the given token type.
 * For the built-in types this is a no-op (static sheet covers them).
 * For unknown types, injects a rule that maps to a --color-syntax-{type}
 * custom property, falling back to currentColor.
 */
function ensureHighlightType(tokenType: string): void {
  if (registeredHighlightTypes.has(tokenType)) return;
  registeredHighlightTypes.add(tokenType);

  // Static styles cover the built-in types; only inject for unknown ones
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
    `.xds-codeblock ::highlight(${name}), .xds-codeeditor ::highlight(${name}) { color: ${colorVar}; }`,
  );
}

// ---------------------------------------------------------------------------
// Range application
// ---------------------------------------------------------------------------

/**
 * Apply CSS Custom Highlight API ranges to a code element.
 *
 * Derives token types from the tokens themselves (not a hardcoded list),
 * so custom tokenizers (e.g. Shiki adapters) can produce arbitrary
 * scope names and they'll be registered automatically.
 *
 * Groups tokens by type, resolves each token's character offsets to
 * DOM Range objects via binary search over the text node map, and
 * registers them with the global CSS.highlights registry.
 *
 * Returns a cleanup function that removes all created ranges.
 */
/**
 * Tokens per chunk when applying ranges progressively.
 * Smaller = more responsive, larger = fewer frames to full color.
 */
const RANGE_CHUNK_SIZE = 200;

/**
 * Resolve a flat list of tokens into Highlight entries, returning
 * the ranges and their associated Highlight objects for cleanup.
 */
function resolveTokenRanges(
  tokens: Token[],
  textNodes: TextNodeEntry[],
): Array<{range: Range; highlight: Highlight}> {
  // Group tokens by type
  const tokensByType = new Map<string, Token[]>();
  for (const token of tokens) {
    const existing = tokensByType.get(token.type);
    if (existing) {
      existing.push(token);
    } else {
      tokensByType.set(token.type, [token]);
    }
  }

  const results: Array<{range: Range; highlight: Highlight}> = [];

  for (const [tokenType, typedTokens] of tokensByType) {
    ensureHighlightType(tokenType);

    const name = `xds-${tokenType}`;
    let highlight = CSS.highlights.get(name);
    if (!highlight) {
      highlight = new Highlight();
      CSS.highlights.set(name, highlight);
    }

    for (const token of typedTokens) {
      const startPos = findPosition(textNodes, token.start);
      const endPos = findPosition(textNodes, token.end);
      if (!startPos || !endPos) continue;

      try {
        const range = new Range();
        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);
        highlight.add(range);
        results.push({range, highlight});
      } catch {
        // Skip invalid ranges (detached nodes, out-of-bounds offsets)
      }
    }
  }

  return results;
}

function cleanupRanges(
  ranges: Array<{range: Range; highlight: Highlight}>,
): void {
  for (const {range, highlight} of ranges) {
    highlight.delete(range);
  }
}

/**
 * Apply CSS Custom Highlight API ranges synchronously.
 * Best for small token sets (< RANGE_CHUNK_SIZE).
 * Returns a cleanup function that removes all created ranges.
 */
export function applyHighlightRanges(
  codeEl: HTMLElement,
  tokens: Token[],
): () => void {
  const textNodes = buildTextNodeMap(codeEl);
  const myRanges = resolveTokenRanges(tokens, textNodes);

  return function cleanup() {
    cleanupRanges(myRanges);
  };
}

/**
 * Apply CSS Custom Highlight API ranges in chunks, yielding to the
 * browser between batches via requestAnimationFrame. Colors appear
 * progressively over a few frames instead of blocking the main thread.
 *
 * Returns a cleanup function that cancels pending work and removes
 * all ranges applied so far.
 */
export function applyHighlightRangesChunked(
  codeEl: HTMLElement,
  tokens: Token[],
  chunkSize: number = RANGE_CHUNK_SIZE,
): () => void {
  // For small token sets, apply synchronously — no chunking overhead
  if (tokens.length <= chunkSize) {
    return applyHighlightRanges(codeEl, tokens);
  }

  const textNodes = buildTextNodeMap(codeEl);

  // Pre-group tokens by type and resolve highlights once
  const tokensByType = new Map<
    string,
    {tokens: Token[]; highlight: Highlight}
  >();
  for (const token of tokens) {
    let entry = tokensByType.get(token.type);
    if (!entry) {
      ensureHighlightType(token.type);
      const name = `xds-${token.type}`;
      let highlight = CSS.highlights.get(name);
      if (!highlight) {
        highlight = new Highlight();
        CSS.highlights.set(name, highlight);
      }
      entry = {tokens: [], highlight};
      tokensByType.set(token.type, entry);
    }
    entry.tokens.push(token);
  }

  // Flatten to a single ordered list for chunked iteration
  const allEntries: Array<{token: Token; highlight: Highlight}> = [];
  for (const {tokens: typedTokens, highlight} of tokensByType.values()) {
    for (const token of typedTokens) {
      allEntries.push({token, highlight});
    }
  }

  const myRanges: Array<{range: Range; highlight: Highlight}> = [];
  let cursor = 0;
  let rafId = 0;
  let cancelled = false;

  function processChunk() {
    if (cancelled) return;

    const end = Math.min(cursor + chunkSize, allEntries.length);
    for (let i = cursor; i < end; i++) {
      const {token, highlight} = allEntries[i];
      const startPos = findPosition(textNodes, token.start);
      const endPos = findPosition(textNodes, token.end);
      if (!startPos || !endPos) continue;

      try {
        const range = new Range();
        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);
        highlight.add(range);
        myRanges.push({range, highlight});
      } catch {
        // Skip invalid ranges
      }
    }
    cursor = end;

    if (cursor < allEntries.length) {
      rafId = requestAnimationFrame(processChunk);
    }
  }

  // Start first chunk synchronously for immediate partial coloring
  processChunk();

  return function cleanup() {
    cancelled = true;
    cancelAnimationFrame(rafId);
    cleanupRanges(myRanges);
  };
}
