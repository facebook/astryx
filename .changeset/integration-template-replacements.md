---
'@astryxdesign/cli': minor
---

[breaking] Let integration templates replace Core templates by id.

Integration manifests can map their own template ids to Core ids with
`templateReplacements`. Unqualified template lookup and discovery surfaces use a
valid replacement, while `--package @astryxdesign/core` still selects the
original. Missing targets, type mismatches, and duplicate declarations fail
closed and are reported by `astryx doctor integration templates`. When separate
configured packages replace one target, the package configured later wins with
a warning. Explicitly configured packages always precede autolinked ones. When
only autolinked packages conflict, the dependency listed later in package.json
wins with a warning and the CLI recommends explicit configuration.

Invalid contribution kinds remain reportable without hiding other valid kinds.
Invalid template or component files do not hide valid siblings. CLIs from 0.5.3
onward ignore `templateReplacements` when it is unknown and preserve understood
contributions. Versions 0.5.2 and earlier reject unknown manifest keys and drop
the entire integration. Replacement selection starts in 0.7.0.

Migration for integration authors: require `@astryxdesign/cli >=0.7.0` when your
package depends on replacement selection. Use `@astryxdesign/cli >=0.5.3` only
when graceful degradation to the integration template's own id is acceptable.
Do not support 0.5.2 or earlier with a manifest that declares this field.

Migration for JSON consumers: `template.list` entries can now include optional
`replaces`, and a winning replacement removes its Core target from the default
list. Select `@astryxdesign/core` explicitly when you need the original. Every
`IntegrationTemplateConflict` now has required `relationship` and can have
`severity: 'info'`; update exhaustive shape or severity handling before
upgrading.

@josephfarina
