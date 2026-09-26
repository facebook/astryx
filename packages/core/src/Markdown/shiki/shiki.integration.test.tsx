// Copyright (c) Meta Platforms, Inc. and affiliates.

import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Markdown} from '../index';
import {markdownShikiPlugin} from './index';

describe('Markdown Shiki with Shiki', () => {
  it('renders real grammar tokens through Astryx syntax classes', async () => {
    const code = 'fn main() { let answer: i32 = 42; }';
    const {container} = render(
      <Markdown plugins={[markdownShikiPlugin]}>
        {`\`\`\`rust title="main.rs"\n${code}\n\`\`\``}
      </Markdown>,
    );

    const keyword = await screen.findByText('fn', {}, {timeout: 10_000});
    expect(keyword).toHaveClass('astryx-token-keyword');
    expect(container.querySelector('code')?.textContent).toBe(code);
    expect(container.querySelector('.astryx-markdown-shiki')).not.toBeNull();
    expect(container.querySelector('script, style')).toBeNull();
  });
});
