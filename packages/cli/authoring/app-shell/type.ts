// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Public type surface for an Astryx app shell — the module an integration points
 * its manifest `appShell` at (sibling-resolved from
 * `astryx.integration.{ts,mjs,js}`).
 *
 * Page templates are CONTENT-ONLY by rule: they root at `Layout` (or `Center`)
 * and never render their own `AppShell`, because the host owns the chrome. That
 * makes the shell a single swappable layer. Astryx core provides the default
 * (`AppShell`); declaring `appShell` replaces it with your own, so
 * `astryx template <id> --with-shell` emits every template inside YOUR shell.
 *
 * This is a pure output-layer: it never edits the on-disk template source, only
 * the string the CLI shows or scaffolds. It is opt-in — without `--with-shell`
 * the CLI emits the bare, content-only template.
 *
 * Authors write a plain object against {@link AstryxAppShell} and default-export
 * it; the CLI validates it via `parseAppShell` at the load boundary.
 */

/**
 * A statically-declarable JSX attribute value for a shell prop. Primitives, or
 * JSON-shaped objects/arrays (rendered as object/array literals). Deliberately
 * excludes functions, `ReactNode`, and references to imported values — those are
 * not statically expressible.
 */
export type AppShellPropValue =
  | string
  | number
  | boolean
  | null
  | AppShellPropValue[]
  | {[key: string]: AppShellPropValue};

/**
 * The subset of a component's props that can be expressed as a STATIC JSX
 * attribute literal — props whose type is assignable to {@link
 * AppShellPropValue} (primitives + JSON objects/arrays). Non-serializable props
 * (functions, `ReactNode`, class instances) are excluded from the allowed keys
 * entirely, so a shell can only set props it can actually render, and typos /
 * wrong value types are compile errors.
 */
export type StaticProps<P> = {
  [
    K in keyof P as NonNullable<P[K]> extends AppShellPropValue ? K : never
  ]?: Extract<P[K], AppShellPropValue>;
};

/**
 * The app shell an integration provides. Naming the component and the module it
 * comes from is the whole contract: the CLI wraps the template's default-export
 * JSX in it and adds the matching import as one unit, so the shell can never be
 * emitted un-imported, and re-emitting never double-wraps.
 *
 * Parameterize with the shell's props type for fully type-safe {@link props}:
 * `satisfies AstryxAppShell<MetaAppFrameProps>`.
 *
 * @template ShellProps the shell component's props (for typed `props`)
 *
 * @example
 * ```
 * // app-shell.mjs
 * export default {
 *   component: 'MetaAppFrame',
 *   from: '@xds/meta',
 *   description: 'internal shell: nav, search, and the standard app chrome',
 * };
 * ```
 */
export interface AstryxAppShell<
  ShellProps = Record<string, AppShellPropValue>,
> {
  /** Shell component name (e.g. `'MetaAppFrame'`). */
  component: string;
  /**
   * Module specifier the shell is imported from (e.g. `'@xds/meta'`). The import
   * travels with the component as a single unit — the CLI always adds it,
   * merging into an existing import from the same module.
   */
  from: string;
  /** Import style for {@link component}. Default `'named'`. */
  importKind?: 'named' | 'default';
  /**
   * Static props to set on the shell. Strings render as string literals
   * (`surface="internal"`); numbers and booleans render as expressions
   * (`density={3}`); `true` renders as a bare attribute. Typed against
   * {@link ShellProps} when provided.
   */
  props?: StaticProps<ShellProps>;
  /**
   * A short human explanation of what this shell adds, shown when the CLI
   * confirms which shell it wrapped a template in (e.g. "nav, search, and the
   * standard app chrome"). Strongly recommended — it is what a consumer reads
   * when deciding whether they want it.
   */
  description?: string;
}
