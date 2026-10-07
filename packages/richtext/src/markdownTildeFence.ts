// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markdownTildeFence.ts
 * @input Uses @lexical/markdown (CODE) and @lexical/code.
 * @output Exports TILDE_CODE, the transformer for fenced code blocks opened
 *   with `~~~`.
 * @position Part of DEFAULT_TRANSFORMERS (markdownTable.ts), before Lexical's
 *   CODE, which reads only backtick fences. Markdown reads both fences
 *   (CommonMark 0.31 §4.5), so a `~~~` block imported as a paragraph of
 *   tildes before (spec:AST-061 FR5). A tilde block closes at a tilde fence
 *   at least as long as its opening one, or at the end of the document, and
 *   keeps its fence: an edited block exports with tildes, lengthened when
 *   its code holds a tilde fence of that length.
 */

import {$isCodeNode} from '@lexical/code';
import {CODE, type MultilineElementTransformer} from '@lexical/markdown';
import {$getState, $setState, createState} from 'lexical';

/**
 * The tilde fence a code block was opened with; null for a backtick block.
 * Lexical's own fence state holds only backtick fences.
 */
const tildeFence = createState('astryxTildeFence', {
  parse: (value: unknown): string | null =>
    typeof value === 'string' && /^~{3,}$/.test(value) ? value : null,
});

/** The longest run of three or more tildes in `text`, or 0. */
function longestTildeRun(text: string): number {
  return Math.max(0, ...(text.match(/~{3,}/g) ?? []).map(run => run.length));
}

export const TILDE_CODE: MultilineElementTransformer = {
  ...CODE,
  regExpStart: /^([ \t]*~{3,})([\w-]+)?[ \t]?/,
  regExpEnd: {optional: true, regExp: /^[ \t]*~{3,}[ \t]*$/},
  handleImportAfterStartMatch: ({
    lines,
    rootNode,
    startLineIndex,
    startMatch,
  }) => {
    const fenceLength = startMatch[1].trim().length;
    const closing = new RegExp(`^[ \\t]*~{${fenceLength},}[ \\t]*$`);
    const after = lines[startLineIndex].slice(startMatch[0].length);
    let end = startLineIndex + 1;
    while (end < lines.length && !closing.test(lines[end])) {
      end++;
    }
    const code = lines.slice(startLineIndex + 1, end);
    if (after.length > 0) {
      code.unshift(after);
    }
    const endMatch = end < lines.length ? lines[end].match(closing) : null;
    CODE.replace(rootNode, null, startMatch, endMatch, code, true);
    const block = rootNode.getLastChild();
    if ($isCodeNode(block)) {
      $setState(block, tildeFence, startMatch[1].trim());
    }
    return [true, Math.min(end, lines.length - 1)];
  },
  export: node => {
    const stored = $isCodeNode(node) ? $getState(node, tildeFence) : null;
    if (!$isCodeNode(node) || stored == null) {
      // A backtick block: Lexical's CODE writes it.
      return null;
    }
    const text = node.getTextContent();
    const fence = '~'.repeat(
      Math.max(stored.length, longestTildeRun(text) + 1),
    );
    const language = node.getLanguage() ?? '';
    return `${fence}${language}${text === '' ? '' : `\n${text}`}\n${fence}`;
  },
};
