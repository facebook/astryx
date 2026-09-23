---
'@astryxdesign/cli': patch
---

[fix] New `ASTRYX_NO_PROJECT_CODE=1` gate for running the CLI in checkouts you don't trust (CI, triage, agent runs). Every checkout-backed loader honors it: a present `astryx.config.*` is acknowledged and skipped instead of executed, no integration manifest is loaded (configured, autolinked, or local), checkout doc modules, topics, template specs, and codemods are never imported, and `theme build` refuses the theme source with `ERR_THEME_LOAD` before any loader runs. Default behavior is unchanged.

@bhamodi
