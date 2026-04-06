import {describe, it, expect} from 'vitest';
import {parseMarkdown, parseMarkdownIncremental, createIncrementalState} from './parser';
import type {BlockNode} from './parser';

function simulateStreaming(fullText: string, chunkSize = 10) {
  const state = createIncrementalState();
  const snapshots: BlockNode[][] = [];
  for (let i = chunkSize; i <= fullText.length; i += chunkSize) {
    snapshots.push(parseMarkdownIncremental(fullText.slice(0, i), state));
  }
  const final = parseMarkdownIncremental(fullText, state);
  snapshots.push(final);
  return {snapshots, final, state};
}

describe('parseMarkdownIncremental', () => {
  it('produces same final result as full parse', () => {
    const text = '# Hello\n\nThis is a paragraph.\n\n- Item 1\n- Item 2';
    const {final} = simulateStreaming(text);
    const full = parseMarkdown(text);
    expect(final).toEqual(full);
  });

  it('handles empty input', () => {
    const state = createIncrementalState();
    const result = parseMarkdownIncremental('', state);
    expect(result).toEqual([]);
  });

  it('settles blocks after double newline', () => {
    const state = createIncrementalState();
    const input = '# Heading\n\nParagraph text\n\nMore text';
    parseMarkdownIncremental(input, state);
    expect(state.settledBlocks.length).toBeGreaterThan(0);
  });

  it('code fences prevent false settlement', () => {
    const state = createIncrementalState();
    const input = '```javascript\nconst x = 1;\n\n// still in code\nconsole.log(x);';
    parseMarkdownIncremental(input, state);
    // Inside an unclosed fence, nothing should be settled
    expect(state.settledBlocks).toHaveLength(0);
  });

  it('handles heading then code block', () => {
    const text = '# Title\n\n```ts\nconst x = 1;\n```';
    const {final} = simulateStreaming(text);
    const full = parseMarkdown(text);
    expect(final).toEqual(full);
  });

  it('handles table streaming', () => {
    const text = '| Col1 | Col2 |\n| --- | --- |\n| a | b |\n| c | d |';
    const {final} = simulateStreaming(text, 5);
    const full = parseMarkdown(text);
    expect(final).toEqual(full);
  });

  it('handles list streaming', () => {
    const text = '- Item 1\n- Item 2\n- Item 3';
    const {final} = simulateStreaming(text);
    const full = parseMarkdown(text);
    expect(final).toEqual(full);
    if (final[0].type === 'list') {
      expect(final[0].items).toHaveLength(3);
    }
  });

  it('handles 1-char chunks and matches full parse', () => {
    const text = '# Hello\n\nWorld';
    const {final} = simulateStreaming(text, 1);
    const full = parseMarkdown(text);
    expect(final).toEqual(full);
  });

  it('handles multiple code fences', () => {
    const text = '```js\nconst a = 1;\n```\n\n```py\nprint("hi")\n```';
    const {final} = simulateStreaming(text);
    const full = parseMarkdown(text);
    expect(final).toEqual(full);
  });

  it('resets state on empty input', () => {
    const state = createIncrementalState();
    parseMarkdownIncremental('# Hello\n\nWorld', state);
    expect(state.prevInput).not.toBe('');
    parseMarkdownIncremental('', state);
    expect(state.prevInput).toBe('');
    expect(state.settledBlocks).toEqual([]);
    expect(state.settledUpTo).toBe(0);
    expect(state.settledText).toBe('');
  });

  it('unclosed fence keeps everything unsettled', () => {
    const state = createIncrementalState();
    const input = '# Title\n\n```python\ndef foo():\n    pass\n\n# still inside fence';
    parseMarkdownIncremental(input, state);
    expect(state.settledBlocks).toHaveLength(0);
  });

  it('handles task list streaming', () => {
    const text = '- [ ] Todo 1\n- [x] Done 1\n- [ ] Todo 2';
    const {final} = simulateStreaming(text);
    const full = parseMarkdown(text);
    expect(final).toEqual(full);
    if (final[0].type === 'list') {
      expect(final[0].items[0].checked).toBe(false);
      expect(final[0].items[1].checked).toBe(true);
    }
  });

  it('complex mixed content matches full parse', () => {
    const text = [
      '# Overview',
      '',
      'This is an introduction paragraph.',
      '',
      '```typescript',
      'function hello() {',
      '  return "world";',
      '}',
      '```',
      '',
      '| Feature | Status |',
      '| --- | --- |',
      '| Auth | Done |',
      '',
      '> A blockquote with important info.',
      '',
      '1. First step',
      '2. Second step',
      '',
      '---',
      '',
      'Visit [our site](https://example.com) for more.',
    ].join('\n');
    const {final} = simulateStreaming(text, 15);
    const full = parseMarkdown(text);
    expect(final).toEqual(full);
  });

  it('reuses cached settled blocks when settled portion is unchanged', () => {
    const state = createIncrementalState();
    // First call: establish settled content
    parseMarkdownIncremental('# Title\n\nParagraph\n\nStill typing', state);
    const cachedBlocks = state.settledBlocks;

    // Second call: only unsettled tail changed
    parseMarkdownIncremental('# Title\n\nParagraph\n\nStill typing more', state);
    // The settled blocks array reference should be the same (reused, not re-parsed)
    expect(state.settledBlocks).toBe(cachedBlocks);
  });

  it('tracks settledText correctly', () => {
    const state = createIncrementalState();
    parseMarkdownIncremental('# Hello\n\nWorld', state);
    expect(state.settledText).toBe('# Hello');
  });
});
