// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Barrel for the `layout` command's JSON response types. The source of truth is
 * now colocated next to the API at `api/layout/layout.type.mjs`; this file just
 * re-exports it so existing `types/layout` importers keep working.
 */

export type {
  LayoutForm,
  LayoutIssue,
  LayoutBlockReference,
  LayoutExpandResponse,
  LayoutCheckResponse,
  LayoutGrammarResponse,
  LayoutResponse,
} from '../api/layout/layout.type.mjs';
