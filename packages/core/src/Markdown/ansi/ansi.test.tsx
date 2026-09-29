// Copyright (c) Meta Platforms, Inc. and affiliates.

import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {beforeEach, describe, expect, expectTypeOf, it, vi} from 'vitest';
import {Markdown, type MarkdownComponents} from '../index';
import {
  createMarkdownAnsiPlugin,
  markdownAnsiPlugin,
  type MarkdownAnsiNode,
} from './index';
import type {MarkdownPluginEntry} from '../plugins';

const source = '```ansi title="Build log"\n\u001b[31mERROR\u001b[0m ready\n```';

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {writeText: vi.fn().mockResolvedValue(undefined)},
  });
});

describe('Markdown ANSI integration', () => {
  it('exports a typed exact-fence plugin', () => {
    expectTypeOf(markdownAnsiPlugin).toMatchTypeOf<
      MarkdownPluginEntry<MarkdownAnsiNode>
    >();
    expectTypeOf(createMarkdownAnsiPlugin()).toMatchTypeOf<
      MarkdownPluginEntry<MarkdownAnsiNode>
    >();
  });

  it('renders SGR color while exposing and copying only plain text', async () => {
    const {container} = render(
      <Markdown plugins={[markdownAnsiPlugin]}>{source}</Markdown>,
    );

    const error = screen.getByText('ERROR');
    expect(error.getAttribute('style')).toContain(
      'color: var(--color-syntax-tag)',
    );
    expect(container.querySelector('code')?.textContent).toBe('ERROR ready');
    expect(container.textContent).not.toContain('\u001b');
    expect(container.querySelector('.astryx-markdown-ansi')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', {name: 'Copy code'}));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ERROR ready'),
    );
  });

  it('supports formatting, indexed colors, true color, and resets', () => {
    const richSource = [
      '```ansi',
      '\u001b[1;4;38;5;196mindexed\u001b[0m',
      '\u001b[3;48;2;1;2;3mtruecolor\u001b[23;49m plain',
      '```',
    ].join('\n');
    render(<Markdown plugins={[markdownAnsiPlugin]}>{richSource}</Markdown>);

    expect(screen.getByText('indexed')).toHaveStyle({
      color: 'rgb(255, 0, 0)',
      fontWeight: 700,
      textDecorationLine: 'underline',
    });
    expect(screen.getByText('truecolor')).toHaveStyle({
      backgroundColor: 'rgb(1, 2, 3)',
      fontStyle: 'italic',
    });
  });

  it('applies a custom palette and forwards unlocked CodeBlock options', () => {
    const plugin = createMarkdownAnsiPlugin({
      palette: {red: 'rgb(120, 10, 20)'},
      codeBlockProps: {hasCopyButton: false, isWrapped: true},
    });
    render(<Markdown plugins={[plugin]}>{source}</Markdown>);

    expect(screen.getByText('ERROR')).toHaveStyle({color: 'rgb(120, 10, 20)'});
    expect(screen.queryByRole('button', {name: 'Copy code'})).toBeNull();
  });

  it('strips non-text terminal controls and renders markup as text', () => {
    const unsafeSource = [
      '```ansi',
      '\u001b]0;private title\u0007start\u001b[2J',
      '<script>not executable</script>\u0000\r end',
      '```',
    ].join('\n');
    const {container} = render(
      <Markdown plugins={[markdownAnsiPlugin]}>{unsafeSource}</Markdown>,
    );

    expect(container.querySelector('code')?.textContent).toBe(
      'start\n<script>not executable</script> end',
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).not.toContain('private title');
  });

  it('keeps styles active across lines without spanning line wrappers', () => {
    const multiline = '```ansi\n\u001b[32mfirst\nsecond\u001b[0m third\n```';
    const {container} = render(
      <Markdown plugins={[markdownAnsiPlugin]}>{multiline}</Markdown>,
    );

    const first = screen.getByText('first');
    const second = screen.getByText('second');
    expect(first.getAttribute('style')).toContain('--color-syntax-string');
    expect(second.getAttribute('style')).toContain('--color-syntax-string');
    expect(first.closest('[data-line]')).not.toBe(
      second.closest('[data-line]'),
    );
    expect(container.querySelector('code')?.textContent).toBe(
      'first\nsecond third',
    );
  });

  it('leaves similarly named fence languages on the ordinary CodeBlock path', () => {
    const {container} = render(
      <Markdown plugins={[markdownAnsiPlugin]}>
        {'```ansi-log\nplain output\n```'}
      </Markdown>,
    );

    expect(container.querySelector('.astryx-markdown-ansi')).toBeNull();
    expect(container.querySelector('pre')).toHaveAttribute(
      'data-language',
      'ansi',
    );
    expect(container.querySelector('code')).toHaveTextContent('plain output');
  });

  it('lets components.code retain precedence', () => {
    const Code: NonNullable<MarkdownComponents['code']> = ({code}) => (
      <output>{code}</output>
    );
    const {container} = render(
      <Markdown plugins={[markdownAnsiPlugin]} components={{code: Code}}>
        {source}
      </Markdown>,
    );

    expect(screen.getByText('\u001b[31mERROR\u001b[0m ready').tagName).toBe(
      'OUTPUT',
    );
    expect(container.querySelector('.astryx-markdown-ansi')).toBeNull();
  });

  it('server-renders styled plain text without terminal controls', () => {
    const html = renderToString(
      <Markdown plugins={[markdownAnsiPlugin]}>{source}</Markdown>,
    );

    expect(html).toContain('ERROR');
    expect(html).toContain('color:var(--color-syntax-tag)');
    expect(html).not.toContain('\u001b');
  });
});
