// Copyright (c) Meta Platforms, Inc. and affiliates.

import {fireEvent, render, screen, within} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import type {ComponentProps, ComponentPropsWithRef, ReactNode} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {LinkProvider} from '../Link/LinkProvider';
import {InternationalizationProvider} from '../i18n/InternationalizationProvider';
import pseudoCatalog from '../../locales/pseudo.json';
import {Markdown} from './Markdown';
import {createMarkdownPlugin} from './plugins';
import {prepareMarkdownDocument} from './preparedDocument';

vi.mock('../hooks/useStreamingText', () => ({
  useStreamingText: (text: string) => text,
}));

function getFootnoteSection(name = 'Footnotes'): HTMLElement {
  const section = screen
    .getByRole('heading', {name, level: 2})
    .closest('section');
  expect(section).not.toBeNull();
  return section as HTMLElement;
}

describe('Markdown footnotes', () => {
  const source = [
    '# Notes',
    '',
    'First[^b], then[^a], and first again[^b].',
    '',
    '[^a]: Alpha.',
    '',
    '[^b]: **Beta** note.',
  ].join('\n');

  it('rejects footnotes in inline display at runtime', () => {
    const props = {
      children: 'Inline[^note]',
      display: 'inline',
      footnotes: 'github',
    } as unknown as ComponentProps<typeof Markdown>;

    expect(() => render(<Markdown {...props} />)).toThrow(
      'Markdown footnotes support only block display.',
    );
  });

  it('keeps footnote source literal unless explicitly enabled', () => {
    const {rerender} = render(<Markdown>{source}</Markdown>);

    expect(
      screen.queryByRole('heading', {name: 'Footnotes', level: 2}),
    ).toBeNull();
    expect(screen.getByText(/First\[\^b\]/)).toBeInTheDocument();
    expect(screen.getByText('[^a]: Alpha.')).toBeInTheDocument();

    rerender(<Markdown variant="document">{source}</Markdown>);
    expect(
      screen.queryByRole('heading', {name: 'Footnotes', level: 2}),
    ).toBeNull();
    expect(screen.getByText('[^a]: Alpha.')).toBeInTheDocument();
  });

  it('renders numbered native references and one ordered definition section', () => {
    const onLinkClick = vi.fn((): false => false);
    const {container} = render(
      <Markdown id="article" footnotes="github" onLinkClick={onLinkClick}>
        {source}
      </Markdown>,
    );

    const section = getFootnoteSection();
    expect(section.className).toContain('astryx-markdown-footnotes');
    const items = within(section).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute('id', 'article:footnote-b');
    expect(items[0]).toHaveTextContent('Beta note.');
    expect(items[1]).toHaveAttribute('id', 'article:footnote-a');
    expect(items[1]).toHaveTextContent('Alpha.');

    const firstReferences = screen.getAllByRole('link', {
      name: 'Go to footnote 1',
    });
    expect(firstReferences).toHaveLength(2);
    expect(firstReferences[0]).toHaveAttribute('href', '#article:footnote-b');
    expect(firstReferences[0].parentElement).toHaveAttribute(
      'id',
      'article:footnote-reference-b',
    );
    expect(firstReferences[1].parentElement).toHaveAttribute(
      'id',
      'article:footnote-reference-b-1',
    );

    const backlinks = within(section).getAllByRole('link', {
      name: /Back to reference .* for footnote 1/,
    });
    expect(backlinks).toHaveLength(2);
    expect(backlinks[0]).toHaveAttribute(
      'href',
      '#article:footnote-reference-b',
    );
    expect(backlinks[1]).toHaveAttribute(
      'href',
      '#article:footnote-reference-b-1',
    );
    expect(fireEvent.click(firstReferences[0])).toBe(false);
    expect(onLinkClick).toHaveBeenCalledWith(
      '#article:footnote-b',
      expect.any(Object),
    );
    expect(container.querySelector('[id="article:footnote-a"]')).toBe(items[1]);
  });

  it('reserves heading ids before allocating footnote ids', () => {
    render(
      <Markdown id="heading-collision" footnotes="github">
        {
          '# Footnote note\n\n# Footnote reference note\n\nText[^!].\n\n[^!]: Note.'
        }
      </Markdown>,
    );

    expect(screen.getByRole('listitem')).toHaveAttribute(
      'id',
      'heading-collision:footnote-note-1',
    );
    expect(
      screen.getByRole('link', {name: 'Go to footnote 1'}).parentElement,
    ).toHaveAttribute('id', 'heading-collision:footnote-reference-note-1');
  });

  it('uses LinkProvider for generated links without invoking components.link', () => {
    function RouterLink({children, ref, ...props}: ComponentPropsWithRef<'a'>) {
      return (
        <a ref={ref} data-router-link {...props}>
          {children}
        </a>
      );
    }
    function AuthoredLink({
      href,
      children,
    }: {
      href: string;
      children: ReactNode;
    }) {
      return (
        <a data-authored-link href={href}>
          {children}
        </a>
      );
    }

    render(
      <LinkProvider component={RouterLink}>
        <Markdown footnotes="github" components={{link: AuthoredLink}}>
          {'[Authored](/target) note[^a].\n\n[^a]: Definition.'}
        </Markdown>
      </LinkProvider>,
    );

    expect(screen.getByText('Authored').closest('a')).toHaveAttribute(
      'data-authored-link',
    );
    expect(
      screen.getByRole('link', {name: 'Go to footnote 1'}),
    ).toHaveAttribute('data-router-link');
    expect(
      screen.getByRole('link', {
        name: 'Back to reference 1 for footnote 1',
      }),
    ).toHaveAttribute('data-router-link');
  });

  it('localizes the section, reference, and backlink names', () => {
    render(
      <InternationalizationProvider
        locale="pseudo"
        messages={{pseudo: pseudoCatalog}}>
        <Markdown footnotes="github">
          {'Body[^note].\n\n[^note]: Definition.'}
        </Markdown>
      </InternationalizationProvider>,
    );

    expect(
      screen.getByRole('heading', {name: '⟦Ƒóóţñóţéš⟧', level: 2}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: '⟦Ĝó ţó ƒóóţñóţé 1⟧'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: '⟦Ɓàçķ ţó řéƒéřéñçé 1 ƒóř ƒóóţñóţé 1⟧',
      }),
    ).toBeInTheDocument();
  });

  it('reuses document renderers inside definition bodies', () => {
    function Paragraph({children}: {children: ReactNode}) {
      return <p data-custom-paragraph>{children}</p>;
    }
    function Math({value}: {value: string; display: 'inline' | 'block'}) {
      return <span data-custom-math>{value}</span>;
    }

    render(
      <Markdown
        footnotes="github"
        components={{paragraph: Paragraph, math: Math}}>
        {'Body[^note].\n\n[^note]: **Strong** and $x + y$.'}
      </Markdown>,
    );

    const section = getFootnoteSection();
    expect(section.querySelector('[data-custom-paragraph]')).toHaveTextContent(
      'Strong and x + y.',
    );
    expect(section.querySelector('[data-custom-math]')).toHaveTextContent(
      'x + y',
    );
  });

  it('scopes native fragment ids across Markdown instances', () => {
    const {container} = render(
      <>
        <Markdown footnotes="github">{'First[^a].\n\n[^a]: One.'}</Markdown>
        <Markdown footnotes="github">{'Second[^a].\n\n[^a]: Two.'}</Markdown>
      </>,
    );

    const roots = screen.getAllByRole('document');
    const references = screen.getAllByRole('link', {name: 'Go to footnote 1'});
    const targets = references.map(reference =>
      reference.getAttribute('href')?.slice(1),
    );
    expect(new Set(targets).size).toBe(2);
    targets.forEach((target, index) => {
      expect(target).toBeTruthy();
      expect(roots[index]).toContainElement(document.getElementById(target!));
    });

    const ids = Array.from(container.querySelectorAll('[id]'), element =>
      element.getAttribute('id'),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps a transformed orphan reference byte-readable', () => {
    const removeDefinition = createMarkdownPlugin({
      name: 'remove-definition',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: root.children.filter(
            block => block.type !== 'footnoteDefinition',
          ),
        };
      },
    });

    render(
      <Markdown footnotes="github" plugins={[removeDefinition]}>
        {'Body[^a\\]b].\n\n[^a\\]b]: Definition.'}
      </Markdown>,
    );

    expect(screen.getByRole('document')).toHaveTextContent('Body[^a\\]b].');
    expect(
      screen.queryByRole('heading', {name: 'Footnotes', level: 2}),
    ).toBeNull();
  });

  it('tracks streaming boundaries through rendered definition bodies', () => {
    const {rerender} = render(
      <Markdown id="stream" footnotes="github" isStreaming>
        {'Body[^a].\n\n[^a]: Old'}
      </Markdown>,
    );
    rerender(
      <Markdown id="stream" footnotes="github" isStreaming>
        {'Body[^a].\n\n[^a]: Old new'}
      </Markdown>,
    );

    const item = screen.getByRole('listitem');
    const leafText = Array.from(item.querySelectorAll('span'))
      .filter(element => element.children.length === 0)
      .map(element => element.textContent);
    expect(leafText).toContain('Old');
    expect(leafText).toContain(' new');
  });

  it('keeps heading permalinks aligned when a heading contains a reference', () => {
    render(
      <Markdown id="heading-reference" footnotes="github" hasHeadingPermalinks>
        {'# Notes[^a]\n\n[^a]: Definition.'}
      </Markdown>,
    );

    expect(screen.getByRole('heading', {level: 1})).toHaveAttribute(
      'id',
      'notes',
    );
    expect(
      screen.getByRole('link', {name: 'Permalink to Notes'}),
    ).toHaveAttribute('href', '#notes');
  });

  it('server-renders the same native fragment graph', () => {
    const html = renderToString(
      <Markdown id="server-document" footnotes="github">
        {source}
      </Markdown>,
    );

    expect(html).toContain('href="#server-document:footnote-b"');
    expect(html).toContain('id="server-document:footnote-reference-b"');
    expect(html).toContain('id="server-document:footnote-b"');
    expect(html).toContain('href="#server-document:footnote-reference-b-1"');
  });

  it('renders prepared documents identically without a second parse contract', () => {
    const direct = render(
      <Markdown id="prepared-document" footnotes="github">
        {source}
      </Markdown>,
    );
    const directMarkup = direct.container.innerHTML;
    direct.unmount();

    const prepared = prepareMarkdownDocument(source, {footnotes: 'github'});
    const preparedRender = render(
      <Markdown id="prepared-document" document={prepared} />,
    );
    expect(preparedRender.container.innerHTML).toBe(directMarkup);
  });
});
