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
      expect(result[0].children[0]).toEqual({type: 'text', content: 'bold text'});
    }
  });

  it('parses italic with *', () => {
    const result = parseInline('*italic text*');
    expect(result[0].type).toBe('italic');
    if (result[0].type === 'italic') {
      expect(result[0].children[0]).toEqual({type: 'text', content: 'italic text'});
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
    const result = parseInline('Hello **bold** and *italic* with `code` and [link](url)');
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
        expect(result[0].children[0].children[0]).toEqual({type: 'text', content: 'bold italic'});
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
    const input = '| Left | Center | Right |\n| :--- | :---: | ---: |\n| a | b | c |';
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
