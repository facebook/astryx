---
'@astryxdesign/cli': patch
---

[feat] Prepare integration template replacement before its supported package boundary. (#6265, #6626)

An integration template can set `replaces` in its own metadata to a Core template id. Unqualified template lookup and discovery surfaces use a valid replacement, while `--package @astryxdesign/core` still selects the original. Missing targets, type mismatches, a declaration on a template that cannot be used, and duplicate declarations fail closed and are reported by `astryx doctor integration templates`.

When separate configured packages replace one target, the package configured later wins with a warning. Explicitly configured packages always precede autolinked ones. When only autolinked packages conflict, the dependency listed later in package.json wins with a warning and the CLI recommends explicit configuration. Invalid contribution kinds remain reportable without hiding other valid kinds, and invalid template or component files do not hide valid siblings. `astryx doctor` warns about integration contribution problems, so a project that passed before keeps passing; `astryx doctor integration templates` fails on them. `astryx integration verify` fails a package that sets `replaces` unless its `@astryxdesign/cli` peer range starts at 0.7.0 or later.

This implementation may ship in final 0.6.x for forward validation, but an integration package that uses `replaces` must still require `@astryxdesign/cli >=0.7.0`. Earlier CLIs reject the field and withhold that package's templates and doc topics. No supported latest-stable integration consumer can enter the replacement path yet, so replacement selection and its mutable catalog results are patch-compatible pre-publication behavior.

Existing same-id `IntegrationTemplateConflict` responses keep their released warning-only shape on 0.6.x. The optional `TemplateListEntry.replaces` field is additive; at or after 0.7.0, replacement-specific `relationship`, `replaces`, and `severity: 'info'` conflict fields require one deliberate projection update across runtime, types, generated reference, terminal output, documentation, and tests. A package-version bump alone leaves the warning-only shape unchanged.

@josephfarina
