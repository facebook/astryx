// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {createHeadlessEditor} from '@lexical/headless';
import {$getRoot, $isTextNode} from 'lexical';
import {DEFAULT_NODES} from './editorNodes';
import {DEFAULT_TRANSFORMERS} from './markdownTable';
import {
  $exportMarkdownKeepingSource,
  importMarkdownKeepingSource,
} from './markdownSource';

/** Imports `markdown`, appends `x` to its last text, and exports it. */
function editAndExport(markdown: string): string {
  const editor = createHeadlessEditor({
    nodes: [...DEFAULT_NODES],
    onError(error) {
      throw error;
    },
  });
  importMarkdownKeepingSource(editor, markdown, [...DEFAULT_TRANSFORMERS]);
  editor.update(
    () => {
      const last = $getRoot().getLastDescendant();
      if (!$isTextNode(last)) {
        throw new Error('No text to edit');
      }
      last.setTextContent(`${last.getTextContent()}x`);
    },
    {discrete: true},
  );
  return editor
    .getEditorState()
    .read(() => $exportMarkdownKeepingSource([...DEFAULT_TRANSFORMERS]));
}

/**
 * The least CPU time of five runs of `run`, in milliseconds. CPU time, not
 * elapsed time: on a loaded test machine, other work stretches elapsed time
 * but not the time the editor spends computing.
 */
function leastCpuTime(run: () => void): number {
  run();
  let least = Number.POSITIVE_INFINITY;
  for (let round = 0; round < 5; round++) {
    const started = process.cpuUsage();
    run();
    const used = process.cpuUsage(started);
    least = Math.min(least, (used.user + used.system) / 1000);
  }
  return least;
}

const RUN = ' '.repeat(40_000);

describe('runs of spaces inside text', () => {
  it.each([
    ['plain text', 'a     b\n', 'a     bx\n'],
    ['bold text', '**a     b** c\n', '**a     b** cx\n'],
    ['link text', '[a     b](u) c\n', '[a     b](u) cx\n'],
    ['tabs and spaces', 'a\t\t b\n', 'a\t\t bx\n'],
    ['no-break spaces', 'a\u00a0\u00a0b\n', 'a\u00a0\u00a0bx\n'],
    [
      'a table cell',
      '| h |\n| - |\n| a     b |\n',
      '| h |\n| --- |\n| a     bx |\n',
    ],
  ])('keeps each space through an edit of %s', (_, markdown, expected) => {
    expect(editAndExport(markdown)).toBe(expected);
  });

  it.each([
    ['plain text', `a${RUN}b\nc\n`],
    ['bold text', `**a${RUN}b**\nc\n`],
    ['link text', `[a${RUN}b](u)\nc\n`],
    ['a table cell', `| h |\n| - |\n| a${RUN}b |\n`],
  ])(
    'imports, edits, and exports %s with a 40 KB run within 100 ms',
    (_, markdown) => {
      expect(leastCpuTime(() => editAndExport(markdown))).toBeLessThan(100);
    },
  );
});
