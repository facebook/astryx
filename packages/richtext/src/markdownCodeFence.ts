// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markdownCodeFence.ts
 * @input Uses @lexical/markdown (CODE) and @lexical/code.
 * @output Exports BACKTICK_CODE and TILDE_CODE, the transformers for fenced
 *   code blocks opened with backticks and with tildes.
 * @position Part of DEFAULT_TRANSFORMERS (markdownTable.ts): BACKTICK_CODE
 *   stands in for Lexical's CODE, and TILDE_CODE reads the `~~~` fences CODE
 *   does not (CommonMark 0.31 §4.5, spec:AST-061 FR5). Both read the opening
 *   line as core Markdown does: the rest of the line after the fence is the
 *   info string, never code; the language is the text right after the fence
 *   up to the first space (so `c++` stays `c++`), and a block whose info
 *   string starts with a space has none, as core reads it. A block closes at
 *   a fence of its own character at least as long, or at the end of the
 *   document. Each keeps its fence and info string (spec:AST-062): an edited
 *   block exports them as written, with its language first when that was
 *   changed, and a tilde fence lengthened when its code holds one that long.
 *   A one-line backtick block (```` ```code``` ````) stays Lexical's.
 */

import {$isCodeNode} from '@lexical/code';
import {
  CODE,
  type ElementTransformer,
  type MultilineElementTransformer,
} from '@lexical/markdown';
import {$getState, $setState, createState, type ElementNode} from 'lexical';

/**
 * The tilde fence a code block was opened with; null for a backtick block.
 * Lexical's own fence state holds only backtick fences.
 */
const tildeFence = createState('astryxTildeFence', {
  parse: (value: unknown): string | null =>
    typeof value === 'string' && /^~{3,}$/.test(value) ? value : null,
});

/** The info string a code block's opening fence carried, as written. */
const fenceInfo = createState('astryxFenceInfo', {
  parse: (value: unknown): string | null =>
    typeof value === 'string' && value !== '' ? value : null,
});

/** The language core Markdown reads from an info string, or null. */
function languageOf(info: string): string | null {
  return /^\S+/.exec(info)?.[0] ?? null;
}

/** An opening fence line: its fence and the info string after it. */
function readOpening(
  line: string,
): {readonly fence: string; readonly info: string} | null {
  const match = /^[ \t]*(`{3,}|~{3,})(.*)$/.exec(line);
  if (match == null) {
    return null;
  }
  const [, fence, info] = match;
  // A backtick fence's info string holds no backtick.
  return fence.startsWith('`') && info.includes('`') ? null : {fence, info};
}

/** The longest run of three or more tildes in `text`, or 0. */
function longestTildeRun(text: string): number {
  return Math.max(0, ...(text.match(/~{3,}/g) ?? []).map(run => run.length));
}

/**
 * Builds the code block an opening line starts, from the lines after it up
 * to its closing fence, and returns the index of the last line it used.
 */
function $importFencedCode(
  rootNode: ElementNode,
  lines: ReadonlyArray<string>,
  startLineIndex: number,
  opening: {readonly fence: string; readonly info: string},
): number {
  const {fence, info} = opening;
  const closing = new RegExp(
    `^[ \\t]*${fence[0] === '`' ? '`' : '~'}{${fence.length},}[ \\t]*$`,
  );
  let end = startLineIndex + 1;
  while (end < lines.length && !closing.test(lines[end])) {
    end++;
  }
  const language = languageOf(info);
  const startMatch = Object.assign(
    [lines[startLineIndex], fence, language ?? undefined],
    {index: 0, input: lines[startLineIndex]},
  ) as unknown as RegExpMatchArray;
  const endMatch = end < lines.length ? lines[end].match(closing) : null;
  CODE.replace(
    rootNode,
    null,
    startMatch,
    endMatch,
    lines.slice(startLineIndex + 1, end),
    true,
  );
  const block = rootNode.getLastChild();
  if ($isCodeNode(block)) {
    if (fence.startsWith('~')) {
      $setState(block, tildeFence, fence);
    }
    $setState(block, fenceInfo, info.trimEnd());
  }
  return Math.min(end, lines.length - 1);
}

/** Writes a code block that keeps its fence or info string; null otherwise. */
const exportFencedCode: ElementTransformer['export'] = (
  node,
  exportChildren,
) => {
  if (!$isCodeNode(node)) {
    return null;
  }
  const tilde = $getState(node, tildeFence);
  const info = $getState(node, fenceInfo);
  if (tilde == null && info == null) {
    return null;
  }
  const text = node.getTextContent();
  const language = node.getLanguage() ?? '';
  let written = info ?? '';
  if ((languageOf(written) ?? '') !== language) {
    // The language changed: it leads, before the rest of the info string.
    const rest =
      languageOf(written) == null
        ? ''
        : written.slice(languageOf(written)?.length).trim();
    written = rest === '' ? language : `${language} ${rest}`;
  }
  const fence =
    tilde != null
      ? '~'.repeat(Math.max(tilde.length, longestTildeRun(text) + 1))
      : (/^`+/.exec(CODE.export?.(node, exportChildren) ?? '')?.[0] ?? '```');
  return `${fence}${written}${text === '' ? '' : `\n${text}`}\n${fence}`;
};

export const BACKTICK_CODE: MultilineElementTransformer = {
  ...CODE,
  handleImportAfterStartMatch: args => {
    const opening = readOpening(args.lines[args.startLineIndex]);
    if (opening == null) {
      return CODE.handleImportAfterStartMatch?.(args) ?? null;
    }
    return [
      true,
      $importFencedCode(
        args.rootNode,
        args.lines,
        args.startLineIndex,
        opening,
      ),
    ];
  },
  export: (node, exportChildren) =>
    exportFencedCode(node, exportChildren) ??
    CODE.export?.(node, exportChildren) ??
    null,
};

export const TILDE_CODE: MultilineElementTransformer = {
  ...CODE,
  regExpStart: /^([ \t]*~{3,})(.*)$/,
  regExpEnd: {optional: true, regExp: /^[ \t]*~{3,}[ \t]*$/},
  handleImportAfterStartMatch: ({lines, rootNode, startLineIndex}) => {
    const opening = readOpening(lines[startLineIndex]);
    return opening == null
      ? null
      : [true, $importFencedCode(rootNode, lines, startLineIndex, opening)];
  },
  export: (node, exportChildren) =>
    exportFencedCode(node, exportChildren) ?? null,
};
