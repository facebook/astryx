// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {createHeadlessEditor} from '@lexical/headless';
import {$isCodeNode} from '@lexical/code';
import {$getRoot, $isTextNode} from 'lexical';
import {parseMarkdownAst} from '@astryxdesign/core/Markdown/parser';
import {DEFAULT_NODES} from './editorNodes';
import {DEFAULT_TRANSFORMERS} from './markdownTable';
import {
  $exportMarkdownKeepingSource,
  importMarkdownKeepingSource,
} from './markdownSource';
import {
  editorStateJSONToMarkdown,
  markdownToEditorStateJSON,
} from './markdownSerializers';

type Json = Record<string, unknown>;

/** Each top-level block: a code block's language and code, or its type. */
function blocks(markdown: string): Array<unknown> {
  const root = (JSON.parse(markdownToEditorStateJSON(markdown)) as {root: Json})
    .root;
  return (root.children as Array<Json>).map(node =>
    node.type === 'code'
      ? {
          language: node.language ?? null,
          code: ((node.children as Array<Json>) ?? [])
            .map(child =>
              child.type === 'linebreak' ? '\n' : (child.text as string),
            )
            .join(''),
        }
      : node.type,
  );
}

/** The same, as core Markdown reads it. */
function coreBlocks(markdown: string): Array<unknown> {
  return (parseMarkdownAst(markdown).children as unknown as Array<Json>).map(
    node =>
      node.type === 'code'
        ? {language: node.lang ?? null, code: node.value as string}
        : node.type,
  );
}

describe('tilde code fences (CommonMark 0.31 §4.5, spec:AST-061 FR5)', () => {
  it.each([
    '~~~ts\nconst a = 1;\nconst b = 2;\n~~~\n',
    '~~~\nplain\n~~~\n',
    '~~~~\n~~~\ninner\n~~~\n~~~~\n',
    '~~~\n```\nbackticks\n```\n~~~\n',
    'Before\n\n~~~js\nx();\n~~~\n\nAfter\n',
  ])('reads %j as core does, and round-trips it', markdown => {
    expect(blocks(markdown)).toEqual(coreBlocks(markdown));
    expect(editorStateJSONToMarkdown(markdownToEditorStateJSON(markdown))).toBe(
      markdown,
    );
  });

  it('runs an unclosed tilde block to the end of the document', () => {
    expect(blocks('~~~\nopen\ncode\n')).toEqual([
      {language: null, code: 'open\ncode'},
    ]);
  });

  it('exports an edited tilde block with tildes, longer than any tilde fence in its code', () => {
    const editor = createHeadlessEditor({
      nodes: [...DEFAULT_NODES],
      onError(error) {
        throw error;
      },
    });
    importMarkdownKeepingSource(editor, '~~~ts\nconst a = 1;\n~~~\n', [
      ...DEFAULT_TRANSFORMERS,
    ]);
    const exportAfter = (text: string): string => {
      editor.update(
        () => {
          const code = $getRoot().getFirstChild();
          if (!$isCodeNode(code)) {
            throw new Error('No code block');
          }
          const first = code.getFirstChild();
          if (!$isTextNode(first)) {
            throw new Error('No code text');
          }
          first.setTextContent(text);
        },
        {discrete: true},
      );
      return editor
        .getEditorState()
        .read(() => $exportMarkdownKeepingSource([...DEFAULT_TRANSFORMERS]));
    };
    const edited = exportAfter('const a = 2;');
    expect(edited).toBe('~~~ts\nconst a = 2;\n~~~\n');
    expect(blocks(edited)).toEqual([{language: 'ts', code: 'const a = 2;'}]);
    const holding = exportAfter('~~~');
    expect(holding).toBe('~~~~ts\n~~~\n~~~~\n');
    expect(blocks(holding)).toEqual([{language: 'ts', code: '~~~'}]);
  });
});
