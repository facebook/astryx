// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Fields shared by every authored doc kind (component + function + generic).
 *
 * `group` vs `parent` are distinct: `group` is a FLAT sidebar bucket label,
 * `parent` is a DIRECTED inheritance/composition pointer (legacy `subComponentOf`
 * is a synonym). `relatedDocs` is a single flat curated cross-reference list.
 */
export interface AstryxBaseDocInput {
  /** Name of the documented unit, without any prefix, PascalCase. Required. */
  name: string;
  /** Human-readable display name for gallery/sidebar. */
  displayName?: string;
  /** Short description. */
  description?: string;
  /** Usage documentation (description, best practices, anatomy, slotElements). */
  usage?: unknown;
  /** Flat sidebar grouping label (not an inheritance key). */
  group?: string;
  /** Overview-page functional category. */
  category?: string;
  /** CLI fuzzy-search keywords. */
  keywords?: string[];
  /** Directed inheritance/composition pointer to the doc this belongs to. */
  parent?: string;
  /** Flat curated cross-reference list of related doc names. */
  relatedDocs?: string[];
  /** Hide the whole doc from human-facing UI (stays importable/discoverable). */
  hidden?: boolean;
  /** Exclude from the categorized overview page (kept in sidebar/CLI). */
  isHiddenFromOverview?: boolean;
  /** Any additional fields the rich doc surface carries. */
  [key: string]: unknown;
}
