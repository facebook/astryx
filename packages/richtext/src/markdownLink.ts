// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markdownLink.ts
 * @input Uses @lexical/link and @lexical/markdown (LINK).
 * @output Exports LINK_KEEPING_DESTINATIONS, Lexical's link transformer with
 *   two changes: it reads an angle-bracket destination (`<https://e.com/a b>`)
 *   as core Markdown does, without its brackets, and it writes a destination
 *   so it reads back: one holding a space in angle brackets, and one whose
 *   parentheses do not balance with each parenthesis escaped.
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
  if (/\s/.test(url)) {
    // Only an angle-bracket destination may hold a space (CommonMark §6.3).
    return `<${url.replace(/[<>]/g, '\\$&')}>`;
  }
  return isBalanced(url) ? url : url.replace(/[()]/g, '\\$&');
}

/**
 * Lexical's link pattern, with a destination in angle brackets too: any
 * characters but brackets and line endings, spaces included.
 */
const LINK_WITH_ANGLE_DESTINATION =
  /(?:\[(.+?)\])(?:\((?:(<[^<>\n]*>|[^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))/;

export const LINK_KEEPING_DESTINATIONS: TextMatchTransformer = {
  ...LINK,
  importRegExp: LINK_WITH_ANGLE_DESTINATION,
  replace: (textNode, match) => {
    const destination = match[2];
    // Only a whole angle-bracket destination drops its brackets; `<b>c>`
    // is a destination as it stands, as core reads it.
    if (destination == null || !/^<[^<>\n]*>$/.test(destination)) {
      return LINK.replace?.(textNode, match);
    }
    // The link's address is what the angle brackets hold.
    const withoutBrackets = Object.assign([...match], {
      index: match.index,
      input: match.input,
    }) as RegExpMatchArray;
    withoutBrackets[2] = destination.slice(1, -1);
    return LINK.replace?.(textNode, withoutBrackets);
  },
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
