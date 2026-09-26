// Copyright (c) Meta Platforms, Inc. and affiliates.

import {render, screen, waitFor} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {beforeEach, describe, expect, expectTypeOf, it, vi} from 'vitest';
import {Markdown, type MarkdownComponents} from '../index';
import {
  createMarkdownMermaidPlugin,
  markdownMermaidPlugin,
  type MarkdownMermaidDiagnostic,
  type MarkdownMermaidNode,
} from './index';
import type {MarkdownPluginEntry} from '../plugins';

const initializeMermaid = vi.fn();
const renderMermaid = vi.fn(async (_id: string, source: string) => ({
  svg: `<svg xmlns="http://www.w3.org/2000/svg"><text>${source}</text></svg>`,
}));

vi.mock('mermaid/dist/mermaid.esm.min.mjs', () => ({
  default: {
    initialize: initializeMermaid,
    render: renderMermaid,
  },
}));

beforeEach(() => {
  initializeMermaid.mockClear();
  renderMermaid.mockClear();
  renderMermaid.mockImplementation(async (_id: string, source: string) => ({
    svg: `<svg xmlns="http://www.w3.org/2000/svg"><text>${source}</text></svg>`,
  }));
});

const source = '```mermaid title="Checkout flow"\ngraph LR; A-->B\n```';

describe('Markdown Mermaid integration', () => {
  it('exports a typed semantic-fence plugin', () => {
    expectTypeOf(markdownMermaidPlugin).toMatchTypeOf<
      MarkdownPluginEntry<MarkdownMermaidNode>
    >();
    expectTypeOf(createMarkdownMermaidPlugin()).toMatchTypeOf<
      MarkdownPluginEntry<MarkdownMermaidNode>
    >();
  });

  it('renders Mermaid lazily and preserves a CodeBlock while pending', async () => {
    const {container} = render(
      <Markdown plugins={[markdownMermaidPlugin]}>{source}</Markdown>,
    );

    expect(screen.getByText('graph LR; A-->B')).toBeVisible();
    await waitFor(() => expect(renderMermaid).toHaveBeenCalledOnce());
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull());
    expect(screen.queryByRole('group', {name: 'mermaid'})).toBeNull();
    expect(screen.getByRole('img', {name: 'Checkout flow'})).toBeVisible();
  });

  it('locks security-sensitive configuration after host options', async () => {
    const plugin = createMarkdownMermaidPlugin({
      config: {
        theme: 'forest',
        ...({
          htmlLabels: true,
          logLevel: 'debug',
          securityLevel: 'loose',
          startOnLoad: true,
          suppressErrorRendering: false,
          themeCSS: 'body { display: none }',
        } as object),
      },
    });

    render(<Markdown plugins={[plugin]}>{source}</Markdown>);
    await waitFor(() => expect(initializeMermaid).toHaveBeenCalledOnce());
    expect(initializeMermaid).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'forest',
        htmlLabels: false,
        logLevel: 'fatal',
        securityLevel: 'strict',
        startOnLoad: false,
        suppressErrorRendering: true,
        themeCSS: '',
      }),
    );
  });

  it('removes active SVG content and unsafe navigation before mounting', async () => {
    renderMermaid.mockResolvedValueOnce({
      svg: [
        '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(0)">',
        '<script>throw new Error("source-secret")</script>',
        '<foreignObject><div xmlns="http://www.w3.org/1999/xhtml">HTML</div></foreignObject>',
        '<a href="javascript:alert(1)" target="_blank" onclick="alert(2)"><text>Unsafe</text></a>',
        '<use href="javascript:alert(4)" />',
        '<text onmouseover="alert(3)">Safe text</text>',
        '</svg>',
      ].join(''),
    });

    const {container} = render(
      <Markdown plugins={[markdownMermaidPlugin]}>{source}</Markdown>,
    );
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull());

    expect(container.querySelector('script, foreignObject')).toBeNull();
    expect(container.querySelector('svg')).not.toHaveAttribute('onload');
    expect(container.querySelector('a')).not.toHaveAttribute('href');
    expect(container.querySelector('a')).not.toHaveAttribute('target');
    expect(container.querySelector('a')).not.toHaveAttribute('onclick');
    expect(container.querySelector('use')).not.toHaveAttribute('href');
    expect(container.querySelector('text')).not.toHaveAttribute('onmouseover');
  });

  it('keeps the source fence and reports a source-free diagnostic on failure', async () => {
    const diagnostics: MarkdownMermaidDiagnostic[] = [];
    renderMermaid.mockRejectedValueOnce(new Error('diagram-source-secret'));
    const plugin = createMarkdownMermaidPlugin({
      onDiagnostic: diagnostic => diagnostics.push(diagnostic),
    });

    render(<Markdown plugins={[plugin]}>{source}</Markdown>);
    await waitFor(() => expect(diagnostics).toHaveLength(1));

    expect(screen.getByText('graph LR; A-->B')).toBeVisible();
    expect(diagnostics).toEqual([
      {code: 'render-failed', phase: 'render', severity: 'error'},
    ]);
    expect(JSON.stringify(diagnostics)).not.toContain('diagram-source-secret');
  });

  it('lets components.code retain precedence without loading Mermaid', () => {
    const Code: NonNullable<MarkdownComponents['code']> = ({code}) => (
      <output>{code}</output>
    );

    render(
      <Markdown plugins={[markdownMermaidPlugin]} components={{code: Code}}>
        {source}
      </Markdown>,
    );

    expect(screen.getByText('graph LR; A-->B').tagName).toBe('OUTPUT');
    expect(renderMermaid).not.toHaveBeenCalled();
  });

  it('server-renders the ordinary code fallback without loading Mermaid', () => {
    const html = renderToString(
      <Markdown plugins={[markdownMermaidPlugin]}>{source}</Markdown>,
    );

    expect(html).toContain('graph LR; A--&gt;B');
    expect(renderMermaid).not.toHaveBeenCalled();
  });
});
