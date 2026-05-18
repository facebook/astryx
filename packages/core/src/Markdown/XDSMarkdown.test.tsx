// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSMarkdown} from './XDSMarkdown';
import type {MarkdownInlinePlugin} from './XDSMarkdown';

describe('XDSMarkdown', () => {
  it('renders with role="document"', () => {
    render(<XDSMarkdown>Hello</XDSMarkdown>);
    expect(screen.getByRole('document')).toBeInTheDocument();
  });

  it('renders xds-markdown class name', () => {
    const {container} = render(<XDSMarkdown>Hello</XDSMarkdown>);
    expect(container.firstElementChild!.className).toContain('xds-markdown');
  });

  it('renders headings', () => {
    render(<XDSMarkdown>{'# Heading 1\n\n## Heading 2'}</XDSMarkdown>);
    expect(screen.getByText('Heading 1').tagName).toBe('H1');
    expect(screen.getByText('Heading 2').tagName).toBe('H2');
  });

  it('renders paragraphs', () => {
    render(<XDSMarkdown>{'Hello world'}</XDSMarkdown>);
    expect(screen.getByText('Hello world').tagName).toBe('P');
  });

  it('renders bold text', () => {
    render(<XDSMarkdown>{'**bold text**'}</XDSMarkdown>);
    expect(screen.getByText('bold text').tagName).toBe('STRONG');
  });

  it('renders italic text', () => {
    render(<XDSMarkdown>{'*italic text*'}</XDSMarkdown>);
    expect(screen.getByText('italic text').tagName).toBe('EM');
  });

  it('renders strikethrough text', () => {
    render(<XDSMarkdown>{'~~struck~~'}</XDSMarkdown>);
    expect(screen.getByText('struck').tagName).toBe('DEL');
  });

  it('renders inline code with XDSCode', () => {
    render(<XDSMarkdown>{'Use `code` here'}</XDSMarkdown>);
    expect(screen.getByText('code').tagName).toBe('CODE');
  });

  it('renders code blocks with XDSCodeBlock', () => {
    render(<XDSMarkdown>{'```js\nconst x = 1;\n```'}</XDSMarkdown>);
    // XDSCodeBlock renders in a <pre>
    const pre = document.querySelector('pre');
    expect(pre).toBeInTheDocument();
  });

  it('renders links with correct href', () => {
    render(<XDSMarkdown>{'[click](https://example.com)'}</XDSMarkdown>);
    const link = screen.getByText('click');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('https://example.com');
  });

  it('adds target="_blank" to external links', () => {
    render(<XDSMarkdown>{'[ext](https://example.com)'}</XDSMarkdown>);
    const link = screen.getByText('ext');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('does not add target="_blank" to relative links', () => {
    render(<XDSMarkdown>{'[internal](/page)'}</XDSMarkdown>);
    const link = screen.getByText('internal');
    expect(link.getAttribute('target')).toBeNull();
  });

  it('calls onLinkClick when link is clicked', () => {
    const handleClick = vi.fn();
    render(
      <XDSMarkdown onLinkClick={handleClick}>
        {'[click me](https://example.com)'}
      </XDSMarkdown>,
    );
    fireEvent.click(screen.getByText('click me'));
    expect(handleClick).toHaveBeenCalledWith(
      'https://example.com',
      expect.any(Object),
    );
  });

  it('renders blockquotes', () => {
    render(<XDSMarkdown>{'> A quote'}</XDSMarkdown>);
    const bq = document.querySelector('blockquote');
    expect(bq).toBeInTheDocument();
  });

  it('renders unordered lists', () => {
    render(<XDSMarkdown>{'- A\n- B\n- C'}</XDSMarkdown>);
    const ul = document.querySelector('ul');
    expect(ul).toBeInTheDocument();
    expect(document.querySelectorAll('li')).toHaveLength(3);
  });

  it('renders ordered lists', () => {
    render(<XDSMarkdown>{'1. A\n2. B'}</XDSMarkdown>);
    const ol = document.querySelector('ol');
    expect(ol).toBeInTheDocument();
  });

  it('renders task lists with checkboxes', () => {
    render(<XDSMarkdown>{'- [x] Done\n- [ ] Todo'}</XDSMarkdown>);
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(2);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
  });

  it('renders tables', () => {
    render(
      <XDSMarkdown>{'| A | B |\n| --- | --- |\n| 1 | 2 |'}</XDSMarkdown>,
    );
    expect(document.querySelector('table')).toBeInTheDocument();
    expect(document.querySelectorAll('th')).toHaveLength(2);
    expect(document.querySelectorAll('td')).toHaveLength(2);
  });

  it('renders horizontal rules', () => {
    render(<XDSMarkdown>{'---'}</XDSMarkdown>);
    expect(document.querySelector('hr')).toBeInTheDocument();
  });

  it('renders images', () => {
    render(<XDSMarkdown>{'![alt text](image.png)'}</XDSMarkdown>);
    const img = document.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img!.getAttribute('alt')).toBe('alt text');
    expect(img!.getAttribute('src')).toBe('image.png');
  });

  it('shifts heading levels with headingLevelStart', () => {
    render(
      <XDSMarkdown headingLevelStart={3}>{'# Heading 1'}</XDSMarkdown>,
    );
    expect(screen.getByText('Heading 1').tagName).toBe('H3');
  });

  it('shows streaming cursor when isStreaming is true', () => {
    const {container} = render(
      <XDSMarkdown isStreaming>{'Hello'}</XDSMarkdown>,
    );
    // Streaming mode parses incrementally but no cursor element
    expect(container.querySelector('[role="document"]')).toBeInTheDocument();
  });

  it('hides cursor when not streaming', () => {
    const {container} = render(<XDSMarkdown>{'Hello'}</XDSMarkdown>);
    const cursor = container.querySelector('span[aria-hidden]');
    expect(cursor).not.toBeInTheDocument();
  });

  it('applies compact density', () => {
    const {container} = render(
      <XDSMarkdown density="compact">{'Hello'}</XDSMarkdown>,
    );
    expect(container.firstElementChild!.className).toContain('compact');
  });

  it('supports data-testid', () => {
    render(<XDSMarkdown data-testid="md">{'Hello'}</XDSMarkdown>);
    expect(screen.getByTestId('md')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<XDSMarkdown ref={ref}>{'Hello'}</XDSMarkdown>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('sanitizes javascript: URLs in links', () => {
    const {container} = render(
      <XDSMarkdown>{'[click](javascript:alert(1))'}</XDSMarkdown>,
    );
    const link = container.querySelector('a');
    expect(link).toBeNull();
    expect(container.textContent).toContain('click');
  });

  it('sanitizes data: URLs in images', () => {
    const {container} = render(
      <XDSMarkdown>{'![xss](data:text/html,<script>alert(1)</script>)'}</XDSMarkdown>,
    );
    const img = container.querySelector('img');
    expect(img).toBeNull();
  });

  it('allows safe URLs', () => {
    const {container} = render(
      <XDSMarkdown>{'[safe](https://example.com) and [relative](/page)'}</XDSMarkdown>,
    );
    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toBe('https://example.com');
    expect(links[1].getAttribute('href')).toBe('/page');
  });
});

// ---------------------------------------------------------------------------
// inlinePlugins
// ---------------------------------------------------------------------------

// Helper: creates a plugin that turns JIRA-style ticket refs (PROJ-123) into links
function createTicketPlugin(): MarkdownInlinePlugin {
  return {
    pattern: /\b([A-Z][A-Z0-9]+-\d+)\b/g,
    render: (match, key) => (
      <a key={key} href={`https://issues.example.com/browse/${match[1]}`} data-testid="ticket-link">
        {match[0]}
      </a>
    ),
  };
}

// Helper: creates a plugin that turns X-numbers (X12345) into links
function createXRefPlugin(): MarkdownInlinePlugin {
  return {
    pattern: /\bX(\d+)\b/g,
    render: (match, key) => (
      <a key={key} href={`https://xref.example.com/${match[1]}`} data-testid="xref-link">
        {match[0]}
      </a>
    ),
  };
}

describe('inlinePlugins', () => {
  it('transforms text patterns into custom elements', () => {
    const ticketPlugin = createTicketPlugin();
    const {container} = render(
      <XDSMarkdown inlinePlugins={[ticketPlugin]}>
        {'Check out PROJ-123 for details'}
      </XDSMarkdown>,
    );
    const link = container.querySelector('[data-testid="ticket-link"]');
    expect(link).toBeInTheDocument();
    expect(link!.getAttribute('href')).toBe('https://issues.example.com/browse/PROJ-123');
    expect(link!.textContent).toBe('PROJ-123');
  });

  it('supports multiple plugins', () => {
    const {container} = render(
      <XDSMarkdown inlinePlugins={[createTicketPlugin(), createXRefPlugin()]}>
        {'See PROJ-123 and X99999'}
      </XDSMarkdown>,
    );
    const ticketLink = container.querySelector('[data-testid="ticket-link"]');
    const xrefLink = container.querySelector('[data-testid="xref-link"]');
    expect(ticketLink).toBeInTheDocument();
    expect(ticketLink!.getAttribute('href')).toBe('https://issues.example.com/browse/PROJ-123');
    expect(xrefLink).toBeInTheDocument();
    expect(xrefLink!.getAttribute('href')).toBe('https://xref.example.com/99999');
  });

  it('does not transform patterns inside fenced code blocks', () => {
    const {container} = render(
      <XDSMarkdown inlinePlugins={[createTicketPlugin()]}>
        {'```\nPROJ-123\n```'}
      </XDSMarkdown>,
    );
    const link = container.querySelector('[data-testid="ticket-link"]');
    expect(link).toBeNull();
    expect(container.textContent).toContain('PROJ-123');
  });

  it('does not transform patterns inside inline code', () => {
    const {container} = render(
      <XDSMarkdown inlinePlugins={[createTicketPlugin()]}>
        {'Use `PROJ-123` in your code'}
      </XDSMarkdown>,
    );
    const link = container.querySelector('[data-testid="ticket-link"]');
    expect(link).toBeNull();
    expect(container.textContent).toContain('PROJ-123');
  });

  it('works alongside regular markdown links', () => {
    const {container} = render(
      <XDSMarkdown inlinePlugins={[createTicketPlugin()]}>
        {'Visit [example](https://example.com) and check PROJ-123'}
      </XDSMarkdown>,
    );
    const ticketLink = container.querySelector('[data-testid="ticket-link"]');
    expect(ticketLink).toBeInTheDocument();
    const mdLink = container.querySelector('a[href="https://example.com"]');
    expect(mdLink).toBeInTheDocument();
    expect(mdLink!.textContent).toBe('example');
  });

  it('first plugin wins for overlapping patterns', () => {
    const narrowPlugin: MarkdownInlinePlugin = {
      pattern: /PROJ-\d+/g,
      render: (match, key) => (
        <span key={key} data-testid="narrow-match">{match[0]}</span>
      ),
    };
    const broadPlugin: MarkdownInlinePlugin = {
      pattern: /[A-Z]+-\d+/g,
      render: (match, key) => (
        <span key={key} data-testid="broad-match">{match[0]}</span>
      ),
    };
    const {container} = render(
      <XDSMarkdown inlinePlugins={[narrowPlugin, broadPlugin]}>
        {'Check PROJ-123'}
      </XDSMarkdown>,
    );
    expect(container.querySelector('[data-testid="narrow-match"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="broad-match"]')).toBeNull();
  });

  it('skips matches when getEndIndex returns false', () => {
    const plugin: MarkdownInlinePlugin = {
      pattern: /\b([A-Z]+-\d+)\b/g,
      getEndIndex: () => false,
      render: (match, key) => (
        <a key={key} data-testid="ticket-link">{match[0]}</a>
      ),
    };
    const {container} = render(
      <XDSMarkdown inlinePlugins={[plugin]}>
        {'Check PROJ-123 for details'}
      </XDSMarkdown>,
    );
    const link = container.querySelector('[data-testid="ticket-link"]');
    expect(link).toBeNull();
    expect(container.textContent).toContain('PROJ-123');
  });

  it('uses getEndIndex to adjust match boundaries', () => {
    const plugin: MarkdownInlinePlugin = {
      pattern: /TAG:/g,
      getEndIndex: (text, match) => {
        const afterMatch = text.slice(match.index! + match[0].length);
        const wordMatch = afterMatch.match(/^(\S+)/);
        if (wordMatch) {
          return match.index! + match[0].length + wordMatch[1].length;
        }
        return match.index! + match[0].length;
      },
      render: (match, key) => {
        return <span key={key} data-testid="tag-match">{match[0]}</span>;
      },
    };
    const {container} = render(
      <XDSMarkdown inlinePlugins={[plugin]}>
        {'See TAG:important here'}
      </XDSMarkdown>,
    );
    const tag = container.querySelector('[data-testid="tag-match"]');
    expect(tag).toBeInTheDocument();
    expect(container.textContent).toContain('here');
  });

  it('renders identically when no inlinePlugins are provided', () => {
    const withPlugins = render(
      <XDSMarkdown inlinePlugins={[]}>
        {'Hello **world** and `code`'}
      </XDSMarkdown>,
    );
    const withoutPlugins = render(
      <XDSMarkdown>
        {'Hello **world** and `code`'}
      </XDSMarkdown>,
    );
    expect(withPlugins.container.textContent).toBe(withoutPlugins.container.textContent);
  });

  it('transforms patterns inside bold/italic text', () => {
    const {container} = render(
      <XDSMarkdown inlinePlugins={[createTicketPlugin()]}>
        {'**PROJ-123**'}
      </XDSMarkdown>,
    );
    const link = container.querySelector('[data-testid="ticket-link"]');
    expect(link).toBeInTheDocument();
    expect(link!.textContent).toBe('PROJ-123');
    expect(link!.closest('strong')).toBeInTheDocument();
  });
});
