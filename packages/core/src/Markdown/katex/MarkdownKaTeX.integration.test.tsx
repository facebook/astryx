// Copyright (c) Meta Platforms, Inc. and affiliates.

import {render, waitFor} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {MarkdownKaTeX} from './MarkdownKaTeX';

describe('MarkdownKaTeX with KaTeX', () => {
  it('renders visual HTML and accessible MathML without raw HTML injection', async () => {
    const {container} = render(
      <MarkdownKaTeX value={'\\frac{a}{b}'} display="block" />,
    );

    await waitFor(() =>
      expect(container.querySelector('.katex')).not.toBeNull(),
    );
    expect(container.querySelector('math')).not.toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('code')).toBeNull();
  });

  it('server-renders the readable source fallback before the client loads KaTeX', () => {
    const html = renderToString(
      <MarkdownKaTeX value="x + y" display="inline" />,
    );

    expect(html).toContain('$x + y$');
    expect(html).not.toContain('katex-html');
  });
});
