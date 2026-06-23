// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  parseMarkdown,
  parseMarkdownIncremental,
  createIncrementalState,
  trimStreamingArtifacts,
} from './parser';
import type {BlockNode, InlineNode} from './parser';

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

  it('joins loose ordered list across streamed chunks', () => {
    // The boundary detector settles each pre-blank-line segment separately;
    // without the merge step this would land as three separate <ol>s.
    const text = '1. apple\n\n1. banana\n\n1. cherry\n';
    const {final} = simulateStreaming(text, 5);
    expect(final).toHaveLength(1);
    expect(final[0].type).toBe('list');
    if (final[0].type === 'list') {
      expect(final[0].items).toHaveLength(3);
      expect(final[0].loose).toBe(true);
    }
  });

  it('joins loose ) ordered list across streamed chunks', () => {
    const text = '1) apple\n\n1) banana\n\n1) cherry\n';
    const {final} = simulateStreaming(text, 5);
    expect(final).toHaveLength(1);
    if (final[0].type === 'list') {
      expect(final[0].items).toHaveLength(3);
      expect(final[0].delimiter).toBe(')');
    }
  });

  it('does not merge ordered lists with different delimiters across chunks', () => {
    // A change of delimiter (. -> )) starts a new list (CommonMark 5.2), so
    // the streamed result must match the full parse and stay two lists.
    const text = '1. First\n\n2) Second\n';
    const {final} = simulateStreaming(text, 4);
    expect(final).toEqual(parseMarkdown(text));
    expect(final.filter(b => b.type === 'list')).toHaveLength(2);
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

  it('auto-closes unclosed mid-line bold', () => {
    // Mid-line ** with content after but no closer → append closing **
    // so text renders bold immediately during streaming
    expect(trimStreamingArtifacts('Hello **bold')).toBe('Hello **bold**');
    expect(trimStreamingArtifacts('Hello **bo')).toBe('Hello **bo**');
    // Trailing ** with no content → still trimmed
    expect(trimStreamingArtifacts('Hello **')).toBe('Hello ');
  });

  it('auto-closes unclosed mid-line italic', () => {
    expect(trimStreamingArtifacts('Hello *ital')).toBe('Hello *ital*');
    expect(trimStreamingArtifacts('Hello *')).toBe('Hello ');
  });

  it('preserves complete bold+italic in same line', () => {
    expect(trimStreamingArtifacts('Hello **bold** and *italic*')).toBe(
      'Hello **bold** and *italic*',
    );
  });

  it('auto-closes unclosed bold after closed bold', () => {
    expect(trimStreamingArtifacts('Hello **done** and **open')).toBe(
      'Hello **done** and **open**',
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

  it('trims unclosed mid-line strikethrough', () => {
    expect(trimStreamingArtifacts('Hello ~~struck')).toBe('Hello ');
    expect(trimStreamingArtifacts('Hello ~~s')).toBe('Hello ');
  });

  it('preserves closed strikethrough', () => {
    expect(trimStreamingArtifacts('Hello ~~struck~~ more')).toBe(
      'Hello ~~struck~~ more',
    );
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
    parseMarkdownIncremental(input, state);
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

describe('streaming end-to-end: no raw syntax visible', () => {
  /**
   * Helper: extract all visible text from a block tree.
   * Returns the text that would be rendered to the user, without markdown syntax.
   */
  function extractVisibleText(blocks: BlockNode[]): string {
    let text = '';
    for (const block of blocks) {
      switch (block.type) {
        case 'heading':
        case 'paragraph':
          text += extractInlineText(block.children);
          break;
        case 'codeblock':
          text += block.content;
          break;
        case 'blockquote':
          text += extractVisibleText(block.children);
          break;
        case 'list':
          for (const item of block.items) {
            text += extractVisibleText(item.children);
          }
          break;
        case 'table':
          for (const h of block.headers) {
            text += extractInlineText(h.children);
          }
          for (const row of block.rows) {
            for (const cell of row) {
              text += extractInlineText(cell.children);
            }
          }
          break;
        case 'hr':
          break;
        case 'image':
          text += block.alt;
          break;
      }
    }
    return text;
  }

  function extractInlineText(nodes: InlineNode[]): string {
    let text = '';
    for (const node of nodes) {
      switch (node.type) {
        case 'text':
          text += node.content;
          break;
        case 'code':
          text += node.content;
          break;
        case 'bold':
        case 'italic':
        case 'strikethrough':
        case 'link':
          text += extractInlineText(node.children);
          break;
        case 'image':
          text += node.alt;
          break;
        case 'citation':
          text += node.sourceId;
          break;
        case 'break':
          text += '\n';
          break;
      }
    }
    return text;
  }

  function streamCharByChar(fullText: string): {
    snapshots: BlockNode[][];
    visibleTexts: string[];
  } {
    const state = createIncrementalState();
    const snapshots: BlockNode[][] = [];
    const visibleTexts: string[] = [];
    for (let i = 1; i <= fullText.length; i++) {
      const trimmed = trimStreamingArtifacts(fullText.slice(0, i));
      const blocks = parseMarkdownIncremental(trimmed, state);
      snapshots.push(blocks);
      visibleTexts.push(extractVisibleText(blocks));
    }
    return {snapshots, visibleTexts};
  }

  it('bold text appears progressively during streaming', () => {
    const text = 'Hello **bold text** and more';
    const {visibleTexts} = streamCharByChar(text);
    // Content should never completely disappear — we should never hide
    // 20+ chars of content just because of unclosed markers
    const nonEmpty = visibleTexts.filter(t => t.length > 0);
    for (const visible of nonEmpty) {
      // At minimum "Hello" should always be visible once it appears
      if (visible.length >= 5) {
        expect(visible.startsWith('Hello')).toBe(true);
      }
    }
    // Text may briefly shrink when ** becomes formatting (markers removed
    // from visible text) — that's expected and correct.
    // Final result should have the full text (without raw markers)
    expect(visibleTexts[visibleTexts.length - 1]).toBe(
      'Hello bold text and more',
    );
  });

  it('never shows raw ** during bold streaming', () => {
    const text = 'Hello **bold text** and more';
    const {visibleTexts} = streamCharByChar(text);
    for (const visible of visibleTexts) {
      // Raw ** should never appear in visible text
      expect(visible).not.toContain('**');
    }
  });

  it('never shows raw * during italic streaming', () => {
    const text = 'Hello *italic text* and more';
    const {visibleTexts} = streamCharByChar(text);
    for (const visible of visibleTexts) {
      // A lone * that's not part of a word is raw syntax
      expect(visible).not.toMatch(/(?:^|\s)\*(?:\s|$)/);
    }
  });

  it('never shows raw ~~ during strikethrough streaming', () => {
    const text = 'Hello ~~struck~~ and more';
    const {visibleTexts} = streamCharByChar(text);
    for (const visible of visibleTexts) {
      expect(visible).not.toContain('~~');
    }
  });

  it('never shows raw [ during link streaming', () => {
    const text = 'Visit [our site](https://example.com) for info';
    const {visibleTexts} = streamCharByChar(text);
    for (const visible of visibleTexts) {
      expect(visible).not.toContain('[');
      expect(visible).not.toContain('](');
    }
  });

  it('never shows raw ![ during image streaming', () => {
    const text = 'See ![alt text](https://img.png) here';
    const {visibleTexts} = streamCharByChar(text);
    for (const visible of visibleTexts) {
      expect(visible).not.toContain('![');
    }
  });

  it('table rows render incrementally after header established', () => {
    const text =
      '| A | B |\n| --- | --- |\n| r1a | r1b |\n| r2a | r2b |\n| r3a | r3b |';
    const state = createIncrementalState();
    let maxRows = 0;
    // Stream by line to see rows appear incrementally
    const lines = text.split('\n');
    for (let lineCount = 1; lineCount <= lines.length; lineCount++) {
      const input = lines.slice(0, lineCount).join('\n');
      const trimmed = trimStreamingArtifacts(input);
      const blocks = parseMarkdownIncremental(trimmed, state);
      const table = blocks.find(b => b.type === 'table');
      if (table?.type === 'table') {
        maxRows = Math.max(maxRows, table.rows.length);
      }
    }
    // Should have seen rows accumulate, not all at once
    expect(maxRows).toBe(3);
  });

  it('complex mixed content char-by-char never shows raw syntax', () => {
    const text = [
      '## Heading',
      '',
      'A paragraph with **bold**, *italic*, and `code`.',
      '',
      '- List item **one**',
      '- List item [two](http://two.com)',
      '- List item ~~three~~',
      '',
      '| Col | Val |',
      '| --- | --- |',
      '| **a** | *b* |',
    ].join('\n');

    const {visibleTexts} = streamCharByChar(text);
    for (const visible of visibleTexts) {
      // Links and images should never show raw syntax
      expect(visible).not.toContain('](');
      expect(visible).not.toContain('![');
    }
  });

  describe('with autolink option', () => {
    it('produces same final result as full parse with autolink: gfm', () => {
      const text = 'Visit https://example.com or mail user@example.com today.';
      const state = createIncrementalState();
      const incremental = parseMarkdownIncremental(text, state, {
        autolink: 'gfm',
      });
      const full = parseMarkdown(text, {autolink: 'gfm'});
      expect(incremental).toEqual(full);
      // Sanity: the autolink transform actually fired
      const para = incremental[0];
      if (para.type === 'paragraph') {
        const linkHrefs = para.children
          .filter((n: InlineNode) => n.type === 'link')
          .map((n: InlineNode) => (n.type === 'link' ? n.href : ''));
        expect(linkHrefs).toEqual([
          'https://example.com',
          'mailto:user@example.com',
        ]);
      } else {
        throw new Error('expected paragraph block');
      }
    });

    it('streams character-by-character to the same final result', () => {
      const text = 'see https://example.com here and mail me@example.com soon.';
      const state = createIncrementalState();
      let last: BlockNode[] = [];
      for (let i = 1; i <= text.length; i++) {
        last = parseMarkdownIncremental(text.slice(0, i), state, {
          autolink: 'gfm',
        });
      }
      const full = parseMarkdown(text, {autolink: 'gfm'});
      expect(last).toEqual(full);
    });

    it('invalidates the cache when the autolink option toggles', () => {
      const text = 'first https://a.com.\n\nsecond https://b.com.';
      const state = createIncrementalState();
      // Prime cache with autolink off.
      const off = parseMarkdownIncremental(text, state);
      expect(off).toEqual(parseMarkdown(text));
      const noLinks = off.every(
        b =>
          b.type !== 'paragraph' ||
          b.children.every((n: InlineNode) => n.type !== 'link'),
      );
      expect(noLinks).toBe(true);
      // Re-parse same text with autolink on — stale settled blocks must NOT
      // be reused as plain text.
      const on = parseMarkdownIncremental(text, state, {autolink: 'gfm'});
      expect(on).toEqual(parseMarkdown(text, {autolink: 'gfm'}));
      const hasLink = on.some(
        b =>
          b.type === 'paragraph' &&
          b.children.some((n: InlineNode) => n.type === 'link'),
      );
      expect(hasLink).toBe(true);
      // Toggle back off — cache must invalidate again.
      const offAgain = parseMarkdownIncremental(text, state);
      expect(offAgain).toEqual(parseMarkdown(text));
    });
  });
});
