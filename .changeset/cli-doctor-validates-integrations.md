---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor` now validates the integrations it reports on.

Doctor reported `fail: 0` over integrations it had never validated. A package
whose `astryx.integration.*` could not be parsed appeared on no doctor surface
at all; a package whose declared roots did not exist was described as
"contributing components, templates, themes, docs" when it contributes nothing.

The validators that catch all of this already existed — `Project` runs them to
build `issues()`, and `doctor integration validate <package>` reports them.
Doctor now reports what they find, in a new `integrations` check, with the
validators' own severities: any error is a FAIL, warnings alone are a WARN.
The `implicit-integrations` line now names only roots that resolve on disk, and
`provider-identity` says how many integrations it could not read instead of
quietly counting a subset.

An installed dependency whose manifest cannot be loaded is still kept out of the
loaded set — a dependency the project never named must not be able to break it —
but it is no longer discarded: doctor reports it as a warning.

@josephfarina
