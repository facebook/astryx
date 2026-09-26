// Copyright (c) Meta Platforms, Inc. and affiliates.

import {render, screen, waitFor} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {beforeEach, describe, expect, expectTypeOf, it, vi} from 'vitest';
import {Markdown, type MarkdownComponents} from '../index';
import {
  createMarkdownShikiPlugin,
  markdownShikiPlugin,
  type MarkdownShikiDiagnostic,
  type MarkdownShikiNode,
} from './index';
import type {MarkdownPluginEntry} from '../plugins';

const codeToTokensShiki = vi.fn();

vi.mock('shiki', () => ({codeToTokens: codeToTokensShiki}));

function tokenResult(
  code: string,
  color = 'rgb(10, 20, 30)',
  scopeName = 'keyword.control.typescript',
) {
  return {
    tokens: [
      [
        {
          content: code,
          offset: 0,
          color,
          explanation: [{content: code, scopes: [{scopeName}]}],
        },
      ],
    ],
  };
}

beforeEach(() => {
  codeToTokensShiki.mockReset();
  codeToTokensShiki.mockImplementation(async (code: string) =>
    tokenResult(code),
  );
});

const source =
  '```typescript title="model.ts"\nconst answer: number = 42;\n```';

describe('Markdown Shiki integration', () => {
  it('exports a typed semantic-fence plugin', () => {
    expectTypeOf(markdownShikiPlugin).toMatchTypeOf<
      MarkdownPluginEntry<MarkdownShikiNode>
    >();
    expectTypeOf(createMarkdownShikiPlugin()).toMatchTypeOf<
      MarkdownPluginEntry<MarkdownShikiNode>
    >();
  });

  it('keeps CodeBlock visible while Shiki loads, then applies safe tokens', async () => {
    let resolveTokens!: (value: ReturnType<typeof tokenResult>) => void;
    const pendingTokens = new Promise<ReturnType<typeof tokenResult>>(
      resolve => {
        resolveTokens = resolve;
      },
    );
    codeToTokensShiki.mockReturnValueOnce(pendingTokens);
    const {container} = render(
      <Markdown plugins={[markdownShikiPlugin]}>{source}</Markdown>,
    );

    expect(container.querySelector('code')?.textContent).toBe(
      'const answer: number = 42;',
    );
    expect(container.querySelector('.astryx-markdown-shiki')).not.toBeNull();

    resolveTokens(tokenResult('const answer: number = 42;'));
    await waitFor(() =>
      expect(container.querySelector('.astryx-token-keyword')).toHaveClass(
        'astryx-token-keyword',
      ),
    );
    expect(
      container.querySelector('.astryx-token-keyword'),
    ).not.toHaveAttribute('style');
  });

  it('uses an explicit Shiki theme and bounded tokenization', async () => {
    const plugin = createMarkdownShikiPlugin({
      languages: ['typescript'],
      theme: 'vitesse-dark',
      maxLineLength: 1234,
      lineTimeLimit: 75,
    });
    const {container} = render(
      <Markdown plugins={[plugin]}>{source}</Markdown>,
    );

    await waitFor(() => expect(codeToTokensShiki).toHaveBeenCalledOnce());
    expect(codeToTokensShiki).toHaveBeenCalledWith(
      'const answer: number = 42;',
      {
        lang: 'typescript',
        theme: 'vitesse-dark',
        includeExplanation: 'scopeName',
        tokenizeMaxLineLength: 1234,
        tokenizeTimeLimit: 75,
      },
    );
    await waitFor(() =>
      expect(container.querySelector('.astryx-token-keyword')).toHaveStyle({
        color: 'rgb(10, 20, 30)',
      }),
    );
  });

  it('keeps the ordinary CodeBlock and reports a source-free failure', async () => {
    const diagnostics: MarkdownShikiDiagnostic[] = [];
    codeToTokensShiki.mockRejectedValueOnce(
      new Error('private-source-fragment'),
    );
    const plugin = createMarkdownShikiPlugin({
      onDiagnostic: diagnostic => diagnostics.push(diagnostic),
    });
    const {container} = render(
      <Markdown plugins={[plugin]}>{source}</Markdown>,
    );

    await waitFor(() => expect(diagnostics).toHaveLength(1));
    expect(container.querySelector('code')?.textContent).toBe(
      'const answer: number = 42;',
    );
    expect(diagnostics).toEqual([
      {code: 'tokenize-failed', phase: 'render', severity: 'error'},
    ]);
    expect(JSON.stringify(diagnostics)).not.toContain(
      'private-source-fragment',
    );
  });

  it('rejects token output that does not reproduce the source', async () => {
    const diagnostics: MarkdownShikiDiagnostic[] = [];
    codeToTokensShiki.mockResolvedValueOnce(tokenResult('changed source'));
    const plugin = createMarkdownShikiPlugin({
      onDiagnostic: diagnostic => diagnostics.push(diagnostic),
    });
    const {container} = render(
      <Markdown plugins={[plugin]}>{source}</Markdown>,
    );

    await waitFor(() =>
      expect(diagnostics).toEqual([
        {code: 'invalid-tokens', phase: 'render', severity: 'error'},
      ]),
    );
    expect(container.querySelector('code')?.textContent).toBe(
      'const answer: number = 42;',
    );
  });

  it('claims only configured languages', async () => {
    const plugin = createMarkdownShikiPlugin({languages: ['lua']});
    const {container} = render(
      <Markdown plugins={[plugin]}>
        {'```typescript\nconst answer = 42;\n```'}
      </Markdown>,
    );

    expect(container.querySelector('.astryx-markdown-shiki')).toBeNull();
    expect(codeToTokensShiki).not.toHaveBeenCalled();
  });

  it('forwards unlocked CodeBlock options', async () => {
    const plugin = createMarkdownShikiPlugin({
      codeBlockProps: {hasCopyButton: false, isWrapped: true},
    });
    render(<Markdown plugins={[plugin]}>{source}</Markdown>);

    await waitFor(() => expect(codeToTokensShiki).toHaveBeenCalledOnce());
    expect(screen.queryByRole('button', {name: 'Copy code'})).toBeNull();
  });

  it('lets components.code retain precedence without loading Shiki', () => {
    const Code: NonNullable<MarkdownComponents['code']> = ({code}) => (
      <output>{code}</output>
    );
    const {container} = render(
      <Markdown plugins={[markdownShikiPlugin]} components={{code: Code}}>
        {source}
      </Markdown>,
    );

    expect(screen.getByText('const answer: number = 42;').tagName).toBe(
      'OUTPUT',
    );
    expect(container.querySelector('.astryx-markdown-shiki')).toBeNull();
    expect(codeToTokensShiki).not.toHaveBeenCalled();
  });

  it('server-renders the ordinary CodeBlock without loading Shiki', () => {
    const html = renderToString(
      <Markdown plugins={[markdownShikiPlugin]}>{source}</Markdown>,
    );

    expect(html).toContain('const');
    expect(html).toContain('answer');
    expect(html).toContain('42');
    expect(html).not.toContain('rgb(10, 20, 30)');
    expect(codeToTokensShiki).not.toHaveBeenCalled();
  });
});
