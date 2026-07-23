// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Component doc shape + authoring factory.
 *
 * `ComponentDoc` is the type a component's `{Name}.doc.mjs` exports as `docs`.
 * `createComponentDoc()` is a typed identity - it type-checks the object
 * against `ComponentDoc` (so a bad key like `defaultValue` fails at author
 * time) and returns it unchanged. Zero runtime dependencies.
 *
 * Part of the `@astryxdesign/core/doc-types` single home for doc typing.
 */

import type {
  ComponentDoc,
  SingleComponentDoc,
  MultiComponentDoc,
  SubComponentDoc,
  ComponentRef,
  ComponentEntry,
} from '../docs-types';

export type {
  ComponentDoc,
  SingleComponentDoc,
  MultiComponentDoc,
  SubComponentDoc,
  ComponentRef,
  ComponentEntry,
};

/** Authoring factory for a component `.doc.mjs`. Type-checks + returns as-is. */
export function createComponentDoc(doc: ComponentDoc): ComponentDoc {
  return doc;
}
