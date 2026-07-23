// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Thin re-export kept for back-compat.
 *
 * The doc-type definitions now live in `./doc-types/` — one file per shape,
 * each co-located with its `create*` authoring factory. Prefer importing from
 * `@astryxdesign/core/doc-types` (or a per-shape subpath like
 * `@astryxdesign/core/doc-types/ComponentDoc`).
 *
 * This re-export keeps existing relative imports (`../docs-types`,
 * `../../../core/src/docs-types`) and the `@astryxdesign/core` main-entry type
 * re-exports resolving during and after the migration.
 */

export * from './doc-types';
