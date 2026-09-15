// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file parseOutlineFromMarkdown.ts
 * @input Uses Markdown parser, parse options, plugin projection, and OutlineItem type
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
import {prepareMarkdownPlugins} from '../Markdown/plugins';
import type {MathParseOptions, ParseOptions} from '../Markdown/parser';
import type {MarkdownPluginEntry} from '../Markdown/plugins';
import type {OutlineItem} from './types';

/**
 * Extract heading items from a Markdown string.
 *
 * Uses Markdown's parser so fenced code blocks, tables, lists, and inline
 * formatting are interpreted consistently with rendered Markdown output.
 * Ids come from the parser's shared slug helpers, so they always match the
 * `id` attributes Markdown renders on its headings.
 */
export function parseOutlineFromMarkdown(
  markdown: string,
  options?:
    | ParseOptions<ReadonlyArray<MarkdownPluginEntry>>
    | MathParseOptions<ReadonlyArray<MarkdownPluginEntry>>,
): OutlineItem[] {
  const counts = new Map<string, number>();
  const plugins =
    options?.plugins != null && options.plugins.length > 0
      ? prepareMarkdownPlugins(options.plugins)
      : undefined;
  const blocks =
    options == null
      ? parseMarkdown(markdown)
      : options.math === true
        ? parseMarkdown(markdown, options)
        : parseMarkdown(markdown, options);
  return blocks
    .filter(block => block.type === 'heading')
    .map(block => {
      const label = inlineText(block.children, plugins).trim();
      return {
        id: uniqueSlug(slugify(label), counts),
        label,
        level: block.level,
      };
    });
}
