// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Compile-time guard that the runtime @astryxdesign/cli/api implementation matches the
 * declared programmatic API surface in api.d.ts.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `typecheck:json-api` historically only checked the `.d.ts` declarations plus a
 * couple of `lib/*.mjs` helpers — it never looked at `src/api/*.mjs`. So the
 * hand-written declarations in `api.d.ts` could (and did) silently drift from
 * what the runtime functions actually accept: the runtime `component()` gained
 * `package`/`blocks` options and a `component.detail.blocks` result, and
 * `template()` gained a `type` filter, none of which were reflected in
 * `api.d.ts`. CI never caught it.
 *
 * Turning on full `checkJs` over the api implementations surfaces ~140
 * pre-existing implicit-any JSDoc errors in transitively-imported `lib/*` and
 * `utils/*` files that have nothing to do with the public API contract — an
 * unmanageable cleanup for one PR (see PR body). Instead, this file pins the
 * *option surface and arity* of each runtime function against the declared
 * types. The check runs under a dedicated tsconfig with `checkJs: false`, so
 * the implementation bodies are not re-typechecked — only their JSDoc-derived
 * export signatures are read and compared.
 *
 * The JSDoc `@param` annotations on each `src/api/*.mjs` export are the source
 * TypeScript reads for the runtime side, so keeping them in sync with
 * `api.d.ts` is exactly what this guard enforces. If a runtime function adds an
 * option the `.d.ts` omits (or vice versa), the corresponding `MutuallyEqual`
 * assertion below fails and `typecheck:json-api` goes red.
 */

import type * as Api from './api';
import type {component} from '../api/component.mjs';
import type {docs} from '../api/docs.mjs';
import type {discover} from '../api/discover.mjs';
import type {template} from '../api/template.mjs';

/** Resolve to `true` only when `A` and `B` are mutually assignable. */
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

/** Compile error unless `T` is exactly `true`. */
type Expect<T extends true> = T;

/** Drop `undefined` from an optional options parameter for comparison. */
type Opt<T> = NonNullable<T>;

// ── Option-bag parity: the declared options and the runtime JSDoc options
// must describe the same set of keys/types, in both directions. ──────────────

type _ComponentOptions = Expect<
  Equal<Opt<Parameters<typeof Api.component>[1]>, Opt<Parameters<typeof component>[1]>>
>;
type _DocsOptions = Expect<
  Equal<Opt<Parameters<typeof Api.docs>[2]>, Opt<Parameters<typeof docs>[2]>>
>;
type _DiscoverOptions = Expect<
  Equal<Opt<Parameters<typeof Api.discover>[1]>, Opt<Parameters<typeof discover>[1]>>
>;
type _TemplateOptions = Expect<
  Equal<Opt<Parameters<typeof Api.template>[1]>, Opt<Parameters<typeof template>[1]>>
>;

// ── Positional-argument parity: arity and positional types must match. ───────

type _ComponentName = Expect<
  Equal<Parameters<typeof Api.component>[0], Parameters<typeof component>[0]>
>;
type _DocsTopic = Expect<
  Equal<Parameters<typeof Api.docs>[0], Parameters<typeof docs>[0]>
>;
type _DocsSection = Expect<
  Equal<Parameters<typeof Api.docs>[1], Parameters<typeof docs>[1]>
>;
type _DiscoverQuery = Expect<
  Equal<Parameters<typeof Api.discover>[0], Parameters<typeof discover>[0]>
>;
type _TemplateName = Expect<
  Equal<Parameters<typeof Api.template>[0], Parameters<typeof template>[0]>
>;

// Surface the assertion aliases so the file has a value/type export and the
// checks above are not tree-shaken away by `noUnusedLocals`.
export type _ApiContractGuard = [
  _ComponentOptions,
  _DocsOptions,
  _DiscoverOptions,
  _TemplateOptions,
  _ComponentName,
  _DocsTopic,
  _DocsSection,
  _DiscoverQuery,
  _TemplateName,
];
