// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file parseOutlineFromMarkdown.ts
 * @input Uses Markdown parser internals and OutlineItem type
 * @output Exports parseOutlineFromMarkdown for extracting heading outlines from Markdown
 * @position Pure utility; consumed by useOutlineFromMarkdown and public exports
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Outline/Outline.doc.mjs
 * - /packages/core/src/Outline/index.ts
 */

import {
  parseMarkdown,
  inlineText,
  slugify,
  uniqueSlug,
} from '../Markdown/parser';
import type {OutlineItem} from './types';

/**
 * Extract heading items from a Markdown string.
 *
 * Uses Markdown's parser so fenced code blocks, tables, lists, and inline
 * formatting are interpreted consistently with rendered Markdown output.
 */
export function parseOutlineFromMarkdown(markdown: string): OutlineItem[] {
  const counts = new Map<string, number>();
  return parseMarkdown(markdown)
    .filter(block => block.type === 'heading')
    .map(block => {
      const label = inlineText(block.children).trim();
      return {
        id: uniqueSlug(slugify(label), counts),
        label,
        level: block.level,
      };
    });
}
