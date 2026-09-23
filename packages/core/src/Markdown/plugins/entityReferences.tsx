// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file entityReferences.tsx
 * @input A finite entity catalog and `@{id}` references in eligible prose
 * @output A configurable first-party transform plugin with typed inline rendering
 * @position Optional Markdown entity-link behavior built only on the public plugin protocol
 */

import type React from 'react';
import {isSafeMarkdownParserUrl} from '../url';
import {
  createMarkdownPlugin,
  type MarkdownExtensionNode,
  type MarkdownPluginEntry,
} from './protocol';
import {createMarkdownTextTransform} from './textTransform';

export interface MarkdownEntityReference {
  readonly id: string;
  readonly label: string;
  readonly href?: string;
}

export interface MarkdownEntityReferencesOptions {
  readonly references: ReadonlyArray<MarkdownEntityReference>;
  /** Optional application rendering; omitted references render their label. */
  readonly render?: (reference: MarkdownEntityReference) => React.ReactNode;
}

export type MarkdownEntityReferenceNode = MarkdownExtensionNode<
  'entity-references',
  'entity-reference',
  {
    readonly id: string;
    readonly label: string;
    readonly href?: string;
  },
  'inline'
>;

const REFERENCE_PATTERN = /@\{([^{}\r\n]+)\}/g;

/** Creates an `@{id}` reference plugin backed by a caller-owned entity catalog. */
export function createMarkdownEntityReferencesPlugin({
  references,
  render,
}: MarkdownEntityReferencesOptions): MarkdownPluginEntry<MarkdownEntityReferenceNode> {
  const entities = new Map<string, MarkdownEntityReference>();
  for (const reference of references) {
    if (
      reference.id.trim() === '' ||
      reference.label.trim() === '' ||
      reference.id !== reference.id.trim() ||
      reference.id.includes('{') ||
      reference.id.includes('}') ||
      reference.id.includes('\n') ||
      reference.id.includes('\r') ||
      (reference.href != null &&
        (reference.href === '' || !isSafeMarkdownParserUrl(reference.href)))
    ) {
      throw new TypeError(
        'Markdown entity references require a non-empty single-line id and label',
      );
    }
    if (entities.has(reference.id)) {
      throw new TypeError(
        `Duplicate Markdown entity reference: ${reference.id}`,
      );
    }
    entities.set(reference.id, Object.freeze({...reference}));
  }

  return createMarkdownPlugin<'entity-references', MarkdownEntityReferenceNode>(
    {
      name: 'entity-references',
      apiVersion: 1,
      transform: createMarkdownTextTransform<MarkdownEntityReferenceNode>({
        pattern: REFERENCE_PATTERN,
        requiredSubstrings: ['@{'],
        getEndIndex: (_text, match) =>
          entities.has(match[1]) ? match.index + match[0].length : false,
        replace: match => {
          const reference = entities.get(match[1]);
          if (reference == null) {
            throw new TypeError('Markdown entity reference resolution changed');
          }
          return {
            type: 'extension',
            plugin: 'entity-references',
            name: 'entity-reference',
            display: 'inline',
            data: {
              id: reference.id,
              label: reference.label,
              ...(reference.href == null ? null : {href: reference.href}),
            },
          };
        },
      }),
      renderers: {
        'entity-reference': {
          render: ({node}): React.ReactNode =>
            render === undefined ? node.data.label : render(node.data),
          toText: node => node.data.label,
        },
      },
    },
  );
}
