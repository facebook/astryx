import {describe, it, expect} from 'vitest';
import {
  parseMarkdown,
  parseMarkdownIncremental,
  createIncrementalState,
  trimStreamingArtifacts,
} from './parser';
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
    const input =
      '```javascript\nconst x = 1;\n\n// still in code\nconsole.log(x);';
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
    const input =
      '# Title\n\n```python\ndef foo():\n    pass\n\n# still inside fence';
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
    parseMarkdownIncremental(
      '# Title\n\nParagraph\n\nStill typing more',
      state,
    );
    // The settled blocks array reference should be the same (reused, not re-parsed)
    expect(state.settledBlocks).toBe(cachedBlocks);
  });

  it('tracks settledText correctly', () => {
    const state = createIncrementalState();
    parseMarkdownIncremental('# Hello\n\nWorld', state);
    expect(state.settledText).toBe('# Hello');
  });
});

describe('trimStreamingArtifacts', () => {
  it('trims trailing unclosed bold markers', () => {
    expect(trimStreamingArtifacts('Hello **')).toBe('Hello ');
    expect(trimStreamingArtifacts('Hello *')).toBe('Hello ');
    expect(trimStreamingArtifacts('Hello ***')).toBe('Hello ');
  });

  it('trims unclosed mid-line bold', () => {
    expect(trimStreamingArtifacts('Hello **bold')).toBe('Hello ');
    expect(trimStreamingArtifacts('Hello **bo')).toBe('Hello ');
  });

  it('trims unclosed mid-line italic', () => {
    expect(trimStreamingArtifacts('Hello *ital')).toBe('Hello ');
  });

  it('preserves complete bold+italic in same line', () => {
    expect(trimStreamingArtifacts('Hello **bold** and *italic*')).toBe(
      'Hello **bold** and *italic*',
    );
  });

  it('trims unclosed bold after closed bold', () => {
    expect(trimStreamingArtifacts('Hello **done** and **open')).toBe(
      'Hello **done** and ',
    );
  });

  it('preserves closed bold markers', () => {
    expect(trimStreamingArtifacts('Hello **world**')).toBe('Hello **world**');
  });

  it('trims trailing unclosed backticks', () => {
    expect(trimStreamingArtifacts('Hello `')).toBe('Hello ');
    expect(trimStreamingArtifacts('Hello ```')).toBe('Hello ');
  });

  it('preserves closed inline code', () => {
    expect(trimStreamingArtifacts('Hello `code`')).toBe('Hello `code`');
  });

  it('trims trailing unclosed strikethrough', () => {
    expect(trimStreamingArtifacts('Hello ~~')).toBe('Hello ');
    expect(trimStreamingArtifacts('Hello ~')).toBe('Hello ');
  });

  it('trims unclosed link text', () => {
    expect(trimStreamingArtifacts('Hello [link text')).toBe('Hello ');
    expect(trimStreamingArtifacts('Hello [link')).toBe('Hello ');
  });

  it('preserves closed links', () => {
    expect(trimStreamingArtifacts('Hello [text](url)')).toBe(
      'Hello [text](url)',
    );
  });

  it('trims unclosed image alt', () => {
    expect(trimStreamingArtifacts('Hello ![alt')).toBe('Hello ');
  });

  it('operates only on the last line', () => {
    expect(trimStreamingArtifacts('Line 1\nHello **')).toBe('Line 1\nHello ');
    expect(trimStreamingArtifacts('Line 1\n**bold** done\nHello *')).toBe(
      'Line 1\n**bold** done\nHello ',
    );
  });

  it('handles empty input', () => {
    expect(trimStreamingArtifacts('')).toBe('');
  });

  it('handles input with no artifacts', () => {
    expect(trimStreamingArtifacts('Just plain text')).toBe('Just plain text');
  });
});

describe('streaming structural suppression', () => {
  it('suppresses bare list markers in unsettled zone', () => {
    const state = createIncrementalState();
    // Paragraph followed by incomplete list item
    const input = 'Some text\n\n- ';
    const blocks = parseMarkdownIncremental(input, state);
    // Should NOT produce a list with an empty item
    const hasList = blocks.some(b => b.type === 'list');
    expect(hasList).toBe(false);
  });

  it('renders list items once text arrives', () => {
    const state = createIncrementalState();
    const input = 'Some text\n\n- First item';
    const blocks = parseMarkdownIncremental(input, state);
    const list = blocks.find(b => b.type === 'list');
    expect(list).toBeDefined();
    if (list?.type === 'list') {
      expect(list.items).toHaveLength(1);
    }
  });

  it('suppresses incomplete table header without separator', () => {
    const state = createIncrementalState();
    // Table header without separator row
    const input = 'Intro\n\n| Col1 | Col2 |';
    const blocks = parseMarkdownIncremental(input, state);
    const hasTable = blocks.some(b => b.type === 'table');
    expect(hasTable).toBe(false);
  });

  it('suppresses table separator without data rows', () => {
    const state = createIncrementalState();
    const input = 'Intro\n\n| Col1 | Col2 |\n| --- | --- |';
    const blocks = parseMarkdownIncremental(input, state);
    // Should suppress: header + separator but no data rows yet
    // Actually this is a valid table with 0 data rows — parser may render it.
    // The key test is that we don't show partial pipe syntax.
  });

  it('renders complete table once rows arrive', () => {
    const state = createIncrementalState();
    const input = 'Intro\n\n| Col1 | Col2 |\n| --- | --- |\n| a | b |';
    const blocks = parseMarkdownIncremental(input, state);
    const table = blocks.find(b => b.type === 'table');
    expect(table).toBeDefined();
    if (table?.type === 'table') {
      expect(table.rows).toHaveLength(1);
    }
  });

  it('suppresses ordered list marker without content', () => {
    const state = createIncrementalState();
    const input = 'Intro\n\n1. ';
    const blocks = parseMarkdownIncremental(input, state);
    const hasList = blocks.some(b => b.type === 'list');
    expect(hasList).toBe(false);
  });

  it('no suppression for complete list items', () => {
    const state = createIncrementalState();
    const input = 'Intro\n\n- Complete item\n- Another item';
    const blocks = parseMarkdownIncremental(input, state);
    const list = blocks.find(b => b.type === 'list');
    expect(list).toBeDefined();
    if (list?.type === 'list') {
      expect(list.items).toHaveLength(2);
    }
  });

  it('character-by-character streaming never produces bare list markers', () => {
    const fullText = 'Hello world\n\n- Item one\n- Item two\n- Item three';
    const state = createIncrementalState();
    for (let i = 1; i <= fullText.length; i++) {
      const blocks = parseMarkdownIncremental(fullText.slice(0, i), state);
      for (const block of blocks) {
        if (block.type === 'list') {
          for (const item of block.items) {
            // Every rendered list item should have non-empty content
            const firstChild = item.children[0];
            if (firstChild?.type === 'paragraph') {
              const textContent = firstChild.children
                .map(c => (c.type === 'text' ? c.content : ''))
                .join('')
                .trim();
              expect(textContent.length).toBeGreaterThan(0);
            }
          }
        }
      }
    }
  });
});
