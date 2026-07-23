// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `@astryxdesign/core/doc-types` - the single home for Astryx doc typing.
 *
 * Each shape lives in its own file (type + `create*` authoring factory) and is
 * importable directly, e.g. `@astryxdesign/core/doc-types/ComponentDoc`, or in
 * bulk from this barrel. The `create*` factories are typed identities: they
 * type-check a `.doc.mjs` object against its shape at author time (catching
 * bad keys) and return it unchanged, with zero runtime dependencies.
 *
 * NOTE (migration): the type definitions currently still live in
 * ../docs-types.ts and are re-exported here. A follow-up relocates them into
 * these files and turns ../docs-types.ts into a thin re-export.
 */

export * from './common';
export * from './ComponentDoc';
export * from './HookDoc';
export * from './GroupDoc';
export * from './TranslationDoc';
export * from './TemplateDoc';
export * from './ReferenceDoc';
