// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Template doc shape + authoring factory.
 *
 * `TemplateDoc` documents a page or block template (`template.doc.mjs`).
 * `createTemplateDoc()` is a typed identity. Zero runtime dependencies.
 *
 * Part of the `@astryxdesign/core/doc-types` single home for doc typing.
 */

import type {
  TemplateDoc,
  PageTemplateDoc,
  BlockTemplateDoc,
  TemplateCategory,
} from '../docs-types';

export type {TemplateDoc, PageTemplateDoc, BlockTemplateDoc, TemplateCategory};

/** Authoring factory for a `template.doc.mjs`. Type-checks + returns as-is. */
export function createTemplateDoc(doc: TemplateDoc): TemplateDoc {
  return doc;
}
