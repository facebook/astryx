---
'@astryxdesign/cli': minor
---

[breaking] Let integration templates replace Core templates by id.

An integration template can set `replaces` in its own metadata to a Core
template id. Unqualified template lookup and discovery surfaces use a valid
replacement, while `--package @astryxdesign/core` still selects the original.
Missing targets, type mismatches, a declaration on a template that cannot be
used, and duplicate declarations fail closed and are reported by `astryx doctor
integration templates`. When separate configured packages replace one target,
the package configured later wins with a warning. Explicitly configured packages
always precede autolinked ones. When only autolinked packages conflict, the
dependency listed later in package.json wins with a warning and the CLI
recommends explicit configuration.

Invalid contribution kinds remain reportable without hiding other valid kinds.
Invalid template or component files do not hide valid siblings.

Migration for integration authors: require `@astryxdesign/cli >=0.7.0` in a
package that sets `replaces`. Earlier CLIs reject the field and withhold the
package's templates and doc topics.

Migration for JSON consumers: `template.list` entries can now include optional
`replaces`, and a winning replacement removes its Core target from the default
list. Select `@astryxdesign/core` explicitly when you need the original. Every
`IntegrationTemplateConflict` now has required `relationship` and can have
`severity: 'info'`; update exhaustive shape or severity handling before
upgrading.

@josephfarina
