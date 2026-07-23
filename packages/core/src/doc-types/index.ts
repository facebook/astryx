// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `@astryxdesign/core/doc-types` - the single home for Astryx doc typing.
 *
 * Each shape lives in its own file (the type definition + its `create*`
 * authoring factory) and is importable directly, e.g.
 * `@astryxdesign/core/doc-types/ComponentDoc`, or in bulk from this barrel.
 * `common.ts` holds the shared building blocks (props, usage, theming, ...).
 *
 * The `create*` factories are typed identities: they type-check a `.doc.mjs`
 * object against its shape at author time (catching bad keys) and return it
 * unchanged, with zero runtime dependencies.
 *
 * `../docs-types.ts` is a thin re-export of this module for back-compat.
 */

export * from './common';
export * from './ComponentDoc';
export * from './HookDoc';
export * from './GroupDoc';
export * from './TranslationDoc';
export * from './TemplateDoc';
export * from './ReferenceDoc';
