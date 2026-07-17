// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Public component-doc authoring API.
 *
 * A component doc describes a single component (or a family: a directory that
 * exports several related components) so the CLI and docs surfaces can list,
 * search, and render it. Historically docs were authored as a loose, untyped
 * `export const docs = {...}` object with no validation. `createDoc` brings
 * component docs into the same factory family as
 * `createConfig`/`createIntegration`/`createBlockTemplate`: a tiny runtime
 * identity helper whose real value is the exported TypeScript surface from
 * `@astryxdesign/cli/doc`, so docs get editor/type feedback without coupling to
 * CLI internals.
 *
 * Like its siblings, `createDoc` is intentionally stamp-only (here, a pure
 * identity — it returns its argument unchanged) and does NOT validate.
 * Validation happens at the LOAD boundary, where component-doc discovery runs
 * the loaded value through {@link ComponentDocSchema} (see
 * `loadModuleWithSchema`). The exported schema below IS that contract.
 */

import {z} from 'zod';

/**
 * A single documented prop. Mirrors `PropDoc` from
 * `@astryxdesign/core/docs-types`. Only `name`, `type`, and `description` are
 * required; everything else is optional. Extra fields (e.g. `slotElements`)
 * are allowed to pass through so the schema does not have to track every
 * evolution of the rich playground/element surface.
 */
const PropSchema = z
  .object({
    name: z.string().min(1, 'prop name is required'),
    type: z.string().min(1, 'prop type is required'),
    description: z.string(),
    default: z.string().optional(),
    required: z.boolean().optional(),
  })
  .passthrough();

/**
 * Fields shared by every component-doc shape. Kept deliberately permissive:
 * unlike the config/integration/template schemas (which are `.strict()` over a
 * small, fully-owned surface), a component doc has a large, still-evolving
 * field set (theming, playground, translations, element descriptors, hook
 * metadata, ...). Enumerating and locking every field would reject the current
 * loose docs, so the base shape validates the fields that actually gate
 * discovery/rendering and lets the rest pass through.
 *
 * Enumerated top-level fields observed across the existing loose docs:
 *   name, displayName, description, group, category, keywords,
 *   isHiddenFromOverview, hidden, hiddenComponents, usage, props, components,
 *   subComponentOf, playground, theming, examples, params, returns,
 *   relatedComponents, relatedHooks, importPath.
 * (`showcase` is reserved below — optional passthrough, unconsumed for now.)
 */
const BaseDocSchema = z.object({
  /** Directory/component name without any prefix, PascalCase. Required. */
  name: z.string().min(1, 'name is required'),
  /** Human-readable display name for gallery/sidebar. */
  displayName: z.string().optional(),
  /** One-line/short description. */
  description: z.string().optional(),
  /** Sidebar grouping label. */
  group: z.string().optional(),
  /** Overview-page functional category. */
  category: z.string().optional(),
  /** CLI fuzzy-search keywords. */
  keywords: z.array(z.string()).optional(),
  /** Exclude from the categorized overview page (kept in sidebar/CLI). */
  isHiddenFromOverview: z.boolean().optional(),
  /** Hide the whole component from human-facing UI (stays importable). */
  hidden: z.boolean().optional(),
  /** Sub-component names to hide from human-facing UI. */
  hiddenComponents: z.array(z.string()).optional(),
  /** Usage documentation (description, best practices, anatomy). */
  usage: z.unknown().optional(),
  /** Interactive-preview playground configuration. */
  playground: z.unknown().optional(),
  /** Theming/selector-surface metadata. */
  theming: z.unknown().optional(),
  /** Short code examples rendered after the props table. */
  examples: z.array(z.unknown()).optional(),
  /**
   * Reserved. A future task links a doc to its canonical showcase block via
   * this field; it is an optional passthrough here and is NOT consumed yet.
   */
  showcase: z.unknown().optional(),
});

/** A directory that exports a single primary component: props live inline. */
const SingleComponentDocSchema = BaseDocSchema.extend({
  props: z.array(PropSchema),
}).passthrough();

/** A directory that exports multiple components: props live on each entry. */
const MultiComponentDocSchema = BaseDocSchema.extend({
  components: z.array(z.unknown()),
}).passthrough();

/** A sub-component doc living in its own file, parented via `subComponentOf`. */
const SubComponentDocSchema = BaseDocSchema.extend({
  subComponentOf: z.string().min(1, 'subComponentOf is required'),
  description: z.string(),
  props: z.array(PropSchema),
}).passthrough();

/**
 * The LOAD-boundary contract for a component doc. A hand-written plain object
 * (the current loose `export const docs = {...}`) OR a `createDoc({...})`
 * result is accepted — discovery validates the SHAPE, not "was it made by the
 * factory". The union covers the three authored shapes:
 *   - sub-component (has `subComponentOf`)
 *   - multi-component (has `components`)
 *   - single-component (has `props`)
 *
 * `SubComponentDocSchema` is listed first so a doc that carries both
 * `subComponentOf` and `props` is validated as a sub-component (the more
 * specific shape) rather than a plain single-component doc.
 */
export const ComponentDocSchema = z.union([
  SubComponentDocSchema,
  MultiComponentDocSchema,
  SingleComponentDocSchema,
]);

/**
 * Author a component doc. Stamp-only identity: returns the def unchanged, just
 * like `createConfig`/`createIntegration`. Its value is the exported
 * TypeScript surface from `@astryxdesign/cli/doc`. Validation happens at the
 * load boundary (see `loadModuleWithSchema` + {@link ComponentDocSchema}).
 *
 * @template {import('./types/doc').AstryxComponentDoc} T
 * @param {T} def
 * @returns {T}
 */
export function createDoc(def) {
  return def;
}
