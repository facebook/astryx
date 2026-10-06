// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, waitFor} from '@testing-library/react';
import {$createHorizontalRuleNode} from '@lexical/extension';
import {createHeadlessEditor} from '@lexical/headless';
import {$getRoot} from 'lexical';
import {DEFAULT_NODES} from './editorNodes';
import {RichTextEditor} from './RichTextEditor';
import {RichTextView} from './RichTextView';
import {
  editorStateJSONToMarkdown,
  markdownToEditorStateJSON,
} from './markdownSerializers';

interface SerializedNode {
  type: string;
  children?: Array<SerializedNode>;
  text?: string;
}

function blockTypes(markdown: string): Array<string> {
  const state = JSON.parse(markdownToEditorStateJSON(markdown)) as {
    root: SerializedNode;
  };
  return (state.root.children ?? []).map(node => node.type);
}

describe('thematic breaks (spec:AST-061 FR5)', () => {
  it('imports every CommonMark thematic break as a horizontal rule', () => {
    for (const line of [
      '---',
      '***',
      '___',
      '- - -',
      '* * *',
      '_ _ _',
      '   ----',
      '***   ',
    ]) {
      expect(blockTypes(`Before\n\n${line}\n\nAfter`), line).toEqual([
        'paragraph',
        'horizontalrule',
        'paragraph',
      ]);
    }
  });

  it('leaves lines that are not thematic breaks as text', () => {
    for (const line of ['--', '-*-', '--- x', '    ---']) {
      expect(blockTypes(`Before\n\n${line}\n\nAfter`), line).not.toContain(
        'horizontalrule',
      );
    }
  });

  it('keeps a dash line under a paragraph line with that paragraph', () => {
    // CommonMark reads this as a setext heading underline, not a break.
    expect(blockTypes('Title\n---\n\nAfter')).not.toContain('horizontalrule');
    // With a blank line between, it is a break again.
    expect(blockTypes('Title\n\n---\n\nAfter')).toEqual([
      'paragraph',
      'horizontalrule',
      'paragraph',
    ]);
  });

  it('keeps an imported rule as written and writes a new rule as ---', () => {
    // An untouched rule keeps its authored bytes (spec:AST-062).
    expect(
      editorStateJSONToMarkdown(
        markdownToEditorStateJSON('Before\n\n* * *\n\nAfter'),
      ),
    ).toBe('Before\n\n* * *\n\nAfter');
    const editor = createHeadlessEditor({
      namespace: 'astryx-thematic-break-test',
      nodes: [...DEFAULT_NODES],
      onError(error: Error) {
        throw error;
      },
    });
    editor.setEditorState(
      editor.parseEditorState(markdownToEditorStateJSON('Before\n\nAfter')),
    );
    editor.update(
      () => {
        $getRoot().getFirstChild()?.insertAfter($createHorizontalRuleNode());
      },
      {discrete: true},
    );
    const markdown = editorStateJSONToMarkdown(
      JSON.stringify(editor.getEditorState().toJSON()),
    );
    expect(markdown).toBe('Before\n\n---\n\nAfter');
    expect(blockTypes(markdown)).toEqual([
      'paragraph',
      'horizontalrule',
      'paragraph',
    ]);
  });

  it('draws a rule in the editor and in RichTextView', async () => {
    const value = markdownToEditorStateJSON('Before\n\n---\n\nAfter');
    const {container} = render(
      <>
        <RichTextEditor label="Notes" defaultValue={value} />
        <RichTextView value={value} />
      </>,
    );
    await waitFor(() => {
      expect(container.querySelectorAll('hr')).toHaveLength(2);
    });
    expect(container.textContent).not.toContain('---');
  });
});
