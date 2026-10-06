// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {normalizeListIndentation} from './markdownListIndentation';
import {
  editorStateJSONToMarkdown,
  markdownToEditorStateJSON,
} from './markdownSerializers';

interface SerializedNode {
  readonly type: string;
  readonly text?: string;
  readonly children?: ReadonlyArray<SerializedNode>;
}

/** Each list item's depth and text, in document order. */
function listItems(markdown: string): Array<string> {
  const {root} = JSON.parse(markdownToEditorStateJSON(markdown)) as {
    root: SerializedNode;
  };
  const items: Array<string> = [];
  const visit = (node: SerializedNode, depth: number) => {
    if (node.type === 'listitem') {
      const text = (node.children ?? [])
        .filter(child => child.type === 'text')
        .map(child => child.text)
        .join('');
      if (text !== '') {
        items.push(`${depth}:${text}`);
      }
    }
    const nextDepth = node.type === 'list' ? depth + 1 : depth;
    for (const child of node.children ?? []) {
      visit(child, nextDepth);
    }
  };
  visit(root, -1);
  return items;
}

describe('list nesting (spec:AST-061 FR5)', () => {
  it('nests an item under the item whose content it is indented to', () => {
    expect(listItems('- a\n  - b\n    - c\n- d\n')).toEqual([
      '0:a',
      '1:b',
      '2:c',
      '0:d',
    ]);
    expect(listItems('1. a\n   1. b\n   2. c\n2. d\n')).toEqual([
      '0:a',
      '1:b',
      '1:c',
      '0:d',
    ]);
    expect(listItems('- a\n    - four spaces\n')).toEqual([
      '0:a',
      '1:four spaces',
    ]);
    expect(listItems('- a\n\t- tab\n')).toEqual(['0:a', '1:tab']);
  });

  it('keeps an item that does not reach its parent content at the parent level', () => {
    // One space is not enough to reach the content of `- a`.
    expect(listItems('- a\n - b\n')).toEqual(['0:a', '0:b']);
    // `10. ` puts its content at column four, so a three-space item starts
    // a list of its own, and a four-space item does not reach that one's.
    expect(listItems('10. a\n   - b\n    - c\n')).toEqual([
      '0:a',
      '0:b',
      '0:c',
    ]);
  });

  it('keeps nesting across blank lines in a loose list', () => {
    expect(listItems('- a\n\n  - b\n\n- c\n')).toEqual(['0:a', '1:b', '0:c']);
  });

  it('leaves non-list lines, fenced code, and the line count alone', () => {
    const markdown =
      '- a\n  continued\n\n```\n  - not a list\n```\n\nText\n  - b\n';
    const normalized = normalizeListIndentation(markdown);
    expect(normalized.split('\n')).toHaveLength(markdown.split('\n').length);
    expect(normalized).toContain('```\n  - not a list\n```');
    expect(normalized).toContain('- a\n  continued');
  });

  it('keeps the authored indentation of an untouched list (spec:AST-062)', () => {
    const markdown = '- a\n  - b\n\n1. a\n   1. b\n';
    expect(editorStateJSONToMarkdown(markdownToEditorStateJSON(markdown))).toBe(
      markdown,
    );
  });
});
