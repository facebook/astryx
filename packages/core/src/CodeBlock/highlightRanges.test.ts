// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {applyHighlightRangesChunked} from './highlightRanges';
import type {TokenLine} from './tokenizer';

// Mock CSS Highlight API. `escape` is real behavior, not a mock: the code
// under test escapes generated names with it, so keep jsdom's implementation
// (or a minimal stand-in) when replacing the CSS global.
class MockHighlight extends Set<Range> {}
const mockHighlightsMap = new Map<string, MockHighlight>();
const realCssEscape =
  typeof globalThis.CSS !== 'undefined' ? globalThis.CSS.escape : undefined;

beforeEach(() => {
  mockHighlightsMap.clear();

  globalThis.CSS = {
    escape:
      realCssEscape ??
      ((value: string) =>
        value.replace(/[^a-zA-Z0-9_\u0080-\uFFFF-]/g, ch => `\\${ch}`)),
    highlights: {
      get: (name: string) => mockHighlightsMap.get(name),
      set: (name: string, h: MockHighlight) => mockHighlightsMap.set(name, h),
    } as unknown as HighlightRegistry,
  } as typeof CSS;

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
      [{type: 'keyword', start: 0, end: 5}], // "const"
      [{type: 'keyword', start: 0, end: 3}], // "let"
    ];

    // Need to inject the style element mock
    const mockStyle = document.createElement('style');
    mockStyle.setAttribute('data-astryx-highlight-styles', '');
    document.head.appendChild(mockStyle);

    const cleanup = applyHighlightRangesChunked(codeEl, tokenLines);

    const kwHighlight = mockHighlightsMap.get('astryx-keyword');
    expect(kwHighlight).toBeDefined();
    expect(kwHighlight!.size).toBe(2);

    cleanup();
    expect(kwHighlight!.size).toBe(0);
  });

  it('keeps every tokenizer type inside its own highlight rule', () => {
    // The dotted type that crashed the block, names a narrow allowlist would
    // wrongly reject (Chromium accepts them all), and a type shaped to step
    // outside its ident.
    const hostileType = 'k), body { background: url(https://example.com/x) } ';
    const types = [
      'keyword.control.sql',
      '_private',
      'キーワード',
      '9start',
      hostileType,
    ];
    const codeEl = createCodeElement(types.map(() => 'line'));
    const tokenLines: TokenLine[] = types.map(type => [
      {type, start: 0, end: 4},
    ]);

    const mockStyle = document.createElement('style');
    mockStyle.setAttribute('data-astryx-highlight-styles', '');
    document.head.appendChild(mockStyle);

    const cleanup = applyHighlightRangesChunked(codeEl, tokenLines);

    // Every type keeps its colours: ranges register under the RAW names.
    for (const type of types) {
      expect(mockHighlightsMap.get(`astryx-${type}`)?.size).toBe(1);
    }

    // And nothing in the stream produced a rule of its own making: every
    // inserted rule is a highlight rule, and the payload's declaration
    // appears nowhere.
    const dynamicSheet = document.querySelector<HTMLStyleElement>(
      'style[data-astryx-highlight-dynamic]',
    );
    const rules = Array.from(dynamicSheet?.sheet?.cssRules ?? []);
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      // Escaped payload characters stay inside the highlight IDENT (they may
      // appear in the selector text), so the property to pin is the
      // declarations: every rule paints color and nothing else.
      expect(rule.cssText).toMatch(/^\.astryx-code-block code::highlight\(/);
      const style = (rule as CSSStyleRule).style;
      // (No color assertion: jsdom's cssstyle drops var() declarations, so
      // only the absence of the payload's properties is checkable here.)
      expect(style.getPropertyValue('background')).toBe('');
      expect(style.getPropertyValue('background-image')).toBe('');
    }

    cleanup();
  });

  it('handles empty token lines', () => {
    const codeEl = createCodeElement(['', 'const x = 1;']);
    const tokenLines: TokenLine[] = [[], [{type: 'keyword', start: 0, end: 5}]];

    const mockStyle = document.createElement('style');
    mockStyle.setAttribute('data-astryx-highlight-styles', '');
    document.head.appendChild(mockStyle);

    const cleanup = applyHighlightRangesChunked(codeEl, tokenLines);

    const kwHighlight = mockHighlightsMap.get('astryx-keyword');
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
    mockStyle.setAttribute('data-astryx-highlight-styles', '');
    document.head.appendChild(mockStyle);

    const cleanup = applyHighlightRangesChunked(codeEl, tokenLines);

    const kwHighlight = mockHighlightsMap.get('astryx-keyword');
    const numHighlight = mockHighlightsMap.get('astryx-number');
    expect(kwHighlight!.size).toBe(1);
    expect(numHighlight!.size).toBe(1);

    cleanup();
    expect(kwHighlight!.size).toBe(0);
    expect(numHighlight!.size).toBe(0);
  });
});
