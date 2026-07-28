---
'@astryxdesign/cli': patch
---

[feat] `astryx swizzle` can now copy components from external packages (#2090)

Packages that opt into the Astryx ecosystem through their own package.json (`"astryx": {"docs": "./src"}`) were already discoverable by `astryx discover` and `astryx component`, but `swizzle` could only ever reach `@astryxdesign/core` and configured integrations. It now falls through to those packages too, following the path the issue named — `scanAllPackages()` → `findComponentInPackages()`:

- **Fallthrough resolution.** A component not found in core or in a configured integration is looked up across every discovered external package. Escaping relative imports rewrite to that package's subpaths (`../utils/foo` → `@ext/widgets/utils`); imports inside the component directory stay relative.
- **Disambiguation.** External packages participate in the existing `ERR_AMBIGUOUS_COMPONENT` flow, so `--package <pkg>` picks between core, an integration, and an external package. A package that is both a configured integration and an `astryx.docs` package is listed once, not twice.
- **Core is no longer required.** `swizzle` previously hard-failed with `ERR_CORE_NOT_FOUND` before looking anywhere; it now only does so when there is nothing at all to swizzle from.
- **`--list` and the not-found suggestions** now cover every owner `swizzle` can resolve from — core, configured integrations, and external packages. Integration components were already swizzleable but had never been listed.
- **Canonical naming.** External lookup is case-insensitive, so `astryx swizzle appshell` resolves a package's `AppShell`. The ejected directory and the reported `component` now use the package's own casing rather than whatever was typed, since the folder name is part of the output contract. Core and integration owners resolve by exact name and are unchanged.
- **Doc formats.** `swizzle` accepts `.doc.{ts,mjs,js}` when locating an external component, matching what integration discovery already accepted.

A package whose doc file sits directly at its docs root has no isolated component directory, so it reports `ERR_NO_SOURCE` rather than copying the package's entire `src` tree.

Three things this had to get right before external packages could be trusted as owners:

- **Symlinked installs count.** `readdirSync(withFileTypes)` does not follow symlinks, so a package installed as a link reported `isDirectory() === false` and was skipped entirely. That is how pnpm installs everything, and how `file:`/`link:`/workspace dependencies install on every package manager — external-package support would have been inert for those users. `discoverExternalPackages()` and the package scanner now accept a symlinked entry as a package; a broken link still fails the `package.json` check and is skipped.
- **Imports are resolved, not guessed.** The old rewrite stripped one `../` and kept the first segment, which is exact for a flat `src/<Name>/` layout but emitted `<owner>/..` — not a module specifier at all — for anything nested deeper. Because an external package's docs tree is walked recursively, `src/components/AppShell/` is a perfectly resolvable component, so this was reachable. Imports are now resolved against the owner's root and named from there (`'../../theme/x'` → `<owner>/theme`). An import that escapes the package cannot be named as a subpath of it: it is left exactly as written and reported as `unresolvedImports` on the copy receipt (with a warning in human output) rather than mangled into a specifier that looks valid.
- **A docs-only owner no longer blocks a real one.** A package that only _documents_ a name core also owns produced `ERR_AMBIGUOUS_COMPONENT` and then offered itself as one of the two ways out — a dead end, since it has no source to copy. Installing any such package broke `swizzle Button` outright. Owners with no copyable source are now excluded from the implicit choice; an explicit `--package` still reaches them and still answers `ERR_NO_SOURCE`, and they still answer on their own when nobody else owns the name.

When a package ships the same component name at more than one path, the doc lookup is breadth-first over name-sorted entries, so the shallowest match wins and the result does not depend on filesystem ordering.

`astryx discover` is deliberately unaffected. The wider doc-suffix list is opt-in per call site (`ALL_DOC_SUFFIXES`), because `discover` `import()`s the doc it finds and Node refuses to strip types from a `.ts` file under `node_modules` — widening the shared scanner globally would have turned a clean "not found" into an `ERR_INVALID_DOC` load failure. `swizzle` only ever locates the doc (then excludes it from the copy), so it can opt in safely. The scanner's default stays `.doc.mjs`-only and its traversal order is unchanged.

@cixzhang
