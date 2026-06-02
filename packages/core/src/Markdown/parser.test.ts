// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {parseMarkdown, parseInline} from './parser';

describe('parseInline', () => {
  it('parses plain text', () => {
    const result = parseInline('hello world');
    expect(result).toEqual([{type: 'text', content: 'hello world'}]);
  });

  it('parses bold with **', () => {
    const result = parseInline('**bold text**');
    expect(result[0].type).toBe('bold');
    if (result[0].type === 'bold') {
      expect(result[0].children[0]).toEqual({
        type: 'text',
        content: 'bold text',
      });
    }
  });

  it('parses italic with *', () => {
    const result = parseInline('*italic text*');
    expect(result[0].type).toBe('italic');
    if (result[0].type === 'italic') {
      expect(result[0].children[0]).toEqual({
        type: 'text',
        content: 'italic text',
      });
    }
  });

  it('parses inline code', () => {
    const result = parseInline('`const x`');
    expect(result).toEqual([{type: 'code', content: 'const x'}]);
  });

  it('parses links', () => {
    const result = parseInline('[click](https://example.com)');
    expect(result[0].type).toBe('link');
    if (result[0].type === 'link') {
      expect(result[0].href).toBe('https://example.com');
      expect(result[0].children[0]).toEqual({type: 'text', content: 'click'});
    }
  });

  it('parses images', () => {
    const result = parseInline('![alt](img.png)');
    expect(result).toEqual([{type: 'image', src: 'img.png', alt: 'alt'}]);
  });

  it('parses strikethrough', () => {
    const result = parseInline('~~deleted~~');
    expect(result[0].type).toBe('strikethrough');
    if (result[0].type === 'strikethrough') {
      expect(result[0].children[0]).toEqual({type: 'text', content: 'deleted'});
    }
  });

  it('parses mixed inline formatting', () => {
    const result = parseInline(
      'Hello **bold** and *italic* with `code` and [link](url)',
    );
    expect(result.length).toBeGreaterThanOrEqual(5);
  });

  it('handles escape sequences', () => {
    const result = parseInline('\\*not italic\\*');
    const hasItalic = result.some(n => n.type === 'italic');
    expect(hasItalic).toBe(false);
  });

  // --- Bold-italic ---

  it('parses ***bold italic*** with asterisks', () => {
    const result = parseInline('***bold italic***');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('bold');
    if (result[0].type === 'bold') {
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].type).toBe('italic');
      if (result[0].children[0].type === 'italic') {
        expect(result[0].children[0].children[0]).toEqual({
          type: 'text',
          content: 'bold italic',
        });
      }
    }
  });

  it('parses ___bold italic___ with underscores', () => {
    const result = parseInline('___bold italic___');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('bold');
    if (result[0].type === 'bold') {
      expect(result[0].children[0].type).toBe('italic');
    }
  });

  // --- Underscore word boundary ---

  it('does NOT italicize underscores inside words', () => {
    const result = parseInline('some_variable_name');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('text');
    if (result[0].type === 'text') {
      expect(result[0].content).toBe('some_variable_name');
    }
  });

  it('does NOT bold underscores inside words', () => {
    const result = parseInline('foo__bar__baz');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('text');
    if (result[0].type === 'text') {
      expect(result[0].content).toBe('foo__bar__baz');
    }
  });

  it('italicizes underscores at word boundaries', () => {
    const result = parseInline('hello _world_ end');
    const italic = result.find(n => n.type === 'italic');
    expect(italic).toBeDefined();
    if (italic?.type === 'italic') {
      expect(italic.children[0]).toEqual({type: 'text', content: 'world'});
    }
  });

  it('asterisk italic works mid-word', () => {
    const result = parseInline('some*thing*here');
    const italic = result.find(n => n.type === 'italic');
    expect(italic).toBeDefined();
  });

  // --- Balanced parentheses in URLs ---

  it('handles parentheses in link URLs', () => {
    const result = parseInline('[text](https://example.com/wiki/Foo_(bar))');
    expect(result[0].type).toBe('link');
    if (result[0].type === 'link') {
      expect(result[0].href).toBe('https://example.com/wiki/Foo_(bar)');
    }
  });

  it('handles parentheses in image URLs', () => {
    const result = parseInline('![alt](https://example.com/img_(1).png)');
    expect(result[0].type).toBe('image');
    if (result[0].type === 'image') {
      expect(result[0].src).toBe('https://example.com/img_(1).png');
    }
  });

  // --- Line breaks ---

  it('detects line break from two trailing spaces before newline', () => {
    const result = parseInline('hello  \nworld');
    const breakNode = result.find(n => n.type === 'break');
    expect(breakNode).toBeDefined();
    expect(result).toEqual([
      {type: 'text', content: 'hello'},
      {type: 'break'},
      {type: 'text', content: 'world'},
    ]);
  });

  it('does NOT produce break with only one trailing space', () => {
    const result = parseInline('hello \nworld');
    const breakNode = result.find(n => n.type === 'break');
    expect(breakNode).toBeUndefined();
  });
});

describe('parseMarkdown', () => {
  it('parses headings', () => {
    const result = parseMarkdown('# Hello');
    expect(result[0].type).toBe('heading');
    if (result[0].type === 'heading') {
      expect(result[0].level).toBe(1);
    }
  });

  it('parses h1-h6', () => {
    const input = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6';
    const result = parseMarkdown(input);
    expect(result).toHaveLength(6);
    result.forEach((block, i) => {
      expect(block.type).toBe('heading');
      if (block.type === 'heading') {
        expect(block.level).toBe(i + 1);
      }
    });
  });

  it('parses paragraphs', () => {
    const result = parseMarkdown('Hello world');
    expect(result[0].type).toBe('paragraph');
  });

  it('separates paragraphs by blank lines', () => {
    const result = parseMarkdown('First paragraph\n\nSecond paragraph');
    const paragraphs = result.filter(b => b.type === 'paragraph');
    expect(paragraphs).toHaveLength(2);
  });

  it('parses fenced code blocks with backticks', () => {
    const input = '```javascript\nconst x = 1;\nconsole.log(x);\n```';
    const result = parseMarkdown(input);
    expect(result[0].type).toBe('codeblock');
    if (result[0].type === 'codeblock') {
      expect(result[0].language).toBe('javascript');
      expect(result[0].content).toContain('const x = 1;');
    }
  });

  it('parses code blocks with tilde fences', () => {
    const input = '~~~python\nprint("hello")\n~~~';
    const result = parseMarkdown(input);
    expect(result[0].type).toBe('codeblock');
    if (result[0].type === 'codeblock') {
      expect(result[0].language).toBe('python');
    }
  });

  it('parses blockquotes', () => {
    const result = parseMarkdown('> This is a quote');
    expect(result[0].type).toBe('blockquote');
  });

  it('parses horizontal rules', () => {
    const result = parseMarkdown('---');
    expect(result[0].type).toBe('hr');
  });

  it('parses unordered lists', () => {
    const input = '- Item 1\n- Item 2\n- Item 3';
    const result = parseMarkdown(input);
    expect(result[0].type).toBe('list');
    if (result[0].type === 'list') {
      expect(result[0].ordered).toBe(false);
      expect(result[0].items).toHaveLength(3);
    }
  });

  it('parses ordered lists', () => {
    const input = '1. First\n2. Second';
    const result = parseMarkdown(input);
    expect(result[0].type).toBe('list');
    if (result[0].type === 'list') {
      expect(result[0].ordered).toBe(true);
      expect(result[0].items).toHaveLength(2);
    }
  });

  it('parses an ordered list with a custom start number', () => {
    const result = parseMarkdown('5. five\n6. six\n7. seven');
    expect(result[0].type).toBe('list');
    if (result[0].type === 'list') {
      expect(result[0].ordered).toBe(true);
      expect(result[0].start).toBe(5);
      expect(result[0].items).toHaveLength(3);
    }
  });

  it('joins blank-line-separated same-style items into one loose list', () => {
    // CommonMark §5.3 loose-list: blank lines between items of the same
    // style/indent still form a single list. LLM output very commonly uses
    // the 1./1./1. shape — each item must be treated as a continuation.
    const result = parseMarkdown('1. apple\n\n1. banana\n\n1. cherry');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('list');
    if (result[0].type === 'list') {
      expect(result[0].ordered).toBe(true);
      expect(result[0].loose).toBe(true);
      expect(result[0].items).toHaveLength(3);
      expect(result[0].start).toBe(1);
    }
  });

  it('joins blank-line-separated unordered items into one loose list', () => {
    const result = parseMarkdown('- a\n\n- b\n\n- c');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('list');
    if (result[0].type === 'list') {
      expect(result[0].ordered).toBe(false);
      expect(result[0].loose).toBe(true);
      expect(result[0].items).toHaveLength(3);
    }
  });

  it('does not join lists of different styles across a blank line', () => {
    // Bulleted then numbered — these are two distinct lists.
    const result = parseMarkdown('- a\n\n1. b');
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('list');
    expect(result[1].type).toBe('list');
    if (result[0].type === 'list' && result[1].type === 'list') {
      expect(result[0].ordered).toBe(false);
      expect(result[1].ordered).toBe(true);
    }
  });

  it('treats a tight list with no blank lines as not loose', () => {
    const result = parseMarkdown('1. a\n2. b\n3. c');
    expect(result[0].type).toBe('list');
    if (result[0].type === 'list') {
      expect(result[0].loose).toBeUndefined();
    }
  });

  it('parses task lists', () => {
    const input = '- [ ] Unchecked\n- [x] Checked';
    const result = parseMarkdown(input);
    expect(result[0].type).toBe('list');
    if (result[0].type === 'list') {
      expect(result[0].items[0].checked).toBe(false);
      expect(result[0].items[1].checked).toBe(true);
    }
  });

  it('parses GFM tables', () => {
    const input = '| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |';
    const result = parseMarkdown(input);
    expect(result[0].type).toBe('table');
    if (result[0].type === 'table') {
      expect(result[0].headers).toHaveLength(2);
      expect(result[0].rows).toHaveLength(2);
    }
  });

  it('parses table alignment', () => {
    const input =
      '| Left | Center | Right |\n| :--- | :---: | ---: |\n| a | b | c |';
    const result = parseMarkdown(input);
    expect(result[0].type).toBe('table');
    if (result[0].type === 'table') {
      expect(result[0].alignments).toEqual(['left', 'center', 'right']);
    }
  });

  it('parses standalone images', () => {
    const result = parseMarkdown('![alt text](image.png)');
    expect(result[0].type).toBe('image');
    if (result[0].type === 'image') {
      expect(result[0].src).toBe('image.png');
      expect(result[0].alt).toBe('alt text');
    }
  });

  it('parses complex AI response', () => {
    const input = [
      '# Analysis',
      '',
      'Here is the result of the analysis.',
      '',
      '```typescript',
      'const result = analyze(data);',
      '```',
      '',
      '- Point one',
      '- Point two',
      '- Point three',
      '',
      '> Important note about the findings.',
      '',
      '| Metric | Value |',
      '| --- | --- |',
      '| Score | 95 |',
    ].join('\n');
    const result = parseMarkdown(input);
    const types = result.map(b => b.type);
    expect(types).toContain('heading');
    expect(types).toContain('paragraph');
    expect(types).toContain('codeblock');
    expect(types).toContain('list');
    expect(types).toContain('blockquote');
    expect(types).toContain('table');
  });

  // --- Nested lists ---

  it('parses nested unordered lists', () => {
    const input = '- Item 1\n  - Nested 1a\n  - Nested 1b\n- Item 2';
    const result = parseMarkdown(input);
    expect(result[0].type).toBe('list');
    if (result[0].type === 'list') {
      expect(result[0].items).toHaveLength(2);
      // Item 1 should have children that include a nested list
      const item1Children = result[0].items[0].children;
      const nestedList = item1Children.find(c => c.type === 'list');
      expect(nestedList).toBeDefined();
      if (nestedList?.type === 'list') {
        expect(nestedList.items).toHaveLength(2);
      }
    }
  });

  it('parses deeply nested lists', () => {
    const input = '- L1\n  - L2\n    - L3';
    const result = parseMarkdown(input);
    expect(result[0].type).toBe('list');
    if (result[0].type === 'list') {
      const item = result[0].items[0];
      const l2 = item.children.find(c => c.type === 'list');
      expect(l2).toBeDefined();
      if (l2?.type === 'list') {
        const l3 = l2.items[0].children.find(c => c.type === 'list');
        expect(l3).toBeDefined();
      }
    }
  });

  // --- Table without leading pipe ---

  it('parses table without leading pipe', () => {
    const input = 'Name | Age\n--- | ---\nAlice | 30\nBob | 25';
    const result = parseMarkdown(input);
    expect(result[0].type).toBe('table');
    if (result[0].type === 'table') {
      expect(result[0].headers).toHaveLength(2);
      expect(result[0].rows).toHaveLength(2);
    }
  });

  // --- Table with escaped pipes ---

  it('handles escaped pipes in table cells', () => {
    const input =
      '| Concept | TypeScript |\n| --- | --- |\n| Null safety | `T \\| null` |\n| Union | `A \\| B \\| C` |';
    const result = parseMarkdown(input);
    expect(result[0].type).toBe('table');
    if (result[0].type === 'table') {
      expect(result[0].headers).toHaveLength(2);
      expect(result[0].rows).toHaveLength(2);
      // The cell should contain the escaped pipe as inline content
      expect(result[0].rows[0]).toHaveLength(2);
      expect(result[0].rows[1]).toHaveLength(2);
    }
  });

  // --- HR variants ---

  it('parses spaced HR: - - -', () => {
    expect(parseMarkdown('- - -')[0].type).toBe('hr');
  });

  it('parses spaced HR: * * *', () => {
    expect(parseMarkdown('* * *')[0].type).toBe('hr');
  });

  it('parses spaced HR: _ _ _', () => {
    expect(parseMarkdown('_ _ _')[0].type).toBe('hr');
  });
});

// ---------------------------------------------------------------------------
// Citation parsing
// ---------------------------------------------------------------------------

describe('citation parsing', () => {
  const sourceIds = new Set(['abc1', 'def2', 'src3']);

  describe('bracket notation [id]', () => {
    it('parses a bracket citation when sourceId matches', () => {
      const result = parseInline('Tokyo is large[abc1].', sourceIds);
      expect(result).toEqual([
        {type: 'text', content: 'Tokyo is large'},
        {type: 'citation', sourceId: 'abc1'},
        {type: 'text', content: '.'},
      ]);
    });

    it('parses multiple bracket citations', () => {
      const result = parseInline('Fact[abc1][def2].', sourceIds);
      expect(result).toEqual([
        {type: 'text', content: 'Fact'},
        {type: 'citation', sourceId: 'abc1'},
        {type: 'citation', sourceId: 'def2'},
        {type: 'text', content: '.'},
      ]);
    });

    it('does NOT treat [id] as citation when id is not in sourceIds', () => {
      const result = parseInline('Use [PID] here.', sourceIds);
      expect(result.some(n => n.type === 'citation')).toBe(false);
    });

    it('does NOT treat [text](url) as citation', () => {
      const result = parseInline(
        '[click here](https://example.com)',
        sourceIds,
      );
      expect(result).toEqual([
        {
          type: 'link',
          href: 'https://example.com',
          children: [{type: 'text', content: 'click here'}],
        },
      ]);
    });

    it('handles citation next to link', () => {
      const result = parseInline(
        'See [link](https://example.com)[abc1].',
        sourceIds,
      );
      expect(result[0]).toEqual({type: 'text', content: 'See '});
      expect(result[1]).toEqual({
        type: 'link',
        href: 'https://example.com',
        children: [{type: 'text', content: 'link'}],
      });
      expect(result[2]).toEqual({type: 'citation', sourceId: 'abc1'});
    });

    it('ignores brackets when no sourceIds provided', () => {
      const result = parseInline('Text [abc1] here.');
      expect(result.some(n => n.type === 'citation')).toBe(false);
    });
  });

  describe('fullwidth bracket notation 【id】', () => {
    it('parses a fullwidth bracket citation', () => {
      const result = parseInline('Data【abc1】.', sourceIds);
      expect(result).toEqual([
        {type: 'text', content: 'Data'},
        {type: 'citation', sourceId: 'abc1'},
        {type: 'text', content: '.'},
      ]);
    });

    it('parses consecutive fullwidth citations', () => {
      const result = parseInline('Info【abc1】【def2】end.', sourceIds);
      expect(result).toEqual([
        {type: 'text', content: 'Info'},
        {type: 'citation', sourceId: 'abc1'},
        {type: 'citation', sourceId: 'def2'},
        {type: 'text', content: 'end.'},
      ]);
    });

    it('preserves fullwidth brackets when id is not in sourceIds', () => {
      const result = parseInline('Keep【hello world】.', sourceIds);
      expect(result.some(n => n.type === 'citation')).toBe(false);
    });
  });

  describe('mixed formats', () => {
    it('handles both bracket and fullwidth in same text', () => {
      const result = parseInline('A[abc1] B【def2】.', sourceIds);
      expect(result).toEqual([
        {type: 'text', content: 'A'},
        {type: 'citation', sourceId: 'abc1'},
        {type: 'text', content: ' B'},
        {type: 'citation', sourceId: 'def2'},
        {type: 'text', content: '.'},
      ]);
    });
  });

  describe('block-level threading', () => {
    it('detects citations inside paragraphs', () => {
      const blocks = parseMarkdown('Tokyo is big[abc1].', sourceIds);
      expect(blocks).toHaveLength(1);
      if (blocks[0].type === 'paragraph') {
        expect(blocks[0].children.some(n => n.type === 'citation')).toBe(true);
      }
    });

    it('detects citations inside list items', () => {
      const blocks = parseMarkdown('- Item[abc1]\n- Item[def2]', sourceIds);
      expect(blocks).toHaveLength(1);
      if (blocks[0].type === 'list') {
        const firstItem = blocks[0].items[0].children[0];
        if (firstItem.type === 'paragraph') {
          expect(firstItem.children.some(n => n.type === 'citation')).toBe(
            true,
          );
        }
      }
    });

    it('detects citations inside table cells', () => {
      const md = '| A | B |\n|---|---|\n| data[abc1] | ok |';
      const blocks = parseMarkdown(md, sourceIds);
      expect(blocks).toHaveLength(1);
      if (blocks[0].type === 'table') {
        expect(
          blocks[0].rows[0][0].children.some(n => n.type === 'citation'),
        ).toBe(true);
      }
    });
  });

  describe('autolink (gfm)', () => {
    it('is opt-in: bare URLs stay literal by default', () => {
      const result = parseInline('see https://example.com for info');
      expect(result).toEqual([
        {type: 'text', content: 'see https://example.com for info'},
      ]);
    });

    it('links a bare https URL when enabled', () => {
      const result = parseInline('see https://example.com for info', {
        autolink: 'gfm',
      });
      expect(result).toEqual([
        {type: 'text', content: 'see '},
        {
          type: 'link',
          href: 'https://example.com',
          children: [{type: 'text', content: 'https://example.com'}],
        },
        {type: 'text', content: ' for info'},
      ]);
    });

    it('links a bare http URL', () => {
      const result = parseInline('go to http://example.com', {
        autolink: 'gfm',
      });
      expect(result[1]).toEqual({
        type: 'link',
        href: 'http://example.com',
        children: [{type: 'text', content: 'http://example.com'}],
      });
    });

    it('links a bare www. URL with http:// prefix on href', () => {
      const result = parseInline('go www.example.com', {autolink: 'gfm'});
      expect(result[1]).toEqual({
        type: 'link',
        href: 'http://www.example.com',
        children: [{type: 'text', content: 'www.example.com'}],
      });
    });

    it('links a bare email', () => {
      const result = parseInline('ping user@example.com please', {
        autolink: 'gfm',
      });
      expect(result[1]).toEqual({
        type: 'link',
        href: 'mailto:user@example.com',
        children: [{type: 'text', content: 'user@example.com'}],
      });
    });

    it('allows + and % in the email local part', () => {
      const result = parseInline('mail user+tag%suffix@example.com here', {
        autolink: 'gfm',
      });
      expect(result[1].type).toBe('link');
      if (result[1].type === 'link') {
        expect(result[1].href).toBe('mailto:user+tag%suffix@example.com');
      }
    });

    it('parses <scheme:url> angle-bracket autolinks', () => {
      const result = parseInline('see <https://example.com> ok', {
        autolink: 'gfm',
      });
      expect(result[1]).toEqual({
        type: 'link',
        href: 'https://example.com',
        children: [{type: 'text', content: 'https://example.com'}],
      });
    });

    it('parses <email> angle-bracket autolinks', () => {
      const result = parseInline('mail <user@example.com> please', {
        autolink: 'gfm',
      });
      expect(result[1]).toEqual({
        type: 'link',
        href: 'mailto:user@example.com',
        children: [{type: 'text', content: 'user@example.com'}],
      });
    });

    it('peels trailing sentence punctuation off bare URLs', () => {
      const result = parseInline('see https://example.com.', {
        autolink: 'gfm',
      });
      expect(result).toEqual([
        {type: 'text', content: 'see '},
        {
          type: 'link',
          href: 'https://example.com',
          children: [{type: 'text', content: 'https://example.com'}],
        },
        {type: 'text', content: '.'},
      ]);
    });

    it('peels unbalanced trailing close-parens', () => {
      const result = parseInline('(see https://example.com/foo) here', {
        autolink: 'gfm',
      });
      expect(result).toEqual([
        {type: 'text', content: '(see '},
        {
          type: 'link',
          href: 'https://example.com/foo',
          children: [{type: 'text', content: 'https://example.com/foo'}],
        },
        {type: 'text', content: ') here'},
      ]);
    });

    it('keeps balanced parens inside the URL', () => {
      const result = parseInline('go https://example.com/Foo_(bar) ok', {
        autolink: 'gfm',
      });
      expect(result[1]).toEqual({
        type: 'link',
        href: 'https://example.com/Foo_(bar)',
        children: [{type: 'text', content: 'https://example.com/Foo_(bar)'}],
      });
    });

    it('peels multiple trailing punctuation chars in one pass', () => {
      const result = parseInline('see https://example.com?!.', {
        autolink: 'gfm',
      });
      expect(result).toEqual([
        {type: 'text', content: 'see '},
        {
          type: 'link',
          href: 'https://example.com',
          children: [{type: 'text', content: 'https://example.com'}],
        },
        {type: 'text', content: '?!.'},
      ]);
    });

    it('peels interleaved punct and unbalanced parens', () => {
      const result = parseInline('(https://example.com/path).', {
        autolink: 'gfm',
      });
      expect(result).toEqual([
        {type: 'text', content: '('},
        {
          type: 'link',
          href: 'https://example.com/path',
          children: [{type: 'text', content: 'https://example.com/path'}],
        },
        {type: 'text', content: ').'},
      ]);
    });

    it('peels all trailing punctuation leaving only scheme', () => {
      // "https://..." peels the dots, leaving "https://" as the href.
      // This is a degenerate case but not rejected — the PR intentionally
      // does not validate TLDs or path content.
      const result = parseInline('see https://...', {
        autolink: 'gfm',
      });
      const link = result.find(n => n.type === 'link');
      expect(link).toBeDefined();
      if (link && link.type === 'link') {
        expect(link.href).toBe('https://');
      }
    });

    it('does not autolink URLs inside inline code', () => {
      const result = parseInline('try `https://example.com` here', {
        autolink: 'gfm',
      });
      expect(result).toEqual([
        {type: 'text', content: 'try '},
        {type: 'code', content: 'https://example.com'},
        {type: 'text', content: ' here'},
      ]);
    });

    it('does not nest links: skips URLs inside an existing link', () => {
      const result = parseInline(
        '[my site https://other.com](https://example.com)',
        {autolink: 'gfm'},
      );
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('link');
      if (result[0].type === 'link') {
        expect(result[0].href).toBe('https://example.com');
        // The label still has the URL as plain text, not a nested link.
        expect(result[0].children).toEqual([
          {type: 'text', content: 'my site https://other.com'},
        ]);
      }
    });

    it('does not autolink the destination of a markdown link', () => {
      const result = parseInline('see [docs](https://example.com)', {
        autolink: 'gfm',
      });
      expect(result).toHaveLength(2);
      expect(result[1].type).toBe('link');
      if (result[1].type === 'link') {
        expect(result[1].href).toBe('https://example.com');
      }
    });

    it('autolinks inside emphasis containers', () => {
      const result = parseInline('see **https://example.com** ok', {
        autolink: 'gfm',
      });
      expect(result[1].type).toBe('bold');
      if (result[1].type === 'bold') {
        expect(result[1].children).toEqual([
          {
            type: 'link',
            href: 'https://example.com',
            children: [{type: 'text', content: 'https://example.com'}],
          },
        ]);
      }
    });

    it('does not match when preceded by an alphanumeric char', () => {
      const result = parseInline('xhttps://example.com', {autolink: 'gfm'});
      expect(result).toEqual([{type: 'text', content: 'xhttps://example.com'}]);
    });

    it('handles multiple autolinks in one block', () => {
      const result = parseInline(
        'see https://a.com or https://b.com or me@x.com',
        {autolink: 'gfm'},
      );
      const linkHrefs = result
        .filter(n => n.type === 'link')
        .map(n => (n.type === 'link' ? n.href : ''));
      expect(linkHrefs).toEqual([
        'https://a.com',
        'https://b.com',
        'mailto:me@x.com',
      ]);
    });

    it('does not autolink inside fenced code blocks', () => {
      const md = '```\nhttps://example.com\n```';
      const blocks = parseMarkdown(md, {autolink: 'gfm'});
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toEqual({
        type: 'codeblock',
        language: 'plaintext',
        content: 'https://example.com',
      });
    });

    it('passes through parseMarkdown for headings and paragraphs', () => {
      const md = '# https://heading.com\n\nsee https://para.com here';
      const blocks = parseMarkdown(md, {autolink: 'gfm'});
      expect(blocks).toHaveLength(2);
      if (blocks[0].type === 'heading') {
        expect(blocks[0].children[0]).toEqual({
          type: 'link',
          href: 'https://heading.com',
          children: [{type: 'text', content: 'https://heading.com'}],
        });
      }
      if (blocks[1].type === 'paragraph') {
        expect(blocks[1].children.some(n => n.type === 'link')).toBe(true);
      }
    });

    it('still accepts ReadonlySet<string> sourceIds via legacy signature', () => {
      // Default behavior — no autolink, sourceIds passed positionally
      const sources = new Set(['abc1']);
      const result = parseInline('see [abc1] for https://example.com', sources);
      expect(result.some(n => n.type === 'citation')).toBe(true);
      // Bare URL remains literal text because autolink is unset
      const url = 'https://example.com';
      expect(
        result.some(
          n => n.type === 'text' && n.content.includes(url), // lgtm[js/incomplete-url-substring-sanitization]
        ),
      ).toBe(true);
    });

    it('combines sourceIds + autolink in the options bag', () => {
      const sources = new Set(['abc1']);
      const result = parseInline('see [abc1] for https://example.com', {
        sourceIds: sources,
        autolink: 'gfm',
      });
      expect(result.some(n => n.type === 'citation')).toBe(true);
      expect(result.some(n => n.type === 'link')).toBe(true);
    });
  });
});
