// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file footnoteProjection.ts
 * @input Transformed canonical Markdown blocks and the matching heading projection
 * @output Stable resolved-footnote numbers, fragment ids, and backlink relationships
 * @position Internal document-identity owner shared by source and prepared rendering
 */

import type {
  MarkdownAstBlockContent,
  MarkdownAstFootnoteDefinition,
  MarkdownAstFootnoteReference,
  MarkdownAstNodeBase,
} from './ast';
import type {MarkdownHeadingProjection} from './headingProjection';
import {slugify, uniqueSlug} from './parser';
import type {MarkdownExtensionNode} from './plugins/protocol';

export interface ProjectedMarkdownFootnoteReference {
  readonly node: MarkdownAstFootnoteReference;
  readonly number: number;
  readonly id: string;
  readonly definitionId: string;
}

export interface ProjectedMarkdownFootnoteDefinition {
  readonly node: MarkdownAstFootnoteDefinition<MarkdownExtensionNode>;
  readonly number: number;
  readonly id: string;
  readonly references: ReadonlyArray<ProjectedMarkdownFootnoteReference>;
}

export interface MarkdownFootnoteProjection {
  readonly references: ReadonlyMap<
    MarkdownAstFootnoteReference,
    ProjectedMarkdownFootnoteReference
  >;
  readonly definitions: ReadonlyMap<
    MarkdownAstFootnoteDefinition<MarkdownExtensionNode>,
    ProjectedMarkdownFootnoteDefinition
  >;
  readonly orderedDefinitions: ReadonlyArray<ProjectedMarkdownFootnoteDefinition>;
}

function visitReferences(
  node: MarkdownAstNodeBase & {readonly type: string},
  visit: (reference: MarkdownAstFootnoteReference) => void,
): void {
  if (node.type === 'footnoteDefinition') {
    return;
  }
  if (node.type === 'footnoteReference') {
    visit(node as MarkdownAstFootnoteReference);
    return;
  }
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child != null && typeof child === 'object') {
        visitReferences(
          child as MarkdownAstNodeBase & {readonly type: string},
          visit,
        );
      }
    }
  }
}

/** Project all rendered footnote relationships after native transforms. */
export function projectMarkdownFootnotes(
  blocks: ReadonlyArray<MarkdownAstBlockContent<MarkdownExtensionNode>>,
  headingProjection: MarkdownHeadingProjection | undefined,
): MarkdownFootnoteProjection {
  const definitionsByIdentifier = new Map<
    string,
    MarkdownAstFootnoteDefinition<MarkdownExtensionNode>
  >();
  for (const block of blocks) {
    if (
      block.type === 'footnoteDefinition' &&
      !definitionsByIdentifier.has(block.identifier)
    ) {
      definitionsByIdentifier.set(block.identifier, block);
    }
  }

  const referenceNodes = new Map<string, MarkdownAstFootnoteReference[]>();
  const orderedIdentifiers: string[] = [];
  for (const block of blocks) {
    visitReferences(block, reference => {
      if (!definitionsByIdentifier.has(reference.identifier)) {
        return;
      }
      const existing = referenceNodes.get(reference.identifier);
      if (existing == null) {
        referenceNodes.set(reference.identifier, [reference]);
        orderedIdentifiers.push(reference.identifier);
      } else {
        existing.push(reference);
      }
    });
  }

  const allocatedIds = new Map<string, number>();
  for (const id of headingProjection?.ids.values() ?? []) {
    allocatedIds.set(id, 1);
  }

  const definitionIds = new Map<string, string>();
  for (const identifier of orderedIdentifiers) {
    const labelSlug = slugify(identifier) || 'note';
    definitionIds.set(
      identifier,
      uniqueSlug(`footnote-${labelSlug}`, allocatedIds),
    );
  }

  const references = new Map<
    MarkdownAstFootnoteReference,
    ProjectedMarkdownFootnoteReference
  >();
  const definitions = new Map<
    MarkdownAstFootnoteDefinition<MarkdownExtensionNode>,
    ProjectedMarkdownFootnoteDefinition
  >();
  const orderedDefinitions: ProjectedMarkdownFootnoteDefinition[] = [];

  for (let index = 0; index < orderedIdentifiers.length; index++) {
    const identifier = orderedIdentifiers[index];
    const definition = definitionsByIdentifier.get(identifier);
    const definitionId = definitionIds.get(identifier);
    if (definition == null || definitionId == null) {
      continue;
    }
    const number = index + 1;
    const projectedReferences = (referenceNodes.get(identifier) ?? []).map(
      node => {
        const reference = {
          node,
          number,
          id: uniqueSlug(
            `footnote-reference-${slugify(identifier) || 'note'}`,
            allocatedIds,
          ),
          definitionId,
        } satisfies ProjectedMarkdownFootnoteReference;
        references.set(node, reference);
        return reference;
      },
    );
    const projectedDefinition = {
      node: definition,
      number,
      id: definitionId,
      references: projectedReferences,
    } satisfies ProjectedMarkdownFootnoteDefinition;
    definitions.set(definition, projectedDefinition);
    orderedDefinitions.push(projectedDefinition);
  }

  return {references, definitions, orderedDefinitions};
}
