// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {applyHighlightRangesChunked} from './highlightRanges';
import type {TokenLine} from './tokenizer';

// Mock CSS Highlight API
class MockHighlight extends Set<Range> {}
const mockHighlightsMap = new Map<string, MockHighlight>();

beforeEach(() => {
  mockHighlightsMap.clear();

  // @ts-expect-error - mocking global CSS.highlights
  globalThis.CSS = {
    highlights: {
      get: (name: string) => mockHighlightsMap.get(name),
      set: (name: string, h: MockHighlight) => mockHighlightsMap.set(name, h),
    },
  };

  // @ts-expect-error - mocking global Highlight
  globalThis.Highlight = MockHighlight;

  // Mock requestAnimationFrame
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => {
    fn(0);
    return 0;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function createCodeElement(lines: string[]): HTMLElement {
  const code = document.createElement('code');
  for (let i = 0; i < lines.length; i++) {
    const div = document.createElement('div');
    div.setAttribute('data-line', String(i + 1));
    div.textContent = lines[i] || '\u200b';
    code.appendChild(div);
  }
  return code;
}

describe('applyHighlightRangesChunked', () => {
  it('creates ranges for tokens on each line', () => {
    const codeEl = createCodeElement(['const x = 1;', 'let y = 2;']);
    const tokenLines: TokenLine[] = [
      [{type: 'keyword', start: 0, end: 5}],  // "const"
      [{type: 'keyword', start: 0, end: 3}],  // "let"
    ];

    // Need to inject the style element mock
    const mockStyle = document.createElement('style');
    mockStyle.setAttribute('data-xds-highlight-styles', '');
    document.head.appendChild(mockStyle);

    const cleanup = applyHighlightRangesChunked(codeEl, tokenLines);

    const kwHighlight = mockHighlightsMap.get('xds-keyword');
    expect(kwHighlight).toBeDefined();
    expect(kwHighlight!.size).toBe(2);

    cleanup();
    expect(kwHighlight!.size).toBe(0);
  });

  it('handles empty token lines', () => {
    const codeEl = createCodeElement(['', 'const x = 1;']);
    const tokenLines: TokenLine[] = [
      [],
      [{type: 'keyword', start: 0, end: 5}],
    ];

    const mockStyle = document.createElement('style');
    mockStyle.setAttribute('data-xds-highlight-styles', '');
    document.head.appendChild(mockStyle);

    const cleanup = applyHighlightRangesChunked(codeEl, tokenLines);

    const kwHighlight = mockHighlightsMap.get('xds-keyword');
    expect(kwHighlight).toBeDefined();
    expect(kwHighlight!.size).toBe(1);

    cleanup();
  });

  it('returns cleanup that removes all ranges', () => {
    const codeEl = createCodeElement(['const x = 1;']);
    const tokenLines: TokenLine[] = [
      [
        {type: 'keyword', start: 0, end: 5},
        {type: 'number', start: 10, end: 11},
      ],
    ];

    const mockStyle = document.createElement('style');
    mockStyle.setAttribute('data-xds-highlight-styles', '');
    document.head.appendChild(mockStyle);

    const cleanup = applyHighlightRangesChunked(codeEl, tokenLines);

    const kwHighlight = mockHighlightsMap.get('xds-keyword');
    const numHighlight = mockHighlightsMap.get('xds-number');
    expect(kwHighlight!.size).toBe(1);
    expect(numHighlight!.size).toBe(1);

    cleanup();
    expect(kwHighlight!.size).toBe(0);
    expect(numHighlight!.size).toBe(0);
  });
});
