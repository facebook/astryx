// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file headingProjection.ts
 * @input Canonical Markdown blocks and prepared extension text projections
 * @output Shared top-level heading labels, levels, ids, and node identity map
 * @position Internal heading-identity owner shared by Markdown and Outline
 */

import {markdownAstText} from './ast';
import type {MarkdownAstBlockContent, MarkdownAstHeading} from './ast';
import {slugify, uniqueSlug} from './parser';
import {
  markdownExtensionText,
  type MarkdownExtensionNode,
  type PreparedMarkdownPlugins,
} from './plugins/protocol';

export interface ProjectedMarkdownHeading {
  readonly node: MarkdownAstHeading<MarkdownExtensionNode>;
  readonly id: string;
  readonly label: string;
  readonly level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface MarkdownHeadingProjection {
  readonly headings: ReadonlyArray<ProjectedMarkdownHeading>;
  readonly ids: ReadonlyMap<
    MarkdownAstBlockContent<MarkdownExtensionNode>,
    string
  >;
}

/** Project top-level heading identity once for rendering and navigation. */
export function projectMarkdownHeadings(
  blocks: ReadonlyArray<MarkdownAstBlockContent<MarkdownExtensionNode>>,
  preparedPlugins?: PreparedMarkdownPlugins,
): MarkdownHeadingProjection {
  const counts = new Map<string, number>();
  const headings: ProjectedMarkdownHeading[] = [];
  const ids = new Map<MarkdownAstBlockContent<MarkdownExtensionNode>, string>();

  for (const block of blocks) {
    if (block.type !== 'heading') {
      continue;
    }
    const label = markdownAstText(block.children, node =>
      markdownExtensionText(preparedPlugins, node),
    ).trim();
    const id = uniqueSlug(slugify(label), counts);
    headings.push({node: block, id, label, level: block.depth});
    ids.set(block, id);
  }

  return {headings, ids};
}
