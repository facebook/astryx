// Copyright (c) Meta Platforms, Inc. and affiliates.

import {render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Markdown} from '../Markdown';
import {
  createMarkdownKaTeXRenderer,
  MarkdownKaTeX,
  type MarkdownKaTeXDiagnostic,
} from './MarkdownKaTeX';

const renderKaTeX = vi.fn(
  (value: string, element: HTMLElement, options: Record<string, unknown>) => {
    const output = document.createElement('span');
    output.dataset.typeset = value;
    output.textContent =
      options.displayMode === true ? `block:${value}` : `inline:${value}`;
    element.replaceChildren(output);
  },
);

vi.mock('katex', () => ({
  default: {render: renderKaTeX},
}));

beforeEach(() => {
  renderKaTeX.mockClear();
  renderKaTeX.mockImplementation(
    (value: string, element: HTMLElement, options: Record<string, unknown>) => {
      const output = document.createElement('span');
      output.dataset.typeset = value;
      output.textContent =
        options.displayMode === true ? `block:${value}` : `inline:${value}`;
      element.replaceChildren(output);
    },
  );
});

describe('MarkdownKaTeX', () => {
  it('is a components.math-compatible lazy renderer', async () => {
    const {container} = render(
      <Markdown components={{math: MarkdownKaTeX}}>
        {'Inline $x + y$.'}
      </Markdown>,
    );

    expect(container.textContent).toContain('$x + y$');
    await waitFor(() => expect(renderKaTeX).toHaveBeenCalledOnce());
    expect(container.querySelector('[data-typeset="x + y"]')).toHaveTextContent(
      'inline:x + y',
    );
    expect(renderKaTeX).toHaveBeenCalledWith(
      'x + y',
      expect.any(HTMLElement),
      expect.objectContaining({
        displayMode: false,
        output: 'htmlAndMathml',
        strict: 'ignore',
        throwOnError: true,
        trust: false,
      }),
    );
  });

  it('renders display math as a block and reflects its theme axis', async () => {
    const {container} = render(
      <Markdown components={{math: MarkdownKaTeX}}>{'$$x^2$$'}</Markdown>,
    );

    await waitFor(() =>
      expect(container.querySelector('[data-typeset="x^2"]')).toHaveTextContent(
        'block:x^2',
      ),
    );
    expect(container.querySelector('.astryx-markdown-katex')).toHaveAttribute(
      'data-display',
      'block',
    );
  });

  it('keeps security and accessibility output settings under adapter ownership', async () => {
    const MathRenderer = createMarkdownKaTeXRenderer({
      katexOptions: {
        macros: {'\\RR': '\\mathbb{R}'},
        ...({
          displayMode: false,
          output: 'html',
          strict: 'warn',
          throwOnError: false,
          trust: true,
        } as object),
      },
    });

    render(<Markdown components={{math: MathRenderer}}>{'$$\\RR$$'}</Markdown>);

    await waitFor(() => expect(renderKaTeX).toHaveBeenCalledOnce());
    expect(renderKaTeX).toHaveBeenCalledWith(
      '\\RR',
      expect.any(HTMLElement),
      expect.objectContaining({
        displayMode: true,
        output: 'htmlAndMathml',
        strict: 'ignore',
        throwOnError: true,
        trust: false,
        macros: {'\\RR': '\\mathbb{R}'},
      }),
    );
  });

  it('keeps source visible and reports a source-free diagnostic on failure', async () => {
    const diagnostics: MarkdownKaTeXDiagnostic[] = [];
    renderKaTeX.mockImplementationOnce(() => {
      throw new Error('secret-expression');
    });

    render(
      <MarkdownKaTeX
        value="secret-expression"
        display="inline"
        onDiagnostic={diagnostic => diagnostics.push(diagnostic)}
      />,
    );

    await waitFor(() => expect(diagnostics).toHaveLength(1));
    expect(screen.getByText('$secret-expression$')).toBeVisible();
    expect(diagnostics).toEqual([
      {
        code: 'typeset-failed',
        phase: 'render',
        severity: 'error',
      },
    ]);
    expect(JSON.stringify(diagnostics)).not.toContain('secret-expression');
  });
});
