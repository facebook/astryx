---
'@astryxdesign/cli': patch
---

[fix] Autolinking can be switched off without a release: `{"astryx": {"autolink": false}}` in a project's package.json, or `ASTRYX_NO_AUTOLINK` in the environment. Neither affects an integration the project names in its config. Separately, test and fixture files under a codemod version folder are no longer loaded as codemods — one colocated test used to fail validation and take every codemod in that version with it, while `upgrade` reported success.
@josephfarina
