// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, describe, it, expect, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {RichTextEditor} from './RichTextEditor';
import {RichTextView} from './RichTextView';
import {markdownToEditorStateJSON} from './markdownSerializers';

describe('code block headers (spec:AST-061 FR8)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('labels a fenced block with its language and copies its code, outside the editable text', async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText},
    });
    const value = markdownToEditorStateJSON(
      'Before\n\n```ts\nconst a = 1;\nconst b = 2;\n```\n',
    );
    const {container} = render(<RichTextView value={value} />);
    const header = await waitFor(() => {
      const element = container.querySelector('[data-richtext-code-header]');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    expect(header.textContent).toContain('ts');
    expect(header.closest('[contenteditable]')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Copy code'}));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('const a = 1;\nconst b = 2;'),
    );
  });

  it('shows only the copy button when the block names no language', async () => {
    const {container} = render(
      <RichTextView value={markdownToEditorStateJSON('```\nplain\n```\n')} />,
    );
    const header = await waitFor(() => {
      const element = container.querySelector('[data-richtext-code-header]');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    // The button's accessible name is all the header holds.
    expect(header.textContent).toBe('Copy code');
    expect(screen.getByRole('button', {name: 'Copy code'})).toBeTruthy();
  });

  it('draws one header per code block in the editor, outside the editable text', async () => {
    const {container} = render(
      <RichTextEditor
        label="Notes"
        defaultValue={markdownToEditorStateJSON(
          '```ts\none\n```\n\nText\n\n```js\ntwo\n```\n',
        )}
      />,
    );
    await waitFor(() =>
      expect(
        container.querySelectorAll('[data-richtext-code-header]'),
      ).toHaveLength(2),
    );
    const headers = [
      ...container.querySelectorAll('[data-richtext-code-header]'),
    ];
    // Each header: its language label, then the copy button's name.
    expect(headers.map(header => header.textContent)).toEqual([
      'tsCopy code',
      'jsCopy code',
    ]);
    for (const header of headers) {
      expect(header.closest('[contenteditable]')).toBeNull();
    }
  });
});
