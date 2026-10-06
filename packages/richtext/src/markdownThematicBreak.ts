// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markdownThematicBreak.ts
 * @input Uses @lexical/extension (HorizontalRuleNode), @lexical/markdown
 *   (ElementTransformer), and lexical.
 * @output Exports THEMATIC_BREAK, the Markdown transformer that turns a
 *   thematic break line into a horizontal rule and writes a rule back as `---`.
 * @position Part of DEFAULT_TRANSFORMERS (markdownTable.ts), ahead of
 *   Lexical's list transformers so `* * *` and `- - -` are rules, as in
 *   CommonMark. Matches core Markdown's thematic breaks (spec:AST-061 FR5).
 */

import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from '@lexical/extension';
import type {ElementTransformer} from '@lexical/markdown';
import {$isParagraphNode} from 'lexical';

/**
 * Three or more `-`, `*`, or `_` of one kind, optionally spaced, indented at
 * most three spaces (CommonMark 0.31, thematic breaks).
 */
const THEMATIC_BREAK_LINE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;

export const THEMATIC_BREAK: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: node => ($isHorizontalRuleNode(node) ? '---' : null),
  regExp: THEMATIC_BREAK_LINE,
  replace: (parentNode, _children, match, isImport) => {
    // A `---` line right under a paragraph line underlines it as a heading
    // (setext) rather than breaking; leave that line to the paragraph.
    const previous = parentNode.getPreviousSibling();
    if (
      isImport &&
      match[1] === '-' &&
      $isParagraphNode(previous) &&
      previous.getTextContentSize() > 0
    ) {
      return false;
    }
    const rule = $createHorizontalRuleNode();
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(rule);
    } else {
      parentNode.insertBefore(rule);
    }
    rule.selectNext();
  },
  type: 'element',
};
