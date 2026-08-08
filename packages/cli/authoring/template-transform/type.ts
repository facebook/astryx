// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * INTERNAL engine contract for the template-transform layer. This is NOT an
 * authoring surface and is not exported from `@astryxdesign/cli/authoring`.
 *
 * The exposed capability is the app shell (see `../app-shell/type.ts`): an
 * integration names ONE shell component and the CLI wraps content-only page
 * templates in it on `--with-shell`. That declaration is compiled down to the
 * richer shape below, which the engine also uses for scoping and for stacking
 * more than one wrapper — capabilities the CLI drives internally rather than
 * asking integration authors to reason about.
 *
 * Keeping this shape private is deliberate: the authored surface stays one
 * component + one module, while the engine keeps room to grow.
 */

import type {AppShellPropValue, StaticProps} from '../app-shell/type';

export type {StaticProps};

/** @see AppShellPropValue — the engine's name for the same static value set. */
export type TemplateWrapPropValue = AppShellPropValue;

/**
 * Declarative wrap: wrap the template's default-export returned JSX in a
 * component. Idempotent — a template already wrapped in {@link component} is left
 * untouched. The wrapper's import is ALWAYS added automatically.
 *
 * Parameterize with the wrapper's props type for fully type-safe {@link props}:
 * `TemplateWrap<MetaAppFrameProps>`.
 *
 * @template WrapperProps the wrapper component's props (for typed `props`)
 */
export interface TemplateWrap<
  WrapperProps = Record<string, TemplateWrapPropValue>,
> {
  /** Component name to wrap the returned JSX with (e.g. `'AppFrame'`). */
  component: string;
  /**
   * Module specifier the wrapper is imported from (e.g. `'@xds/meta'`). Wrapping
   * ALWAYS adds the matching import automatically — `component` + `from` is a
   * single unit, so a wrap can never emit an un-imported component. The import
   * is merged/deduped if one already exists.
   */
  from: string;
  /** Import style for {@link component}. Default `'named'`. */
  importKind?: 'named' | 'default';
  /**
   * Static props to set on the wrapper. Strings render as string literals
   * (`surface="internal"`); numbers and booleans render as expressions
   * (`count={3}`, `flag={true}`); `true` renders as a bare attribute. Typed
   * against {@link WrapperProps} when provided.
   */
  props?: StaticProps<WrapperProps>;
}

/** Which templates a transform applies to. */
export interface TemplateTransformScope {
  /**
   * Template kinds the transform applies to. Default `['page']` — the headline
   * case is wrapping full-page templates. Include `'block'` to also transform
   * block templates.
   */
  types?: Array<'page' | 'block'>;
  /**
   * Only apply to templates whose id matches one of these globs (`*` is a
   * wildcard), e.g. `['dashboard', 'login-*', 'marketing/*']`. When set,
   * templates that match none are skipped. Combine with {@link exclude}.
   */
  include?: string[];
  /**
   * Never apply to templates whose id matches one of these globs. Takes
   * precedence over {@link include}.
   */
  exclude?: string[];
  /**
   * Only apply to templates owned by one of these packages, e.g.
   * `['@astryxdesign/core']` to transform ONLY the built-in OSS templates and
   * leave other integrations' templates alone.
   */
  packages?: string[];
}

/** Context describing the template currently being emitted (used for scoping). */
export interface AstryxTemplateContext {
  /** Template kind. */
  type: 'page' | 'block';
  /** Stable template id (e.g. `'dashboard'` or `'marketing/hero'`). */
  id: string;
  /** Owning package (`'@astryxdesign/core'` for built-in templates). */
  package: string;
  /**
   * Authored category (e.g. `'Content - Documentation Catalog'`). A `Shell -`
   * prefix marks a template that IS an app shell and must never be wrapped.
   */
  category?: string;
}

/**
 * The definition an author writes for a template transform (default export).
 * Parameterize with the wrapper's props type for a fully type-safe `wrap.props`:
 * `satisfies AstryxTemplateTransform<MetaAppFrameProps>`.
 *
 * @template WrapperProps the `wrap` component's props (for typed `wrap.props`)
 */
export interface AstryxTemplateTransform<
  WrapperProps = Record<string, TemplateWrapPropValue>,
> {
  /**
   * A short human explanation of WHAT this transform does and WHY, shown in the
   * CLI's alteration notice (e.g. "Wraps pages in the Meta app shell + provider
   * so they inherit internal theming and analytics."). Strongly recommended:
   * it's what a consumer reads when the CLI tells them a template was altered.
   */
  description?: string;
  /** Which templates to apply to. Default: page templates only. */
  appliesTo?: TemplateTransformScope;
  /**
   * Extra root element names that mean "already wrapped", on top of the
   * outermost wrapper's own name. The app shell passes the shell components
   * here so a template that already renders one is never nested inside another.
   */
  skipIfRootIs?: string[];
  /**
   * Wrap the default-export JSX in a component, or in a STACK of components
   * listed OUTERMOST FIRST. Every wrapper auto-imports itself and can set its
   * own props. Wrapping the whole stack is idempotent (guarded by the outermost
   * wrapper), so re-emitting never double-wraps.
   *
   * @example Single wrapper
   * ```
   * wrap: { component: 'AppFrame', from: '@xds/meta' }
   * ```
   * @example Provider + shell -> <MetaProvider><AppFrame>…</AppFrame></MetaProvider>
   * ```
   * wrap: [
   *   { component: 'MetaProvider', from: '@xds/meta' },
   *   { component: 'AppFrame', from: '@xds/meta', props: { surface: 'internal' } },
   * ]
   * ```
   */
  wrap: TemplateWrap<WrapperProps> | TemplateWrap[];
}
