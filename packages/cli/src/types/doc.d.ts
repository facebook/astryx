// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Authoring surface for Astryx component docs, exported from
 * `@astryxdesign/cli/doc`.
 *
 * A component doc lives in a `{Name}.doc.{ts,mjs,js}` file. Authors either
 * default-export a `createDoc({...})` result (preferred) or, for the current
 * loose docs, name-export `docs`/`doc`. The doc's shape is validated at the
 * load boundary against `ComponentDocSchema` (see `doc.mjs`).
 *
 * The canonical, fully-detailed field documentation lives on the
 * `ComponentDoc` union in `@astryxdesign/core/docs-types`. This file re-exports
 * that surface as the `createDoc` input type so doc authoring gets the same
 * editor/type feedback without the CLI hard-coupling to core internals. If the
 * core type surface is unavailable in an author's environment, the input
 * gracefully falls back to a permissive record.
 */

/**
 * Input accepted by {@link createDoc}. This is the `ComponentDoc` union — a
 * single-component doc (props inline), a multi-component doc (`components`), or
 * a sub-component doc (`subComponentOf`). Kept as a broad record so authoring
 * never fails to typecheck when the core docs-types package is not resolvable;
 * the precise per-field guidance comes from `@astryxdesign/core/docs-types`.
 */
export interface AstryxComponentDoc {
  /** Component/directory name without any prefix, PascalCase. Required. */
  name: string;
  /** Human-readable display name for gallery/sidebar. */
  displayName?: string;
  /** Short description. */
  description?: string;
  /** Sidebar grouping label. */
  group?: string;
  /** Overview-page functional category. */
  category?: string;
  /** CLI fuzzy-search keywords. */
  keywords?: string[];
  /** Exclude from the categorized overview page (kept in sidebar/CLI). */
  isHiddenFromOverview?: boolean;
  /** Hide the whole component from human-facing UI (stays importable). */
  hidden?: boolean;
  /** Sub-component names to hide from human-facing UI. */
  hiddenComponents?: string[];
  /** Name of the parent component, for a sub-component doc. */
  subComponentOf?: string;
  /**
   * Reserved. A future task links a doc to its canonical showcase block via
   * this field; it is optional and unconsumed for now.
   */
  showcase?: unknown;
  /** Any additional fields the rich doc surface carries (usage, props,
   *  components, playground, theming, examples, hook metadata, ...). */
  [key: string]: unknown;
}

export declare function createDoc<T extends AstryxComponentDoc>(def: T): T;
