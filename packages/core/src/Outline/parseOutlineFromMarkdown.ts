// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file parseOutlineFromMarkdown.ts
 * @input Uses Markdown's canonical parser options, transforms, and heading projection
 * @output Exports parseOutlineFromMarkdown for extracting heading outlines from Markdown
 * @position Pure compatibility utility; consumed by useOutlineFromMarkdown and public exports
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Outline/Outline.doc.mjs
 * - /packages/core/src/Outline/index.ts
 */

import {projectMarkdownHeadings} from '../Markdown/headingProjection';
import {parseMarkdownAstInternal} from '../Markdown/parser';
import {prepareMarkdownPlugins} from '../Markdown/plugins/protocol';
import type {
  MarkdownExtensionNode,
  MarkdownPluginEntry,
} from '../Markdown/plugins/protocol';
import type {OutlineItem} from './types';

/**
 * Extract heading items from a Markdown string.
 *
 * Uses Markdown's parser and heading projection so syntax options, transforms,
 * labels, and collision-safe ids match rendered Markdown output.
 */
export interface ParseOutlineFromMarkdownOptions<
  Node extends MarkdownExtensionNode = never,
> {
  readonly sourceIds?: ReadonlySet<string>;
  readonly autolink?: 'gfm';
  readonly math?: boolean;
  /** Match Markdown's Core footnote grammar when headings contain references. */
  readonly footnotes?: 'github';
  readonly plugins?: ReadonlyArray<MarkdownPluginEntry<Node>>;
  /** Match Markdown's transform finality while content is streaming. */
  readonly isFinal?: boolean;
}

export function parseOutlineFromMarkdown<
  Node extends MarkdownExtensionNode = never,
>(
  markdown: string,
  options?: ParseOutlineFromMarkdownOptions<Node>,
): OutlineItem[] {
  const prepared =
    options?.plugins == null
      ? undefined
      : prepareMarkdownPlugins(options.plugins);
  const root = parseMarkdownAstInternal(
    markdown,
    {
      sourceIds: options?.sourceIds,
      autolink: options?.autolink,
      math: options?.math,
      footnotes: options?.footnotes,
      plugins: options?.plugins,
    },
    options?.isFinal ?? true,
  );
  return projectMarkdownHeadings(root.children, prepared).headings.map(
    ({id, label, level}) => ({id, label, level}),
  );
}
