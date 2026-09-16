// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file parseOutlineFromMarkdown.ts
 * @input Uses Markdown's canonical AST parser and heading slug helpers
 * @output Exports parseOutlineFromMarkdown for extracting heading outlines from Markdown
 * @position Pure compatibility utility; consumed by useOutlineFromMarkdown and public exports
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Outline/Outline.doc.mjs
 * - /packages/core/src/Outline/index.ts
 */

import {parseMarkdownAst, slugify, uniqueSlug} from '../Markdown/parser';
import {markdownAstText} from '../Markdown/ast';
import type {OutlineItem} from './types';

/**
 * Extract heading items from a Markdown string.
 *
 * Uses Markdown's parser so fenced code blocks, tables, lists, and inline
 * formatting are interpreted consistently with rendered Markdown output.
 * Ids come from the parser's shared slug helpers, so they always match the
 * `id` attributes Markdown renders on its headings.
 */
export function parseOutlineFromMarkdown(markdown: string): OutlineItem[] {
  const counts = new Map<string, number>();
  return parseMarkdownAst(markdown)
    .children.filter(block => block.type === 'heading')
    .map(block => {
      const label = markdownAstText(block.children).trim();
      return {
        id: uniqueSlug(slugify(label), counts),
        label,
        level: block.depth,
      };
    });
}
