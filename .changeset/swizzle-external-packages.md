---
'@astryxdesign/cli': patch
---

[feat] `astryx swizzle` can now copy components from external packages (#2090)

Packages that opt into the Astryx ecosystem through their own package.json (`"astryx": {"docs": "./src"}`) were already discoverable by `astryx discover` and `astryx component`, but `swizzle` could only ever reach `@astryxdesign/core` and configured integrations. It now falls through to those packages too, following the path the issue named — `scanAllPackages()` → `findComponentInPackages()`:

- **Fallthrough resolution.** A component not found in core or in a configured integration is looked up across every discovered external package. Escaping relative imports rewrite to that package's subpaths (`../utils/foo` → `@ext/widgets/utils`); imports inside the component directory stay relative.
- **Disambiguation.** External packages participate in the existing `ERR_AMBIGUOUS_COMPONENT` flow, so `--package <pkg>` picks between core, an integration, and an external package. A package that is both a configured integration and an `astryx.docs` package is listed once, not twice.
- **Core is no longer required.** `swizzle` previously hard-failed with `ERR_CORE_NOT_FOUND` before looking anywhere; it now only does so when there is nothing at all to swizzle from.
- **`--list` and the not-found suggestions** now include external components alongside core's, instead of listing only `packages/core/src`.
- **Canonical naming.** External lookup is case-insensitive, so `astryx swizzle appshell` resolves a package's `AppShell`. The ejected directory and the reported `component` now use the package's own casing rather than whatever was typed, since the folder name is part of the output contract. Core and integration owners resolve by exact name and are unchanged.
- **Doc formats.** `swizzle` accepts `.doc.{ts,mjs,js}` when locating an external component, matching what integration discovery already accepted.

A package whose doc file sits directly at its docs root has no isolated component directory, so it reports `ERR_NO_SOURCE` rather than copying the package's entire `src` tree.

`astryx discover` is deliberately unaffected. The wider doc-suffix list is opt-in per call site (`ALL_DOC_SUFFIXES`), because `discover` `import()`s the doc it finds and Node refuses to strip types from a `.ts` file under `node_modules` — widening the shared scanner globally would have turned a clean "not found" into an `ERR_INVALID_DOC` load failure. `swizzle` only ever locates the doc (then excludes it from the copy), so it can opt in safely. The scanner's default stays `.doc.mjs`-only and its traversal order is unchanged.

@cixzhang
