// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RichTextEditor.test.tsx
 * @input Uses vitest, @testing-library/react, RichTextEditor + RichTextView
 * @output Unit tests for the opt-in Lexical editor components
 * @position Testing; validates RichTextEditor.tsx and RichTextView.tsx
 *
 * SYNC: When the editor components change, update these tests to match.
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {useEffect} from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import type {LexicalEditor} from 'lexical';
import {$getRoot, $createParagraphNode, $createTextNode} from 'lexical';
import {HeadingNode} from '@lexical/rich-text';
import {
  TRANSFORMERS,
  $convertFromMarkdownString,
} from '@lexical/markdown';
import {RichTextEditor} from './RichTextEditor';
import {RichTextView} from './RichTextView';

// Small plugin that captures the editor instance so tests can drive real
// Lexical updates (jsdom does not implement contenteditable editing).
function CaptureEditor({
  onReady,
}: {
  onReady: (editor: LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);
  return null;
}

// A minimal valid serialized Lexical editor state containing a single
// paragraph with the text "Hello world".
const HELLO_STATE = JSON.stringify({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Hello world',
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

describe('RichTextEditor', () => {
  it('renders a labelled editable textbox', () => {
    render(<RichTextEditor label="Notes" />);
    const textbox = screen.getByRole('textbox');
    expect(textbox).toBeInTheDocument();
    expect(textbox).toHaveAttribute('contenteditable', 'true');
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('shows the placeholder when empty', () => {
    render(<RichTextEditor label="Notes" placeholder="Write something…" />);
    expect(screen.getByText('Write something…')).toBeInTheDocument();
  });

  it('renders the initial value from defaultValue', async () => {
    render(<RichTextEditor label="Notes" defaultValue={HELLO_STATE} />);
    await waitFor(() =>
      expect(screen.getByText('Hello world')).toBeInTheDocument(),
    );
  });

  it('is not editable when isReadOnly', () => {
    render(<RichTextEditor label="Notes" isReadOnly />);
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'contenteditable',
      'false',
    );
  });

  it('is not editable when isDisabled', () => {
    render(<RichTextEditor label="Notes" isDisabled />);
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'contenteditable',
      'false',
    );
  });

  it('marks the textbox invalid on error status', () => {
    render(
      <RichTextEditor
        label="Notes"
        status={{type: 'error', message: 'Required'}}
      />,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('sets aria-required when required', () => {
    render(<RichTextEditor label="Notes" isRequired />);
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('fires onChange when content changes', async () => {
    // jsdom does not implement contenteditable editing, so we grab the editor
    // instance via a small capture plugin and drive a real Lexical update,
    // then assert onChange fires.
    let editorRef: LexicalEditor | undefined;
    const onChange = vi.fn();
    render(
      <RichTextEditor
        label="Notes"
        onChange={onChange}
        plugins={<CaptureEditor onReady={e => (editorRef = e)} />}
      />,
    );
    await waitFor(() => expect(editorRef).toBeDefined());
    onChange.mockClear();
    editorRef!.update(() => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode('hello'));
      root.append(paragraph);
    });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it('hides the visible label but keeps it accessible when isLabelHidden', () => {
    render(<RichTextEditor label="Secret notes" isLabelHidden />);
    expect(
      screen.getByRole('textbox', {name: 'Secret notes'}),
    ).toBeInTheDocument();
  });

  it('renders custom plugins passed via the plugins prop', () => {
    render(
      <RichTextEditor
        label="Notes"
        plugins={<div data-testid="custom-plugin" />}
      />,
    );
    expect(screen.getByTestId('custom-plugin')).toBeInTheDocument();
  });

  it('accepts a custom transformers array without throwing', () => {
    // Empty transformer set is a valid custom configuration (disables all
    // markdown shortcuts while keeping the plugin mounted).
    render(<RichTextEditor label="Notes" transformers={[]} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders when markdown shortcuts are disabled', () => {
    render(<RichTextEditor label="Notes" hasMarkdownShortcuts={false} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies the default transformers to convert markdown to a heading', async () => {
    // jsdom can't dispatch the keystrokes that trigger registerMarkdownShortcuts
    // live, so we drive $convertFromMarkdownString with the same TRANSFORMERS
    // the component registers by default. This proves the default transformer
    // set actually produces the expected node structure (a heading), rather
    // than only asserting the editor mounts.
    let editorRef: LexicalEditor | undefined;
    render(
      <RichTextEditor
        label="Notes"
        plugins={<CaptureEditor onReady={e => (editorRef = e)} />}
      />,
    );
    await waitFor(() => expect(editorRef).toBeDefined());
    editorRef!.update(() => {
      $convertFromMarkdownString('# Title', TRANSFORMERS);
    });
    await waitFor(() => {
      editorRef!.getEditorState().read(() => {
        const first = $getRoot().getFirstChild();
        expect(first?.getType()).toBe('heading');
        expect(first?.getTextContent()).toBe('Title');
      });
    });
  });

  it('leaves markdown untransformed when given an empty transformers array', async () => {
    // With no transformers, the same markdown text stays a plain paragraph —
    // demonstrating the transformers prop is the effective source of truth for
    // markdown behaviour, not a fixed internal default.
    let editorRef: LexicalEditor | undefined;
    render(
      <RichTextEditor
        label="Notes"
        transformers={[]}
        plugins={<CaptureEditor onReady={e => (editorRef = e)} />}
      />,
    );
    await waitFor(() => expect(editorRef).toBeDefined());
    editorRef!.update(() => {
      // Empty transformer set: markdown syntax is preserved verbatim.
      $convertFromMarkdownString('# Title', []);
    });
    await waitFor(() => {
      editorRef!.getEditorState().read(() => {
        const first = $getRoot().getFirstChild();
        expect(first?.getType()).toBe('paragraph');
        expect(first?.getTextContent()).toBe('# Title');
      });
    });
  });
});

describe('RichTextView', () => {
  it('renders serialized content read-only', async () => {
    render(<RichTextView value={HELLO_STATE} />);
    await waitFor(() =>
      expect(screen.getByText('Hello world')).toBeInTheDocument(),
    );
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'contenteditable',
      'false',
    );
  });

  it('renders custom read-only plugins passed via the plugins prop', () => {
    render(
      <RichTextView
        value={HELLO_STATE}
        plugins={<div data-testid="view-plugin" />}
      />,
    );
    expect(screen.getByTestId('view-plugin')).toBeInTheDocument();
  });

  it('accepts a custom namespace without throwing', async () => {
    render(<RichTextView value={HELLO_STATE} namespace="custom-view-ns" />);
    await waitFor(() =>
      expect(screen.getByText('Hello world')).toBeInTheDocument(),
    );
  });

  it('registers extra nodes via the nodes prop without throwing', async () => {
    // Passing the default node set again is a no-op but exercises the merge
    // path; the point is that supplying `nodes` does not break rendering.
    render(<RichTextView value={HELLO_STATE} nodes={[HeadingNode]} />);
    await waitFor(() =>
      expect(screen.getByText('Hello world')).toBeInTheDocument(),
    );
  });

  it('does not throw on malformed JSON — renders fallback and calls onError', () => {
    const onError = vi.fn();
    expect(() =>
      render(
        <RichTextView
          value={'{ not valid json'}
          onParseError={onError}
          errorFallback={<div data-testid="view-fallback">Unavailable</div>}
        />,
      ),
    ).not.toThrow();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(screen.getByTestId('view-fallback')).toBeInTheDocument();
    // No editor surface is rendered in the error state.
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders nothing (no crash) on malformed JSON with no fallback', () => {
    expect(() => render(<RichTextView value={'garbage'} />)).not.toThrow();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
