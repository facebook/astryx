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
import {RichTextEditor} from './RichTextEditor';
import {RichTextView} from './RichTextView';

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
    function CaptureEditor() {
      const [editor] = useLexicalComposerContext();
      useEffect(() => {
        editorRef = editor;
      }, [editor]);
      return null;
    }
    const onChange = vi.fn();
    render(
      <RichTextEditor
        label="Notes"
        onChange={onChange}
        plugins={<CaptureEditor />}
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
