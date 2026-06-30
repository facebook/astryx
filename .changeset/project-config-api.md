---
'@astryxdesign/cli': patch
---

[feat] Introduce the Project configuration API as the single entry point for reading resolved project config, components, templates, codemods, and issue routing, replacing loadConfig. Misconfigured integrations are now skipped with a warning during upgrade instead of hard-failing, and a new --skip-codemod flag lets you re-run past a failed codemod.

@ejhammond
