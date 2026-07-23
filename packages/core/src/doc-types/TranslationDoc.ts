// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Translation overlay shape + authoring factory.
 *
 * `TranslationDoc` is the overlay a `.doc.mjs` exports as `docsZh` / `docsDense`
 * - only the prose fields that change per language/format; props, types, and
 * defaults come from the base `docs`. `createTranslationDoc()` is a typed
 * identity. Zero runtime dependencies.
 *
 * Part of the `@astryxdesign/core/doc-types` single home for doc typing.
 */

import type {TranslationDoc} from '../docs-types';

export type {TranslationDoc};

/** Authoring factory for a `docsZh` / `docsDense` overlay. Type-checks + returns as-is. */
export function createTranslationDoc(doc: TranslationDoc): TranslationDoc {
  return doc;
}
