// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Auto-links bare component and hook names in authored `.doc.mjs` prose to
 * their doc pages, reusing the changelog's `linkifyComponents` so both surfaces
 * share one linkifier and one mental model. Runs on the server, before the
 * sections reach renderInlineMarkdown, so nothing extra ships to the client.
 *
 * Labels are emitted as code spans, giving the monospace API references the
 * docs want; renderInlineMarkdown renders that shape as a monospace link.
 *
 * Authors opt a mention out by writing it as a code span — `linkifyComponents`
 * treats code spans and existing links as opaque.
 */

import {linkifyComponents} from '../changelogLinkify';
import type {ContentBlock, DocSection} from '../../generated/docsRegistry';

function linkifyBlock(block: ContentBlock, names: string[]): ContentBlock {
  const linkify = (text: string) =>
    linkifyComponents(text, names, {monospace: true});

  switch (block.type) {
    case 'prose':
      return block.text == null ? block : {...block, text: linkify(block.text)};
    case 'list':
      return block.items == null
        ? block
        : {...block, items: block.items.map(linkify)};
    case 'table':
      // Column headers render as raw labels, not inline markdown — cells only.
      return block.rows == null
        ? block
        : {...block, rows: block.rows.map(row => row.map(linkify))};
    default:
      // Headings and code blocks render verbatim; anything else is untouched.
      return block;
  }
}

/** Auto-link component names across a topic's sections. Never mutates input. */
export function linkifyDocSections(
  sections: DocSection[],
  componentNames: string[],
): DocSection[] {
  if (componentNames.length === 0) {
    return sections;
  }

  return sections.map(section => ({
    ...section,
    content: section.content.map(block => linkifyBlock(block, componentNames)),
  }));
}
