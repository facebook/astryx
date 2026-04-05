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
});
