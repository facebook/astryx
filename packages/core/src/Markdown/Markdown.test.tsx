// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {Markdown} from './Markdown';
import type {MarkdownInlinePlugin} from './Markdown';

describe('Markdown', () => {
  it('renders with role="document"', () => {
    render(<Markdown>Hello</Markdown>);
    expect(screen.getByRole('document')).toBeInTheDocument();
  });

  it('renders astryx-markdown class name', () => {
    const {container} = render(<Markdown>Hello</Markdown>);
    expect(container.firstElementChild!.className).toContain('astryx-markdown');
  });

  it('renders headings', () => {
    render(<Markdown>{'# Heading 1\n\n## Heading 2'}</Markdown>);
    expect(screen.getByText('Heading 1').tagName).toBe('H1');
    expect(screen.getByText('Heading 2').tagName).toBe('H2');
  });

  it('renders paragraphs as block <div> (never <p>) for composition safety', () => {
    render(<Markdown>{'Hello world'}</Markdown>);
    // Markdown paragraphs render as <div> so block-level inline content
    // (images, custom inline components) never trips the phrasing-content
    // trap that a <p> would impose. role="paragraph" re-exposes the paragraph
    // role to assistive tech without the <p> hazard. Consumers who want a real
    // <p> element can pass `components={{paragraph: 'p'}}`.
    const para = screen.getByText('Hello world');
    expect(para.tagName).toBe('DIV');
    expect(para).toHaveAttribute('role', 'paragraph');
  });

  it('renders inline display without block wrappers', () => {
    const {container} = render(
      <Markdown display="inline">{'Use `code` and **bold**'}</Markdown>,
    );

    expect(container.firstElementChild?.tagName).toBe('SPAN');
    expect(screen.queryByRole('document')).not.toBeInTheDocument();
    expect(container.querySelector('p')).toBeNull();
    expect(screen.getByText('code').tagName).toBe('CODE');
    expect(screen.getByText('bold').tagName).toBe('STRONG');
  });

  it('renders links with inline display', () => {
    render(<Markdown display="inline">{'[docs](/docs)'}</Markdown>);

    const link = screen.getByText('docs');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/docs');
  });

  it('renders bold text', () => {
    render(<Markdown>{'**bold text**'}</Markdown>);
    expect(screen.getByText('bold text').tagName).toBe('STRONG');
  });

  it('renders italic text', () => {
    render(<Markdown>{'*italic text*'}</Markdown>);
    expect(screen.getByText('italic text').tagName).toBe('EM');
  });

  it('renders strikethrough text', () => {
    render(<Markdown>{'~~struck~~'}</Markdown>);
    expect(screen.getByText('struck').tagName).toBe('DEL');
  });

  it('renders inline code with Code', () => {
    render(<Markdown>{'Use `code` here'}</Markdown>);
    expect(screen.getByText('code').tagName).toBe('CODE');
  });

  it('renders code blocks with CodeBlock', () => {
    render(<Markdown>{'```js\nconst x = 1;\n```'}</Markdown>);
    // CodeBlock renders in a <pre>
    const pre = document.querySelector('pre');
    expect(pre).toBeInTheDocument();
  });

  it('renders links with correct href', () => {
    render(<Markdown>{'[click](https://example.com)'}</Markdown>);
    const link = screen.getByText('click');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('https://example.com');
  });

  it('adds target="_blank" to external links', () => {
    render(<Markdown>{'[ext](https://example.com)'}</Markdown>);
    const link = screen.getByText('ext');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('does not add target="_blank" to relative links', () => {
    render(<Markdown>{'[internal](/page)'}</Markdown>);
    const link = screen.getByText('internal');
    expect(link.getAttribute('target')).toBeNull();
  });

  it('calls onLinkClick when link is clicked', () => {
    const handleClick = vi.fn();
    render(
      <Markdown onLinkClick={handleClick}>
        {'[click me](https://example.com)'}
      </Markdown>,
    );
    fireEvent.click(screen.getByText('click me'));
    expect(handleClick).toHaveBeenCalledWith(
      'https://example.com',
      expect.any(Object),
    );
  });

  it('renders blockquotes', () => {
    render(<Markdown>{'> A quote'}</Markdown>);
    const bq = document.querySelector('blockquote');
    expect(bq).toBeInTheDocument();
  });

  it('renders unordered lists', () => {
    render(<Markdown>{'- A\n- B\n- C'}</Markdown>);
    const ul = document.querySelector('ul');
    expect(ul).toBeInTheDocument();
    expect(document.querySelectorAll('li')).toHaveLength(3);
  });

  it('renders ordered lists', () => {
    render(<Markdown>{'1. A\n2. B'}</Markdown>);
    const ol = document.querySelector('ol');
    expect(ol).toBeInTheDocument();
  });

  it('renders ordered list items as direct children of ol (no span wrapper)', () => {
    render(<Markdown>{'1. First\n2. Second\n3. Third'}</Markdown>);
    const ol = document.querySelector('ol')!;
    const directChildren = Array.from(ol.children);
    // All direct children should be <li> elements — no <span> wrappers
    expect(directChildren.every(c => c.tagName === 'LI')).toBe(true);
    expect(directChildren).toHaveLength(3);
  });

  it('applies counter-increment class to ordered list items', () => {
    render(<Markdown>{'1. First\n2. Second\n3. Third'}</Markdown>);
    const ol = document.querySelector('ol')!;
    const lis = ol.querySelectorAll('li');
    // Each li should have the counter-increment class
    lis.forEach(li => {
      expect(li.className).toContain('withCounter');
    });
  });

  it('applies counter-reset class to ordered list container', () => {
    render(<Markdown>{'1. First\n2. Second'}</Markdown>);
    const ol = document.querySelector('ol')!;
    expect(ol.className).toContain('withCounter');
  });

  it('joins blank-line-separated 1./1./1. into a single ordered list', () => {
    // Regression: LLM-style loose ordered lists (1.\n\n1.\n\n1.) used to
    // render as three separate <ol>s each restarting at 1.
    render(<Markdown>{'1. apple\n\n1. banana\n\n1. cherry'}</Markdown>);
    const ols = document.querySelectorAll('ol');
    expect(ols).toHaveLength(1);
    expect(ols[0].querySelectorAll('li')).toHaveLength(3);
  });

  it('forwards a non-default start onto the <ol> element', () => {
    render(<Markdown>{'5. five\n6. six\n7. seven'}</Markdown>);
    const ol = document.querySelector('ol')!;
    expect(ol.getAttribute('start')).toBe('5');
  });

  it('renders task lists with checkboxes', () => {
    render(<Markdown>{'- [x] Done\n- [ ] Todo'}</Markdown>);
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(2);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
  });

  it('renders tables', () => {
    render(<Markdown>{'| A | B |\n| --- | --- |\n| 1 | 2 |'}</Markdown>);
    expect(document.querySelector('table')).toBeInTheDocument();
    expect(document.querySelectorAll('th')).toHaveLength(2);
    expect(document.querySelectorAll('td')).toHaveLength(2);
  });

  it('renders horizontal rules', () => {
    render(<Markdown>{'---'}</Markdown>);
    expect(document.querySelector('hr')).toBeInTheDocument();
  });

  it('renders images', () => {
    render(<Markdown>{'![alt text](image.png)'}</Markdown>);
    const img = document.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img!.getAttribute('alt')).toBe('alt text');
    expect(img!.getAttribute('src')).toBe('image.png');
  });

  it('shifts heading levels with headingLevelStart', () => {
    render(<Markdown headingLevelStart={3}>{'# Heading 1'}</Markdown>);
    expect(screen.getByText('Heading 1').tagName).toBe('H3');
  });

  it('shows streaming cursor when isStreaming is true', () => {
    const {container} = render(<Markdown isStreaming>{'Hello'}</Markdown>);
    // Streaming mode parses incrementally but no cursor element
    expect(container.querySelector('[role="document"]')).toBeInTheDocument();
  });

  it('hides cursor when not streaming', () => {
    const {container} = render(<Markdown>{'Hello'}</Markdown>);
    const cursor = container.querySelector('span[aria-hidden]');
    expect(cursor).not.toBeInTheDocument();
  });

  it('applies compact density', () => {
    const {container} = render(
      <Markdown density="compact">{'Hello'}</Markdown>,
    );
    expect(container.firstElementChild!.className).toContain('compact');
  });

  it('supports data-testid', () => {
    render(<Markdown data-testid="md">{'Hello'}</Markdown>);
    expect(screen.getByTestId('md')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<Markdown ref={ref}>{'Hello'}</Markdown>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('sanitizes javascript: URLs in links', () => {
    const {container} = render(
      <Markdown>{'[click](javascript:alert(1))'}</Markdown>,
    );
    const link = container.querySelector('a');
    expect(link).toBeNull();
    expect(container.textContent).toContain('click');
  });

  it('sanitizes data: URLs in images', () => {
    const {container} = render(
      <Markdown>{'![xss](data:text/html,<script>alert(1)</script>)'}</Markdown>,
    );
    const img = container.querySelector('img');
    expect(img).toBeNull();
  });

  it('allows safe URLs', () => {
    const {container} = render(
      <Markdown>
        {'[safe](https://example.com) and [relative](/page)'}
      </Markdown>,
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
      <a
        key={key}
        href={`https://issues.example.com/browse/${match[1]}`}
        data-testid="ticket-link">
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
      <a
        key={key}
        href={`https://xref.example.com/${match[1]}`}
        data-testid="xref-link">
        {match[0]}
      </a>
    ),
  };
}

describe('inlinePlugins', () => {
  it('transforms text patterns into custom elements', () => {
    const ticketPlugin = createTicketPlugin();
    const {container} = render(
      <Markdown inlinePlugins={[ticketPlugin]}>
        {'Check out PROJ-123 for details'}
      </Markdown>,
    );
    const link = container.querySelector('[data-testid="ticket-link"]');
    expect(link).toBeInTheDocument();
    expect(link!.getAttribute('href')).toBe(
      'https://issues.example.com/browse/PROJ-123',
    );
    expect(link!.textContent).toBe('PROJ-123');
  });

  it('supports multiple plugins', () => {
    const {container} = render(
      <Markdown inlinePlugins={[createTicketPlugin(), createXRefPlugin()]}>
        {'See PROJ-123 and X99999'}
      </Markdown>,
    );
    const ticketLink = container.querySelector('[data-testid="ticket-link"]');
    const xrefLink = container.querySelector('[data-testid="xref-link"]');
    expect(ticketLink).toBeInTheDocument();
    expect(ticketLink!.getAttribute('href')).toBe(
      'https://issues.example.com/browse/PROJ-123',
    );
    expect(xrefLink).toBeInTheDocument();
    expect(xrefLink!.getAttribute('href')).toBe(
      'https://xref.example.com/99999',
    );
  });

  it('does not transform patterns inside fenced code blocks', () => {
    const {container} = render(
      <Markdown inlinePlugins={[createTicketPlugin()]}>
        {'```\nPROJ-123\n```'}
      </Markdown>,
    );
    const link = container.querySelector('[data-testid="ticket-link"]');
    expect(link).toBeNull();
    expect(container.textContent).toContain('PROJ-123');
  });

  it('does not transform patterns inside inline code', () => {
    const {container} = render(
      <Markdown inlinePlugins={[createTicketPlugin()]}>
        {'Use `PROJ-123` in your code'}
      </Markdown>,
    );
    const link = container.querySelector('[data-testid="ticket-link"]');
    expect(link).toBeNull();
    expect(container.textContent).toContain('PROJ-123');
  });

  it('works alongside regular markdown links', () => {
    const {container} = render(
      <Markdown inlinePlugins={[createTicketPlugin()]}>
        {'Visit [example](https://example.com) and check PROJ-123'}
      </Markdown>,
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
        <span key={key} data-testid="narrow-match">
          {match[0]}
        </span>
      ),
    };
    const broadPlugin: MarkdownInlinePlugin = {
      pattern: /[A-Z]+-\d+/g,
      render: (match, key) => (
        <span key={key} data-testid="broad-match">
          {match[0]}
        </span>
      ),
    };
    const {container} = render(
      <Markdown inlinePlugins={[narrowPlugin, broadPlugin]}>
        {'Check PROJ-123'}
      </Markdown>,
    );
    expect(
      container.querySelector('[data-testid="narrow-match"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('[data-testid="broad-match"]')).toBeNull();
  });

  it('skips matches when getEndIndex returns false', () => {
    const plugin: MarkdownInlinePlugin = {
      pattern: /\b([A-Z]+-\d+)\b/g,
      getEndIndex: () => false,
      render: (match, key) => (
        <a key={key} data-testid="ticket-link">
          {match[0]}
        </a>
      ),
    };
    const {container} = render(
      <Markdown inlinePlugins={[plugin]}>
        {'Check PROJ-123 for details'}
      </Markdown>,
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
        return (
          <span key={key} data-testid="tag-match">
            {match[0]}
          </span>
        );
      },
    };
    const {container} = render(
      <Markdown inlinePlugins={[plugin]}>{'See TAG:important here'}</Markdown>,
    );
    const tag = container.querySelector('[data-testid="tag-match"]');
    expect(tag).toBeInTheDocument();
    expect(container.textContent).toContain('here');
  });

  it('renders identically when no inlinePlugins are provided', () => {
    const withPlugins = render(
      <Markdown inlinePlugins={[]}>{'Hello **world** and `code`'}</Markdown>,
    );
    const withoutPlugins = render(
      <Markdown>{'Hello **world** and `code`'}</Markdown>,
    );
    expect(withPlugins.container.textContent).toBe(
      withoutPlugins.container.textContent,
    );
  });

  it('transforms patterns inside bold/italic text', () => {
    const {container} = render(
      <Markdown inlinePlugins={[createTicketPlugin()]}>
        {'**PROJ-123**'}
      </Markdown>,
    );
    const link = container.querySelector('[data-testid="ticket-link"]');
    expect(link).toBeInTheDocument();
    expect(link!.textContent).toBe('PROJ-123');
    expect(link!.closest('strong')).toBeInTheDocument();
  });

  describe('autolink prop', () => {
    it('renders bare URLs as plain text by default', () => {
      const {container} = render(
        <Markdown>{'see https://example.com here'}</Markdown>,
      );
      expect(container.querySelector('a')).toBeNull();
      expect(container.textContent).toContain('https://example.com');
    });

    it('renders bare https URLs as links when autolink="gfm"', () => {
      const {container} = render(
        <Markdown autolink="gfm">{'see https://example.com here'}</Markdown>,
      );
      const link = container.querySelector('a');
      expect(link).not.toBeNull();
      expect(link!.getAttribute('href')).toBe('https://example.com');
      expect(link!.textContent).toBe('https://example.com');
    });

    it('renders bare www URLs with http:// prefix', () => {
      const {container} = render(
        <Markdown autolink="gfm">{'go www.example.com'}</Markdown>,
      );
      const link = container.querySelector('a');
      expect(link).not.toBeNull();
      expect(link!.getAttribute('href')).toBe('http://www.example.com');
      expect(link!.textContent).toBe('www.example.com');
    });

    it('renders bare emails with mailto: href', () => {
      const {container} = render(
        <Markdown autolink="gfm">{'ping user@example.com please'}</Markdown>,
      );
      const link = container.querySelector('a');
      expect(link).not.toBeNull();
      expect(link!.getAttribute('href')).toBe('mailto:user@example.com');
      expect(link!.textContent).toBe('user@example.com');
    });

    it('does not autolink URLs inside code spans', () => {
      const {container} = render(
        <Markdown autolink="gfm">{'try `https://example.com` here'}</Markdown>,
      );
      expect(container.querySelector('a')).toBeNull();
      expect(container.querySelector('code')).not.toBeNull();
    });

    it('does not autolink URLs inside code blocks', () => {
      const {container} = render(
        <Markdown autolink="gfm">{'```\nhttps://example.com\n```'}</Markdown>,
      );
      expect(container.querySelector('a')).toBeNull();
      expect(container.querySelector('pre')).not.toBeNull();
    });
  });
});
