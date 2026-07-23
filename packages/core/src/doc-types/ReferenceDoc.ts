// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Reference doc shape + authoring factory.
 *
 * `ReferenceDoc` is a long-form documentation topic (sections of content
 * blocks), e.g. the CLI `docs/<topic>.doc.mjs` files. `createReferenceDoc()`
 * is a typed identity. Zero runtime dependencies.
 *
 * Part of the `@astryxdesign/core/doc-types` single home for doc typing.
 */

import type {
  ReferenceDoc,
  ReferenceSection,
  ReferenceTranslationDoc,
  ContentBlock,
  TokenPreviewType,
} from '../docs-types';

export type {
  ReferenceDoc,
  ReferenceSection,
  ReferenceTranslationDoc,
  ContentBlock,
  TokenPreviewType,
};

/** Authoring factory for a reference `.doc.mjs` topic. Type-checks + returns as-is. */
export function createReferenceDoc(doc: ReferenceDoc): ReferenceDoc {
  return doc;
}
