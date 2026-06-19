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

import {parseMarkdown, type InlineNode} from '../Markdown/parser';
import type {OutlineItem} from './types';

function inlineText(nodes: InlineNode[]): string {
  return nodes
    .map(node => {
      switch (node.type) {
        case 'text':
        case 'code':
          return node.content;
        case 'bold':
        case 'italic':
        case 'strikethrough':
        case 'link':
          return inlineText(node.children);
        case 'image':
          return node.alt;
        case 'citation':
        case 'break':
          return '';
      }
    })
    .join('');
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueSlug(baseSlug: string, counts: Map<string, number>): string {
  const fallbackSlug = baseSlug || 'section';
  const count = counts.get(fallbackSlug) ?? 0;
  counts.set(fallbackSlug, count + 1);
  return count === 0 ? fallbackSlug : `${fallbackSlug}-${count}`;
}

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
