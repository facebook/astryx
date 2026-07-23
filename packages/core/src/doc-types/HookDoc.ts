// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Hook doc shape + authoring factory.
 *
 * `HookDoc` documents a hook (params / returns) instead of a component's props.
 * `createHookDoc()` is a typed identity. Zero runtime dependencies.
 *
 * Part of the `@astryxdesign/core/doc-types` single home for doc typing.
 */

import type {
  HookDoc,
  HookParamDoc,
  HookReturnDoc,
  HookTranslationDoc,
} from '../docs-types';

export type {HookDoc, HookParamDoc, HookReturnDoc, HookTranslationDoc};

/** Authoring factory for a hook `.doc.mjs`. Type-checks + returns as-is. */
export function createHookDoc(doc: HookDoc): HookDoc {
  return doc;
}
