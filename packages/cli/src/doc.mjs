// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Public doc-authoring API.
 *
 * A doc describes a documentable unit of the design system so the CLI and docs
 * surfaces can list, search, and render it. There are three kinds, each a tiny
 * runtime identity helper that stamps a `type` discriminant (mirroring how
 * `createPageTemplate`/`createBlockTemplate` stamp `type`):
 *
 *   - `createComponentDoc` -> `type: 'component'` — a component (or a family).
 *   - `createFunctionDoc`   -> `type: 'function'`  — any function, including
 *      hooks: an "inputs + outputs" surface (`params` + `returns`).
 *   - `createDoc`           -> `type: 'generic'`   — reference/topic docs.
 *
 * Like `createConfig`/`createIntegration`/`createBlockTemplate`, these factories
 * do NOT validate. Validation happens at the LOAD boundary, where doc discovery
 * runs the loaded value through {@link ComponentDocSchema}. That schema handles
 * BOTH the new stamped formats and the legacy loose `export const docs = {...}`
 * shape, so existing docs keep loading unchanged (a later PR migrates them).
 */

import {z} from 'zod';

/**
 * A single documented prop. Mirrors `PropDoc` from
 * `@astryxdesign/core/docs-types`. Only `name`, `type`, and `description` are
 * required; everything else is optional. Extra fields (e.g. `slotElements`)
 * pass through so the schema does not have to track every evolution of the
 * rich playground/element surface.
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

/** A single documented function/hook parameter (mirrors `HookParamDoc`). */
const ParamSchema = z
  .object({
    name: z.string().min(1, 'param name is required'),
    type: z.string().min(1, 'param type is required'),
    description: z.string(),
    default: z.string().optional(),
    required: z.boolean().optional(),
  })
  .passthrough();

/** A single documented function/hook return field (mirrors `HookReturnDoc`). */
const ReturnSchema = z
  .object({
    name: z.string().min(1, 'return name is required'),
    type: z.string().min(1, 'return type is required'),
    description: z.string(),
  })
  .passthrough();

/**
 * Fields shared by every doc kind. Deliberately permissive on the rich blobs
 * (usage/theming/playground) — those are large and still evolving, so they are
 * `z.unknown()` passthrough rather than enumerated.
 *
 * `group` vs `parent` are distinct concepts and intentionally separate fields:
 *   - `group` is a FLAT sidebar bucket label. Many docs can share a group; it
 *     is not an inheritance key.
 *   - `parent` is a DIRECTED inheritance/composition pointer — a doc naming the
 *     doc it belongs to (e.g. a sub-component naming its parent component). The
 *     legacy `subComponentOf` field is a synonym; both map to the same concept.
 *
 * `relatedDocs` is a single flat curated cross-reference list. It replaces the
 * legacy split `relatedComponents` + `relatedHooks`; a downstream reader can
 * merge the legacy pair into it.
 */
const BaseDocFields = {
  /** Name of the documented unit, without any prefix. Required. */
  name: z.string().min(1, 'name is required'),
  /** Human-readable display name for gallery/sidebar. */
  displayName: z.string().optional(),
  /** One-line/short description. */
  description: z.string().optional(),
  /** Usage documentation (description, best practices, anatomy, slotElements). */
  usage: z.unknown().optional(),
  /** Flat sidebar grouping label (not an inheritance key). */
  group: z.string().optional(),
  /** Overview-page functional category. */
  category: z.string().optional(),
  /** CLI fuzzy-search keywords. */
  keywords: z.array(z.string()).optional(),
  /** Directed inheritance/composition pointer to the doc this belongs to. */
  parent: z.string().optional(),
  /** Flat curated cross-reference list of related doc names. */
  relatedDocs: z.array(z.string()).optional(),
  /** Hide the whole doc from human-facing UI (stays importable/discoverable). */
  hidden: z.boolean().optional(),
  /** Exclude from the categorized overview page (kept in sidebar/CLI). */
  isHiddenFromOverview: z.boolean().optional(),
};

/**
 * New-format schema for a stamped component doc (`type: 'component'`). The
 * top-level component keys are enumerated, but nested blobs stay loose so real
 * docs are not rejected. `.passthrough()` keeps unknown top-level fields
 * (translations, element descriptors, ...) flowing through.
 */
export const ComponentDocKindSchema = z
  .object({
    ...BaseDocFields,
    type: z.literal('component'),
    props: z.array(PropSchema),
    theming: z.unknown().optional(),
    playground: z.unknown().optional(),
    examples: z.array(z.unknown()).optional(),
  })
  .passthrough();

/**
 * New-format schema for a stamped function doc (`type: 'function'`). Covers any
 * function, including hooks: an inputs (`params`) + outputs (`returns`) surface.
 */
export const FunctionDocKindSchema = z
  .object({
    ...BaseDocFields,
    type: z.literal('function'),
    params: z.array(ParamSchema),
    returns: z.array(ReturnSchema),
  })
  .passthrough();

/**
 * New-format schema for a stamped generic doc (`type: 'generic'`) — reference
 * and topic docs. Just the shared base plus the discriminant.
 */
export const GenericDocKindSchema = z
  .object({
    ...BaseDocFields,
    type: z.literal('generic'),
  })
  .passthrough();

/**
 * The stamped-doc contract: one of the three new per-kind schemas, discriminated
 * by the injected `type`. Used when a loaded doc carries a `type` field.
 */
export const StampedDocSchema = z.discriminatedUnion('type', [
  ComponentDocKindSchema,
  FunctionDocKindSchema,
  GenericDocKindSchema,
]);

// ── Legacy loose format (unchanged, kept for back-compat) ─────────────
//
// The pre-factory docs are authored as a loose, untyped object with no `type`
// discriminant and validated by shape. Enumerated top-level fields observed
// across the existing loose docs:
//   name, displayName, description, group, category, keywords,
//   isHiddenFromOverview, hidden, hiddenComponents, usage, props, components,
//   subComponentOf, playground, theming, examples, params, returns,
//   relatedComponents, relatedHooks, relatedDocs, parent, importPath.

const LegacyBaseDocSchema = z.object({
  name: z.string().min(1, 'name is required'),
  displayName: z.string().optional(),
  description: z.string().optional(),
  group: z.string().optional(),
  category: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  isHiddenFromOverview: z.boolean().optional(),
  hidden: z.boolean().optional(),
  hiddenComponents: z.array(z.string()).optional(),
  usage: z.unknown().optional(),
  playground: z.unknown().optional(),
  theming: z.unknown().optional(),
  examples: z.array(z.unknown()).optional(),
  showcase: z.unknown().optional(),
  // `parent` and legacy `subComponentOf` are synonyms; both accepted here so a
  // parent-based doc that omits a stamped `type` still validates.
  parent: z.string().optional(),
  relatedDocs: z.array(z.string()).optional(),
  relatedComponents: z.array(z.string()).optional(),
  relatedHooks: z.array(z.string()).optional(),
});

/** Legacy: directory exporting a single primary component (props inline). */
const LegacySingleComponentDocSchema = LegacyBaseDocSchema.extend({
  props: z.array(PropSchema),
}).passthrough();

/** Legacy: directory exporting multiple components (props on each entry). */
const LegacyMultiComponentDocSchema = LegacyBaseDocSchema.extend({
  components: z.array(z.unknown()),
}).passthrough();

/** Legacy: a standalone hook doc — inputs (`params`) + outputs (`returns`). */
const LegacyHookDocSchema = LegacyBaseDocSchema.extend({
  params: z.array(ParamSchema),
  returns: z.array(ReturnSchema),
}).passthrough();

/** Legacy: a sub-component doc parented via `subComponentOf`. */
const LegacySubComponentDocSchema = LegacyBaseDocSchema.extend({
  subComponentOf: z.string().min(1, 'subComponentOf is required'),
  description: z.string(),
  props: z.array(PropSchema),
}).passthrough();

/**
 * The permissive legacy union. `subComponentOf` is listed first so a doc that
 * carries both `subComponentOf` and `props` is validated as a sub-component
 * (the more specific shape); hook (`params`/`returns`) before multi/single.
 */
export const LegacyDocSchema = z.union([
  LegacySubComponentDocSchema,
  LegacyHookDocSchema,
  LegacyMultiComponentDocSchema,
  LegacySingleComponentDocSchema,
]);

/**
 * The LOAD-boundary contract for a doc. Handles BOTH formats:
 *   - NEW: a stamped doc (`type: 'component' | 'function' | 'generic'`,
 *     produced by the factories below) is validated against the matching
 *     per-kind schema in {@link StampedDocSchema}.
 *   - OLD: a loose, unstamped doc is validated against the permissive
 *     {@link LegacyDocSchema} union (the three legacy shapes + standalone hook).
 *
 * Discovery validates the SHAPE, not "was it made by the factory". This PR does
 * NOT migrate real docs; a later PR does. Both formats normalize into the same
 * internal shape consumers already expect.
 */
export const ComponentDocSchema = z.union([StampedDocSchema, LegacyDocSchema]);

/**
 * Author a component doc. Stamp-only: returns the def with `type: 'component'`
 * injected. Validation happens at the load boundary.
 *
 * @template {import('./types/doc').AstryxComponentDocInput} T
 * @param {T} def
 * @returns {T & {type: 'component'}}
 */
export function createComponentDoc(def) {
  return /** @type {T & {type: 'component'}} */ ({...def, type: 'component'});
}

/**
 * Author a function doc (covers any function, including hooks). Stamp-only:
 * returns the def with `type: 'function'` injected. Validation happens at the
 * load boundary.
 *
 * @template {import('./types/doc').AstryxFunctionDocInput} T
 * @param {T} def
 * @returns {T & {type: 'function'}}
 */
export function createFunctionDoc(def) {
  return /** @type {T & {type: 'function'}} */ ({...def, type: 'function'});
}

/**
 * Author a generic reference/topic doc. Stamp-only: returns the def with
 * `type: 'generic'` injected. Validation happens at the load boundary.
 *
 * @template {import('./types/doc').AstryxGenericDocInput} T
 * @param {T} def
 * @returns {T & {type: 'generic'}}
 */
export function createDoc(def) {
  return /** @type {T & {type: 'generic'}} */ ({...def, type: 'generic'});
}
