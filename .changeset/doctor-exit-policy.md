---
'@astryxdesign/cli': minor
---

[breaking] Doctor fails when the CLI cannot load what astryx.config asks for
@josephfarina

A new `configured-integrations` check fails when an integration named in astryx.config cannot be loaded: not installed, installed without a manifest, or a manifest that throws or fails its schema. Such an integration is withdrawn whole and contributes nothing. The config check fails, instead of warning, when astryx.config imports but the CLI cannot load the project from it.

Unchanged: a problem inside one contribution kind (an invalid component doc, a missing or unreadable root, an unresolved replacement) stays a warning under `integration-issues` (spec:AST-035 FR9), and an autolinked dependency that cannot be loaded stays informational.

Classification: incompatible-fix. IFIX-0002 / CLN-0008.
Released victim: published 0.6.8 (the latest stable) exits 0 for both cases.
No codemod: nothing in a project's source changes; the fix is to install the integration, repair its manifest, or edit `integrations` in astryx.config, which only the project's owner can decide.

What counts as configured is every name astryx.config lists, read from the provider ledger: a package set aside for a provider conflict and the package being authored when its own config names it both count.
Migration: install the integration, fix its manifest, or remove it from `integrations`; fix the astryx.config field the message names.
