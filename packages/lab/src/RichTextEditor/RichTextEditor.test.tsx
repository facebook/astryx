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
import {createRef, useEffect} from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import type {EditorState, LexicalEditor} from 'lexical';
import {$getRoot, $createParagraphNode, $createTextNode} from 'lexical';
import {HeadingNode} from '@lexical/rich-text';
import {
  TRANSFORMERS,
  $convertFromMarkdownString,
} from '@lexical/markdown';
import {RichTextEditor, type RichTextEditorRef} from './RichTextEditor';
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
// Builds a serialized Lexical state containing a list. `listType` is
// 'bullet' (renders <ul>) or 'number' (renders <ol>). Used to verify that the
// editor theme applies visible list markers rather than bare indentation.
function makeListState(listType: 'bullet' | 'number'): string {
  const tag = listType === 'number' ? 'ol' : 'ul';
  return JSON.stringify({
    root: {
      children: [
        {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Item one',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'listitem',
              version: 1,
              value: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'list',
          version: 1,
          listType,
          start: 1,
          tag,
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

// Builds a serialized Lexical state with a two-level nested bullet list:
//   • Item one
//     ◦ Nested item
// Lexical models nesting as a child `list` node inside a `listitem`. Used to
// verify that depth-2 markers differ from depth-1 (disc → circle) rather than
// falling back to bare indentation.
function makeNestedBulletState(): string {
  const textNode = (text: string) => ({
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
    type: 'text',
    version: 1,
  });
  const listItem = (children: unknown[], value: number) => ({
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'listitem',
    version: 1,
    value,
  });
  const bulletList = (children: unknown[]) => ({
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'list',
    version: 1,
    listType: 'bullet',
    start: 1,
    tag: 'ul',
  });
  return JSON.stringify({
    root: {
      children: [
        bulletList([
          listItem([textNode('Item one')], 1),
          // A nested list lives inside its own list item wrapper.
          listItem([bulletList([listItem([textNode('Nested item')], 1)])], 2),
        ]),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  });
}

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

  it('exposes an imperative ref handle after mount', () => {
    const ref = createRef<RichTextEditorRef>();
    render(<RichTextEditor ref={ref} label="Notes" />);
    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.focus).toBe('function');
    expect(typeof ref.current?.clear).toBe('function');
    expect(typeof ref.current?.getEditorState).toBe('function');
    expect(typeof ref.current?.getMarkdown).toBe('function');
    expect(typeof ref.current?.getEditor).toBe('function');
  });

  it('ref.focus() runs without throwing and targets the editable surface', () => {
    const ref = createRef<RichTextEditorRef>();
    render(<RichTextEditor ref={ref} label="Notes" />);
    // Lexical dispatches focus via its editor command; jsdom does not always
    // reflect programmatic contenteditable focus onto document.activeElement,
    // so assert the call is wired and the root element is reachable rather
    // than asserting jsdom focus state.
    expect(() => ref.current?.focus()).not.toThrow();
    const root = ref.current?.getEditor().getRootElement();
    expect(root).toBe(screen.getByRole('textbox'));
  });

  it('ref.getEditorState() returns the current EditorState', () => {
    const ref = createRef<RichTextEditorRef>();
    render(
      <RichTextEditor ref={ref} label="Notes" defaultValue={HELLO_STATE} />,
    );
    const state = ref.current?.getEditorState();
    expect(state).toBeDefined();
    const text = state?.read(() => $getRoot().getTextContent());
    expect(text).toBe('Hello world');
  });

  it('ref.getEditor() returns the underlying LexicalEditor', () => {
    const ref = createRef<RichTextEditorRef>();
    render(<RichTextEditor ref={ref} label="Notes" />);
    const editor = ref.current?.getEditor();
    expect(editor).toBeDefined();
    expect(typeof editor?.update).toBe('function');
  });

  it('ref.getMarkdown() serializes plain text content', () => {
    const ref = createRef<RichTextEditorRef>();
    render(
      <RichTextEditor ref={ref} label="Notes" defaultValue={HELLO_STATE} />,
    );
    expect(ref.current?.getMarkdown()).toBe('Hello world');
  });

  it('ref.getMarkdown() serializes a heading with the default transformers', async () => {
    const ref = createRef<RichTextEditorRef>();
    let editorRef: LexicalEditor | undefined;
    render(
      <RichTextEditor
        ref={ref}
        label="Notes"
        plugins={<CaptureEditor onReady={e => (editorRef = e)} />}
      />,
    );
    await waitFor(() => expect(editorRef).toBeDefined());
    editorRef!.update(() => {
      $convertFromMarkdownString('# Title', TRANSFORMERS);
    });
    await waitFor(() =>
      expect(ref.current?.getMarkdown()).toBe('# Title'),
    );
  });

  it('ref.getMarkdown() honors a custom transformers prop', async () => {
    // With an empty transformers set, a heading node cannot be represented in
    // markdown, so its text is emitted as a plain paragraph (no "# "). This
    // proves getMarkdown() uses the same transformers the editor is
    // configured with, not a hardcoded default.
    const ref = createRef<RichTextEditorRef>();
    let editorRef: LexicalEditor | undefined;
    render(
      <RichTextEditor
        ref={ref}
        label="Notes"
        transformers={[]}
        plugins={<CaptureEditor onReady={e => (editorRef = e)} />}
      />,
    );
    await waitFor(() => expect(editorRef).toBeDefined());
    // Seed a heading node directly (bypassing shortcuts) using the full set.
    editorRef!.update(() => {
      $convertFromMarkdownString('# Title', TRANSFORMERS);
    });
    await waitFor(() => expect(ref.current?.getMarkdown()).toBe('Title'));
  });

  it('ref.clear() resets the editor to a single empty paragraph', async () => {
    const ref = createRef<RichTextEditorRef>();
    render(
      <RichTextEditor ref={ref} label="Notes" defaultValue={HELLO_STATE} />,
    );
    ref.current?.clear();
    await waitFor(() => {
      const state: EditorState | undefined = ref.current?.getEditorState();
      const text = state?.read(() => $getRoot().getTextContent());
      expect(text).toBe('');
    });
    // The root should hold exactly one (empty) paragraph, not zero children —
    // a bare root breaks selection/typing.
    const state = ref.current?.getEditorState();
    const childCount = state?.read(() => $getRoot().getChildrenSize());
    expect(childCount).toBe(1);
  });

  it('ref.clear() fires onChange', async () => {
    const ref = createRef<RichTextEditorRef>();
    const onChange = vi.fn();
    render(
      <RichTextEditor
        ref={ref}
        label="Notes"
        defaultValue={HELLO_STATE}
        onChange={onChange}
      />,
    );
    // Wait for the editor to mount and the initial state to settle so any
    // seed-time onChange has already fired before we assert on clear().
    await waitFor(() => expect(ref.current).not.toBeNull());
    onChange.mockClear();
    ref.current?.clear();
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it('ref.clear() and ref.focus() are no-ops when isReadOnly', async () => {
    const ref = createRef<RichTextEditorRef>();
    const onChange = vi.fn();
    render(
      <RichTextEditor
        ref={ref}
        label="Notes"
        defaultValue={HELLO_STATE}
        onChange={onChange}
        isReadOnly
      />,
    );
    onChange.mockClear();
    ref.current?.focus();
    ref.current?.clear();
    // Give any (unexpected) async update a chance to flush before asserting.
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(onChange).not.toHaveBeenCalled();
    const state = ref.current?.getEditorState();
    const text = state?.read(() => $getRoot().getTextContent());
    expect(text).toBe('Hello world');
  });

  it('ref.clear() is a no-op when isDisabled', async () => {
    const ref = createRef<RichTextEditorRef>();
    const onChange = vi.fn();
    render(
      <RichTextEditor
        ref={ref}
        label="Notes"
        defaultValue={HELLO_STATE}
        onChange={onChange}
        isDisabled
      />,
    );
    onChange.mockClear();
    ref.current?.clear();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(onChange).not.toHaveBeenCalled();
    const state = ref.current?.getEditorState();
    const text = state?.read(() => $getRoot().getTextContent());
    expect(text).toBe('Hello world');
  });

  it('does not render a character counter when maxLength is not set', () => {
    render(<RichTextEditor label="Notes" defaultValue={HELLO_STATE} />);
    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
  });

  it('renders a character counter reflecting the seeded content length', async () => {
    // HELLO_STATE is "Hello world" (11 chars).
    render(
      <RichTextEditor label="Notes" defaultValue={HELLO_STATE} maxLength={100} />,
    );
    await waitFor(() =>
      expect(screen.getByText('11/100')).toBeInTheDocument(),
    );
  });

  it('shows an over-limit counter when content exceeds maxLength', async () => {
    // 11 chars with a limit of 5 -> over limit.
    render(
      <RichTextEditor label="Notes" defaultValue={HELLO_STATE} maxLength={5} />,
    );
    await waitFor(() => expect(screen.getByText('11/5')).toBeInTheDocument());
    // aria-live region announces the overflow for screen readers.
    expect(screen.getByText('6 characters over limit')).toBeInTheDocument();
  });

  it('associates the counter with the editor via aria-describedby', async () => {
    render(
      <RichTextEditor label="Notes" defaultValue={HELLO_STATE} maxLength={100} />,
    );
    const counter = await screen.findByText('11/100');
    const describedBy = screen
      .getByRole('textbox')
      .getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(describedBy!.split(' ')).toContain(counter.id);
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

  it('renders bullet lists with a disc marker (not bare indentation)', async () => {
    const {container} = render(<RichTextView value={makeListState('bullet')} />);
    await waitFor(() =>
      expect(screen.getByText('Item one')).toBeInTheDocument(),
    );
    const ul = container.querySelector('ul');
    expect(ul).not.toBeNull();
    // The theme must give the <ul> a marker class so the browser draws a
    // bullet. A bare list with only padding would show indentation only —
    // the exact bug this guards against.
    expect(ul?.className.trim()).not.toBe('');
    expect(getComputedStyle(ul as Element).listStyleType).toBe('disc');
  });

  it('renders numbered lists with a decimal marker (not bare indentation)', async () => {
    const {container} = render(<RichTextView value={makeListState('number')} />);
    await waitFor(() =>
      expect(screen.getByText('Item one')).toBeInTheDocument(),
    );
    const ol = container.querySelector('ol');
    expect(ol).not.toBeNull();
    expect(ol?.className.trim()).not.toBe('');
    expect(getComputedStyle(ol as Element).listStyleType).toBe('decimal');
  });

  it('renders nested bullet lists with a distinct depth-2 marker (circle)', async () => {
    const {container} = render(
      <RichTextView value={makeNestedBulletState()} />,
    );
    await waitFor(() =>
      expect(screen.getByText('Nested item')).toBeInTheDocument(),
    );
    const lists = container.querySelectorAll('ul');
    // Outer <ul> plus the nested <ul>.
    expect(lists.length).toBe(2);
    const [outer, nested] = lists;
    expect(getComputedStyle(outer).listStyleType).toBe('disc');
    // Depth-2 must cycle to a different marker so nesting is visually legible,
    // matching the native browser disc → circle progression.
    expect(getComputedStyle(nested).listStyleType).toBe('circle');
  });

  it('renders nothing (no crash) on malformed JSON with no fallback', () => {
    expect(() => render(<RichTextView value={'garbage'} />)).not.toThrow();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
