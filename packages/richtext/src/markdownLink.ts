// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markdownLink.ts
 * @input Uses @lexical/link and @lexical/markdown (LINK).
 * @output Exports LINK_KEEPING_DESTINATIONS, Lexical's link transformer with
 *   one change: it writes a destination so it reads back, one holding a space
 *   in angle brackets and one whose parentheses do not balance with each
 *   parenthesis escaped, while a balanced destination is written as it is.
 *   Import is Lexical's own, which reads every CommonMark destination and
 *   title shape, an angle-bracket destination (`<https://e.com/a b>`)
 *   included.
 * @position Replaces Lexical's LINK in DEFAULT_TRANSFORMERS and in table
 *   cells (markdownTable.ts). Import reads balanced parentheses in a
 *   destination and backslash escapes (markdownCharacterReferences.ts), so a
 *   destination written this way — `https://e.com/a(b` as
 *   `https://e.com/a\(b` — reads back as the same link, whether it was
 *   imported or made in the editor (spec:AST-062 FR3). A balanced
 *   destination is written as it is.
 */

import {$isAutoLinkNode, $isLinkNode} from '@lexical/link';
import {LINK, type TextMatchTransformer} from '@lexical/markdown';

/** Whether every `)` in `url` closes an earlier `(` and every `(` closes. */
function isBalanced(url: string): boolean {
  let depth = 0;
  for (const character of url) {
    if (character === '(') {
      depth++;
    } else if (character === ')') {
      depth--;
      if (depth < 0) {
        return false;
      }
    }
  }
  return depth === 0;
}

/** `url` as a Markdown destination that reads back as `url`. */
export function markdownDestination(url: string): string {
  if (/\s/.test(url) || url.startsWith('<')) {
    // Only an angle-bracket destination may hold a space or open with `<`
    // (CommonMark §6.3).
    return `<${url.replace(/[\\<>]/g, '\\$&')}>`;
  }
  // A backslash before punctuation would read back as an escape, so every
  // backslash is written escaped; so is every parenthesis that does not
  // balance.
  return url.replace(isBalanced(url) ? /\\/g : /[\\()]/g, '\\$&');
}

export const LINK_KEEPING_DESTINATIONS: TextMatchTransformer = {
  // Lexical's own import reads every CommonMark destination and title shape,
  // an angle-bracket destination included.
  ...LINK,
  export: (node, exportChildren, exportFormat) => {
    if (!$isLinkNode(node) || $isAutoLinkNode(node)) {
      return null;
    }
    const url = node.getURL();
    const destination = markdownDestination(url);
    if (destination === url) {
      return LINK.export?.(node, exportChildren, exportFormat) ?? null;
    }
    const text = exportChildren(node);
    const title = node.getTitle();
    return title == null || title === ''
      ? `[${text}](${destination})`
      : `[${text}](${destination} "${title.replace(/([\\"])/g, '\\$1')}")`;
  },
};
