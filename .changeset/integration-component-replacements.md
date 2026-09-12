---
'@astryxdesign/cli': patch
---

[feat] Let integration components replace Core component identities

An integration component can declare `replaces: 'SideNav'` in its component doc.
Use the legacy-compatible `export const docs` form when the package must also
support CLI versions that predate stamped ComponentDoc default exports. Older
CLIs ignore `replaces` and keep a source-backed component under its own name; they
can still handle docs-only components inconsistently: version 0.6.0 lists and searches
them but rejects the missing source in integration Doctor.

When that integration is active, unqualified component discovery, search, detail,
and swizzle selection use the replacement. The replacement keeps its own name,
and `--package @astryxdesign/core` still selects the original Core component.

`astryx doctor integration components` validates missing or non-component targets
(including standalone HookDocs), duplicate
authored names, duplicate replacement declarations, invalid values, and replacement
names that collide with a different Core component. Any structural error withdraws
that package's complete component contribution. If separate configured integrations
replace one target, the later integration wins the target alias with a warning; losing
replacements remain available by their own names. A native integration component whose
own name matches an active replacement target remains listed and package-addressable,
with a warning that its unqualified name is shadowed. Doctor reports declared
replacements in a new optional informational array while preserving the existing
warning-only conflict array for typed consumers. Replacement information is emitted
only when the package's full component set is structurally valid and can become
effective. Full component-list entries expose
ownership metadata at runtime while keeping those added fields optional in the
exported response type. Full-list projection normalizes permissive legacy docs to the
existing ComponentDoc response contract, and human full-list output accepts both bare
`{name}` references and hook-shaped entries in a MultiComponentDoc. Gap-report target selection follows the same replacement
aliases as component detail and routes to the selected owner package.

@josephfarina
