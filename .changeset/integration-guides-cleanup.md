---
'@astryxdesign/cli': patch
---

[docs] The `astryx docs cli/integrations` guides and `astryx docs authoring` now match the current CLI, and the guides point to the matching `astryx docs authoring <section>` for every field instead of repeating its tables.

@josephfarina

- Old-CLI notes name the published releases that behave that way: template `replaces`, links, docs sections, section `id`s and typed theme descriptors work from 0.6.4, and template `keywords` from 0.6.6. `integration verify` still names the CLI range to declare.
- The quick start makes the package an ES module, so a theme it builds can be imported.
- Samples and output that had drifted are fixed, among them the subcomponent imports, a theme that extends another, the Core peer range, and the upgrade output.
- The Authoring Reference corrects how an invalid `astryx.config` is handled, the `issuesUrl` format, where codemod files go, and which fields nothing reads yet. Its examples use the `export default {type: ...}` form that `integration add` writes.
- `astryx docs cli/integrations` links to the Authoring Reference, and the reference links back to the guides.
- `astryx docs styling-overview` and `tokens-and-setup` give the real symptom of a missing StyleX compiler: importing a swizzled component throws an error that starts `Unexpected 'stylex.create' call at runtime`.
