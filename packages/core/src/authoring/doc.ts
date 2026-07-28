// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file doc.ts
 * @input A component/function/generic doc object (without the `type` tag).
 * @output Type-preserving `createComponentDoc`/`createFunctionDoc`/`createDoc`
 *   helpers plus the doc-authoring TypeScript surface.
 * @position Integration-author authoring surface. See `./index.ts` for why
 *   these authoring factories live in `@astryxdesign/core`.
 *
 * A doc describes a documentable unit of the design system so the CLI and docs
 * surfaces can list, search, and render it. There are three kinds, each a tiny
 * runtime identity helper that stamps a `type` discriminant:
 *
 *   - `createComponentDoc` -> `type: 'component'` — a component (or a family).
 *   - `createFunctionDoc`  -> `type: 'function'`  — any function, including
 *      hooks: an "inputs + outputs" surface (`params` + `returns`).
 *   - `createDoc`          -> `type: 'generic'`   — reference/topic docs.
 *
 * These factories do NOT validate. Validation happens at the CLI load boundary,
 * where doc discovery runs the loaded value through a schema that accepts BOTH
 * the stamped formats and the legacy loose `export const docs = {...}` shape.
 */

/**
 * Fields shared by every doc kind (component + function + generic).
 *
 * `group` vs `parent` are distinct:
 *   - `group` is a FLAT sidebar bucket label; many docs can share it and it is
 *     NOT an inheritance key.
 *   - `parent` is a DIRECTED inheritance/composition pointer — a doc naming the
 *     doc it belongs to (e.g. a sub-component naming its parent component). The
 *     legacy `subComponentOf` field is a synonym.
 *
 * `relatedDocs` is a single flat curated cross-reference list; it replaces the
 * legacy split `relatedComponents` + `relatedHooks`.
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

/** A single documented prop (mirrors `PropDoc` from core docs-types). */
export interface AstryxPropInput {
  name: string;
  type: string;
  description: string;
  default?: string;
  required?: boolean;
  [key: string]: unknown;
}

/** A single documented param (mirrors `HookParamDoc`). */
export interface AstryxParamInput {
  name: string;
  type: string;
  description: string;
  default?: string;
  required?: boolean;
  [key: string]: unknown;
}

/** A single documented return field (mirrors `HookReturnDoc`). */
export interface AstryxReturnInput {
  name: string;
  type: string;
  description: string;
  [key: string]: unknown;
}

/**
 * Input accepted by {@link createComponentDoc}. A component (or a family). The
 * `type` discriminant is injected by the factory. `anatomy`/`slotElements` live
 * inside `usage`; `importPath` is DERIVED (never authored).
 */
export interface AstryxComponentDocInput extends AstryxBaseDocInput {
  /** All public props for the component. */
  props: AstryxPropInput[];
  /** Theming/selector-surface metadata. */
  theming?: unknown;
  /** Interactive-preview playground configuration. */
  playground?: unknown;
  /** Short code examples rendered after the props table. */
  examples?: unknown[];
}

/**
 * Input accepted by {@link createFunctionDoc}. Covers any function, including
 * hooks: an inputs (`params`) + outputs (`returns`) surface. The `type`
 * discriminant is injected by the factory; `importPath` is DERIVED.
 */
export interface AstryxFunctionDocInput extends AstryxBaseDocInput {
  /** Function/hook parameters or options-object fields. */
  params: AstryxParamInput[];
  /** Return value documentation. One entry per field (or a single primitive). */
  returns: AstryxReturnInput[];
}

/**
 * Input accepted by {@link createDoc}. A generic reference/topic doc — just the
 * shared base. The `type` discriminant is injected by the factory.
 */
export type AstryxGenericDocInput = AstryxBaseDocInput;

/**
 * Back-compat alias. Previously `createDoc` accepted a broad component-doc
 * record; the union of the three input kinds preserves that permissiveness for
 * any code referring to the old name.
 */
export type AstryxComponentDoc =
  AstryxComponentDocInput | AstryxFunctionDocInput | AstryxGenericDocInput;

/**
 * Author a component doc. Stamp-only: returns the def with `type: 'component'`
 * injected. Validation happens at the CLI load boundary.
 */
export function createComponentDoc<T extends AstryxComponentDocInput>(
  def: T,
): T & {type: 'component'} {
  return {...def, type: 'component'};
}

/**
 * Author a function doc (covers any function, including hooks). Stamp-only:
 * returns the def with `type: 'function'` injected. Validation happens at the
 * CLI load boundary.
 */
export function createFunctionDoc<T extends AstryxFunctionDocInput>(
  def: T,
): T & {type: 'function'} {
  return {...def, type: 'function'};
}

/**
 * Author a generic reference/topic doc. Stamp-only: returns the def with
 * `type: 'generic'` injected. Validation happens at the CLI load boundary.
 */
export function createDoc<T extends AstryxGenericDocInput>(
  def: T,
): T & {type: 'generic'} {
  return {...def, type: 'generic'};
}
