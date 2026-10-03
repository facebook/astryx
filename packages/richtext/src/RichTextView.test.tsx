// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RichTextView.test.tsx
 * @input Uses vitest (with core's warnOnce mocked), @testing-library/react,
 *   RichTextView
 * @output Unit tests for the read-only view's accessible name (including
 *   label changes after mount and the blank-label guard) and keyboard
 *   reachability
 * @position Testing; validates RichTextView.tsx
 *
 * SYNC: When the view component changes, update these tests to match.
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {warnOnce} from '@astryxdesign/core/utils';
import type * as CoreUtils from '@astryxdesign/core/utils';
import {RichTextView} from './RichTextView';

// warnOnce dedupes per key for the process lifetime, so the label guard is
// asserted on the call itself rather than on console output an earlier test
// may already have consumed.
vi.mock('@astryxdesign/core/utils', async importOriginal => ({
  ...(await importOriginal<typeof CoreUtils>()),
  warnOnce: vi.fn(),
}));

// A minimal valid serialized Lexical editor state containing a single
// paragraph with the given text.
function makeParagraphState(text: string): string {
  return JSON.stringify({
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  });
}

const HELLO_STATE = makeParagraphState('Hello world');

describe('RichTextView accessibility', () => {
  it('names the textbox via the label prop', async () => {
    render(<RichTextView value={HELLO_STATE} label="Meeting notes" />);
    await waitFor(() =>
      expect(screen.getByText('Hello world')).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('textbox', {name: 'Meeting notes'}),
    ).toBeInTheDocument();
  });

  it('announces the surface as read-only, never disabled', async () => {
    render(<RichTextView value={HELLO_STATE} label="Meeting notes" />);
    await waitFor(() =>
      expect(screen.getByText('Hello world')).toBeInTheDocument(),
    );
    const textbox = screen.getByRole('textbox');
    expect(textbox).toHaveAttribute('aria-readonly', 'true');
    expect(textbox).not.toHaveAttribute('aria-disabled');
    // Same content model as the editor surface: a multiline textbox.
    expect(textbox).toHaveAttribute('aria-multiline', 'true');
  });

  it('keeps the read-only surface keyboard reachable', async () => {
    render(<RichTextView value={HELLO_STATE} label="Meeting notes" />);
    await waitFor(() =>
      expect(screen.getByText('Hello world')).toBeInTheDocument(),
    );
    // A read-only textbox must stay in the tab order so keyboard and
    // screen-reader users can reach, read, and copy its content.
    expect(screen.getByRole('textbox')).toHaveAttribute('tabindex', '0');
  });
});

describe('RichTextView label reactivity', () => {
  it('updates the accessible name when the label changes after mount', async () => {
    const {rerender} = render(<RichTextView value={HELLO_STATE} label="A" />);
    await waitFor(() =>
      expect(screen.getByText('Hello world')).toBeInTheDocument(),
    );
    expect(screen.getByRole('textbox', {name: 'A'})).toBeInTheDocument();

    rerender(<RichTextView value={HELLO_STATE} label="B" />);
    expect(screen.getByRole('textbox', {name: 'B'})).toBeInTheDocument();
    expect(screen.queryByRole('textbox', {name: 'A'})).not.toBeInTheDocument();
  });
});

describe('RichTextView label guard', () => {
  beforeEach(() => {
    vi.mocked(warnOnce).mockClear();
  });

  it('requires a label at compile time, and still warns when JS omits it', async () => {
    // @ts-expect-error `label` is required: the view renders a role="textbox"
    render(<RichTextView value={HELLO_STATE} />);
    await waitFor(() =>
      expect(screen.getByText('Hello world')).toBeInTheDocument(),
    );
    expect(warnOnce).toHaveBeenCalledWith(
      'richtext:view-needs-label',
      'RichTextView',
      expect.any(String),
    );
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-label');
  });

  it.each([
    ['an empty string', ''],
    ['whitespace only', '   '],
  ])('warns and emits no aria-label when the label is %s', async (_, label) => {
    render(<RichTextView value={HELLO_STATE} label={label} />);
    await waitFor(() =>
      expect(screen.getByText('Hello world')).toBeInTheDocument(),
    );

    // A blank label names nothing — `aria-label=""` resolves to the same
    // empty accessible name as no attribute at all — so it must not be able
    // to silence the guard the prop exists to enforce.
    expect(warnOnce).toHaveBeenCalledWith(
      'richtext:view-needs-label',
      'RichTextView',
      expect.any(String),
    );
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-label');
  });

  it('stays silent when a real label is supplied', async () => {
    render(<RichTextView value={HELLO_STATE} label="Meeting notes" />);
    await waitFor(() =>
      expect(screen.getByText('Hello world')).toBeInTheDocument(),
    );
    expect(warnOnce).not.toHaveBeenCalledWith(
      'richtext:view-needs-label',
      expect.anything(),
      expect.anything(),
    );
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-label',
      'Meeting notes',
    );
  });
});
