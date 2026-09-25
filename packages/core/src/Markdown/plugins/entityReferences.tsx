// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file entityReferences.tsx
 * @input Ordered regex matchers that synchronously resolve eligible prose spans
 * @output A configurable first-party transform plugin with typed inline rendering
 * @position Optional Markdown entity-reference behavior built only on the public plugin protocol
 */

import type React from 'react';
import {isSafeMarkdownParserUrl} from '../url';
import {
  composeMarkdownTransforms,
  createMarkdownPlugin,
  type MarkdownExtensionNode,
  type MarkdownPluginEntry,
  type MarkdownTransform,
} from './protocol';
import {createMarkdownTextTransform} from './textTransform';

export interface MarkdownEntityReference {
  readonly id: string;
  readonly label: string;
  readonly href?: string;
}

export interface MarkdownEntityReferenceMatcher {
  /** A global expression matched against eligible built-in prose only. */
  readonly pattern: RegExp;
  /**
   * Conservative literal hints used to skip this matcher when none are present.
   * Omit when no safe literal exists.
   */
  readonly requiredSubstrings?: readonly [string, ...string[]];
  /** Returns a reference for this match, or null to leave it for later matchers. */
  readonly resolve: (match: RegExpExecArray) => MarkdownEntityReference | null;
}

export interface MarkdownEntityReferencesOptions {
  /** Ordered matchers; an earlier claimed span is opaque to later matchers. */
  readonly matchers: ReadonlyArray<MarkdownEntityReferenceMatcher>;
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

function normalizeReference(
  reference: MarkdownEntityReference,
): Readonly<MarkdownEntityReference> {
  if (
    reference == null ||
    typeof reference.id !== 'string' ||
    typeof reference.label !== 'string' ||
    reference.id.trim() === '' ||
    reference.label.trim() === '' ||
    reference.id !== reference.id.trim() ||
    (reference.href != null &&
      (typeof reference.href !== 'string' ||
        reference.href === '' ||
        !isSafeMarkdownParserUrl(reference.href)))
  ) {
    throw new TypeError(
      'Markdown entity references require a non-empty id and label plus an optional safe href',
    );
  }
  return Object.freeze({
    id: reference.id,
    label: reference.label,
    ...(reference.href == null ? null : {href: reference.href}),
  });
}

function createMatcherTransform(
  matcher: MarkdownEntityReferenceMatcher,
): MarkdownTransform<MarkdownEntityReferenceNode> {
  const resolvedMatches = new WeakMap<
    RegExpExecArray,
    Readonly<MarkdownEntityReference>
  >();
  return createMarkdownTextTransform<MarkdownEntityReferenceNode>({
    pattern: matcher.pattern,
    requiredSubstrings: matcher.requiredSubstrings,
    getEndIndex: (_text, match) => {
      if (match[0].length === 0) {
        throw new TypeError(
          'Markdown entity reference matchers must consume source text',
        );
      }
      const resolved = matcher.resolve(match) as unknown;
      if (
        resolved != null &&
        typeof resolved === 'object' &&
        typeof (resolved as {then?: unknown}).then === 'function'
      ) {
        void Promise.resolve(resolved).catch(() => {});
        throw new TypeError(
          'Async Markdown entity reference resolution is not supported',
        );
      }
      if (resolved == null) {
        return false;
      }
      resolvedMatches.set(
        match,
        normalizeReference(resolved as MarkdownEntityReference),
      );
      return match.index + match[0].length;
    },
    replace: match => {
      const reference = resolvedMatches.get(match);
      if (reference == null) {
        throw new TypeError('Markdown entity reference resolution changed');
      }
      resolvedMatches.delete(match);
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
  });
}

/** Creates an entity-reference plugin from ordered synchronous matchers. */
export function markdownEntityReferencesPlugin({
  matchers,
  render,
}: MarkdownEntityReferencesOptions): MarkdownPluginEntry<MarkdownEntityReferenceNode> {
  if (!Array.isArray(matchers) || matchers.length === 0) {
    throw new TypeError(
      'Markdown entity references require at least one matcher',
    );
  }
  const transforms = matchers.map(createMatcherTransform);

  return createMarkdownPlugin<'entity-references', MarkdownEntityReferenceNode>(
    {
      name: 'entity-references',
      apiVersion: 1,
      transform: composeMarkdownTransforms(transforms),
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
