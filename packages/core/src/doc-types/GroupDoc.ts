// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Group doc shape + authoring factory.
 *
 * `GroupDoc` is category metadata for a cluster of related components (the
 * canonical component a group label links to). `createGroupDoc()` is a typed
 * identity. Zero runtime dependencies.
 *
 * Part of the `@astryxdesign/core/doc-types` single home for doc typing.
 */

import type {GroupDoc} from '../docs-types';

export type {GroupDoc};

/** Authoring factory for a single group doc entry. Type-checks + returns as-is. */
export function createGroupDoc(doc: GroupDoc): GroupDoc {
  return doc;
}
