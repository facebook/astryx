/**
 * @file highlightRanges.test.ts
 * Tests for binary search, text node mapping, and range application.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {buildTextNodeMap, applyHighlightRanges} from './highlightRanges';

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

function makeCodeEl(lines: string[]): HTMLElement {
  const code = document.createElement('code');
  for (const line of lines) {
    const div = document.createElement('div');
    div.textContent = line || '\u200b';
    code.appendChild(div);
  }
  document.body.appendChild(code);
  return code;
}

afterEach(() => {
  document.body.innerHTML = '';
});

// ---------------------------------------------------------------------------
// buildTextNodeMap
// ---------------------------------------------------------------------------

describe('buildTextNodeMap', () => {
  it('maps single-line code', () => {
    const el = makeCodeEl(['const x = 1;']);
    const nodes = buildTextNodeMap(el);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].start).toBe(0);
    expect(nodes[0].node.textContent).toBe('const x = 1;');
  });

  it('maps multi-line code with correct offsets', () => {
    const el = makeCodeEl(['hello', 'world']);
    const nodes = buildTextNodeMap(el);

    expect(nodes).toHaveLength(2);
    expect(nodes[0].start).toBe(0);
    expect(nodes[1].start).toBe(6); // "hello"(5) + 1 for \n
  });

  it('handles empty lines (zero-width space)', () => {
    const el = makeCodeEl(['hello', '', 'world']);
    const nodes = buildTextNodeMap(el);

    // ZWSP nodes not included in array
    expect(nodes).toHaveLength(2);
    expect(nodes[0].start).toBe(0);
    expect(nodes[1].start).toBe(7); // "hello"(5) + \n(1) + ZWSP(1)
  });

  it('returns empty for empty element', () => {
    const el = document.createElement('code');
    document.body.appendChild(el);
    expect(buildTextNodeMap(el)).toHaveLength(0);
  });

  it('offset accounts for multiple consecutive empty lines', () => {
    const el = makeCodeEl(['a', '', '', 'b']);
    const nodes = buildTextNodeMap(el);

    expect(nodes).toHaveLength(2);
    expect(nodes[0].start).toBe(0); // "a"
    expect(nodes[1].start).toBe(4); // "a"(1) + \n(1) + ZWSP(1) + ZWSP(1)
  });
});

// ---------------------------------------------------------------------------
// applyHighlightRanges
// ---------------------------------------------------------------------------

describe('applyHighlightRanges', () => {
  let mockHighlights: Map<string, Set<Range>>;

  beforeEach(() => {
    mockHighlights = new Map();

    if (typeof CSS === 'undefined') {
      (globalThis as Record<string, unknown>).CSS = {};
    }
    (CSS as Record<string, unknown>).highlights = {
      get(name: string) {
        return mockHighlights.get(name);
      },
      set(name: string, highlight: Set<Range>) {
        mockHighlights.set(name, highlight);
      },
    };

    (globalThis as Record<string, unknown>).Highlight =
      class MockHighlight extends Set<Range> {};
  });

  afterEach(() => {
    delete (CSS as Record<string, unknown>).highlights;
    delete (globalThis as Record<string, unknown>).Highlight;
  });

  it('creates ranges for tokens', () => {
    const el = makeCodeEl(['const x = 1;']);
    const tokens = [
      {type: 'keyword', start: 0, end: 5},
      {type: 'variable', start: 6, end: 7},
      {type: 'number', start: 10, end: 11},
    ];

    const cleanupFn = applyHighlightRanges(el, tokens);

    expect(mockHighlights.has('xds-keyword')).toBe(true);
    expect(mockHighlights.has('xds-variable')).toBe(true);
    expect(mockHighlights.has('xds-number')).toBe(true);
    expect(mockHighlights.get('xds-keyword')!.size).toBe(1);
    expect(mockHighlights.get('xds-variable')!.size).toBe(1);
    expect(mockHighlights.get('xds-number')!.size).toBe(1);

    cleanupFn();
  });

  it('handles multi-line tokens', () => {
    const el = makeCodeEl(['const x = 1;', 'let y = 2;']);
    const tokens = [
      {type: 'keyword', start: 0, end: 5},
      {type: 'keyword', start: 14, end: 17},
    ];

    const cleanupFn = applyHighlightRanges(el, tokens);
    expect(mockHighlights.get('xds-keyword')!.size).toBe(2);
    cleanupFn();
  });

  it('skips tokens with out-of-bounds offsets', () => {
    const el = makeCodeEl(['hello']);
    const tokens = [
      {type: 'keyword', start: 0, end: 5},
      {type: 'keyword', start: 100, end: 105},
    ];

    const cleanupFn = applyHighlightRanges(el, tokens);
    expect(mockHighlights.get('xds-keyword')!.size).toBe(1);
    cleanupFn();
  });

  it('cleanup removes all ranges', () => {
    const el = makeCodeEl(['const x = 1;']);
    const tokens = [
      {type: 'keyword', start: 0, end: 5},
      {type: 'number', start: 10, end: 11},
    ];

    const cleanupFn = applyHighlightRanges(el, tokens);
    expect(mockHighlights.get('xds-keyword')!.size).toBe(1);
    expect(mockHighlights.get('xds-number')!.size).toBe(1);

    cleanupFn();

    expect(mockHighlights.get('xds-keyword')!.size).toBe(0);
    expect(mockHighlights.get('xds-number')!.size).toBe(0);
  });

  it('returns no-op cleanup for empty tokens', () => {
    const el = makeCodeEl(['hello']);
    const cleanupFn = applyHighlightRanges(el, []);

    // No highlights created for unused types
    expect(mockHighlights.size).toBe(0);

    // Should not throw
    cleanupFn();
  });

  it('handles tokens across empty lines', () => {
    // "if (x)\n\n  return y;"
    const el = makeCodeEl(['if (x)', '', '  return y;']);
    const tokens = [
      {type: 'keyword', start: 0, end: 2},
      {type: 'keyword', start: 10, end: 16},
    ];

    const cleanupFn = applyHighlightRanges(el, tokens);
    expect(mockHighlights.get('xds-keyword')!.size).toBe(2);
    cleanupFn();
  });

  it('registers highlights for arbitrary token types', () => {
    const el = makeCodeEl(['hello']);
    const tokens = [{type: 'made_up_type', start: 0, end: 5}];

    const cleanupFn = applyHighlightRanges(el, tokens);
    expect(mockHighlights.has('xds-made_up_type')).toBe(true);
    expect(mockHighlights.get('xds-made_up_type')!.size).toBe(1);
    cleanupFn();
    expect(mockHighlights.get('xds-made_up_type')!.size).toBe(0);
  });
});
