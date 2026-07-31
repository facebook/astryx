// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Public re-export of the `theme` command's types.
 *
 * The source of truth is colocated with the API leaves in
 * `api/theme/theme.type.mjs` (functions own their types). This file keeps the
 * `./types/theme` consumers (and the `@astryxdesign/cli` `./json` surface)
 * resolving the same type names without duplicating the shapes.
 */

export type {
  ThemeBuildResponse,
  ThemeListEntry,
  ThemeListResponse,
  ThemeAddResponse,
} from '../api/theme/theme.type.mjs';
