# Flow type checking

Astryx runs [Flow](https://flow.org) as a **second, opt-in type checker layered
on top of TypeScript**. Flow does not replace `tsc` — the two run side by side.
This document explains how Flow reads our TypeScript sources, what works today,
what doesn't yet, and how the error baseline burns down over time.

## Why layer Flow on TypeScript?

Flow's syntax has [converged with TypeScript's](https://flow.org/en/docs/flow-vs-typescript/).
In practice that means Flow can parse the same `.ts`/`.tsx` files `tsc` compiles,
with **no file renames and no `@flow` pragmas**. Where the two diverge, Flow
keeps the safer default (e.g. it validates that a value/type-only import is used
correctly, and requires annotations at module boundaries). Running both gives us
a second opinion on our types without forking the source.

## How the interop actually works

Flow cannot read `.ts`/`.tsx` files by default — it silently ignores them. Two
config knobs turn Flow into a checker for our TypeScript sources:

1. **`module.file_ext`** — we add `.ts` and `.tsx` so Flow discovers and parses
   the TypeScript sources as Flow (their syntaxes have converged).
2. **`all=true`** — every file is checkable; TypeScript sources carry no `@flow`
   pragma, so without this Flow would skip them.

Flow does **not** read `@types/*` packages or `.d.ts` files the way `tsc` does.
Its equivalents are:

| TypeScript mechanism                                 | Flow equivalent           | Where it lives                            |
| ---------------------------------------------------- | ------------------------- | ----------------------------------------- |
| `@types/*` / package `.d.ts` for third-party libs    | **libdefs**               | `flow-typed/*.js` (`declare module '…'`)  |
| First-party `.d.ts` shadowing a `.js` implementation | **declaration files**     | colocated `Foo.js.flow`                   |
| `tsc --declaration` (emit types)                     | **`flow-api-translator`** | build tooling (installed, not yet wired)  |
| `tsconfig` `paths` / project references              | **`module.name_mapper`**  | `.flowconfig`                             |
| `lib` (built-in DOM/Node globals)                    | **environment libdefs**   | `flow-typed/environments/*.js` (vendored) |

We check third-party modules Flow can't see (stylex, vitest, testing-library,
heroicons, next, …) with starter libdefs in [`flow-typed/`](../flow-typed).
`node_modules` ships only the built `dist/` for `@astryxdesign/*` workspace
packages (which Flow ignores), so `.flowconfig` uses `module.name_mapper` to
resolve those imports back to the TypeScript **source**.

## DOM / Node globals: environment libdefs

`HTMLElement`, `document`, `window`, `process`, and friends used to be **compiled
into the Flow binary**. As of Flow **0.262** they are no longer bundled — Flow
now downloads them from the community [`flow-typed`](https://github.com/flow-typed/flow-typed)
repo. Two pieces wire this up:

- **`flow-typed.config.json`** — lists the environments to install. Astryx needs
  `node`, `dom`, **`html`** (the HTML element hierarchy lives here, _not_ in
  `dom`), `bom`, `cssom`, `geometry`, `intl`, `indexeddb`, `serviceworkers`,
  `web-animations`, `webassembly`, `streams`, and `jsx`.
- **`flow-typed/environments/*.js`** — the downloaded libdefs, **vendored into the
  repo** (they carry a `// flow-typed signature:` checksum header). Treat them
  like generated/lockfile content: don't hand-edit; refresh with
  `pnpm flow:install-libdefs`. `flow-typed/npm/*.js` are auto-discovered libdefs
  for a few dev dependencies and are vendored the same way.

These are **not hand-written** — they're Flow-lineage definitions maintained in
the flow-typed community repo. The only hand-authored libdefs are
`flow-typed/{stylex,testing,misc}.js`.

Installing them cut `cannot-resolve-name` from ~3.2k to ~130 (the remainder are
SVG element types and the deprecated `$PropertyType` utility). Note that adding
_real_ DOM types also surfaces downstream `incompatible-type` errors that were
previously masked while the globals were unresolved — see the burn-down notes.

## Syntax Flow can't parse

Almost all of Astryx is Flow-parseable. A few TypeScript-only constructs are not
and must be avoided (or confined to `.d.ts`, which Flow ignores):

- `namespace { … }` blocks — **parse error** (allowed only in ignored `.d.ts`).
- `const enum` and constructor **parameter properties** (`constructor(public x)`)
  — reported as `[unsupported-syntax]`.
- `import x = require('…')` / `export = x` — CommonJS-style bindings.

`type`, `interface`, generics, tuples, `keyof`, `as`, `as const`, `satisfies`,
`enum`, `abstract`, `private`/`public`/`protected`, and decorators all parse.

## Known interop limitation: namespace & default imports

The largest single source of current errors is a Flow/TypeScript interop gap,
**not** a missing libdef:

> When Flow checks a `.ts`/`.tsx` file, a **namespace import**
> (`import * as React from 'react'`) or a **default import** binds as a _type_.
> Using it as a value — `React.useState(...)`, `stylex.create(...)` — then
> reports `[type-as-value]`.

**Named imports work** (`import {useState} from 'react'`). Astryx imports both
React and stylex as namespaces pervasively, so this accounts for the bulk of the
`type-as-value` errors. Closing it requires a codemod from namespace to named
imports (or a Flow enhancement), tracked as follow-up — deliberately **out of
scope** for this harness PR.

## Running Flow

```bash
pnpm flow                 # full check (human-readable)
pnpm flow:baseline        # record the current error count in .flow-baseline.json
pnpm flow:check-baseline  # CI mode: fail only if the error count INCREASED
```

## The baseline / burn-down model

Because we start from a large error count, gating CI at zero would be red
forever. Instead `.flow-baseline.json` records the current count and CI fails
only when it **increases** (see `scripts/flow-baseline.mjs`). The number
ratchets down as we add libdefs, migrate namespace imports, and tighten types —
each improvement is locked in by re-running `pnpm flow:baseline`.

Current baseline: see [`.flow-baseline.json`](../.flow-baseline.json).
