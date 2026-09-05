---
'@astryxdesign/cli': patch
---

[fix] CLI theme resolution now resolves packages from the project's node_modules instead of the CLI's own install location, loads file themes through the shared module loader (the documented `{"astryx": {"theme": "./src/theme.ts"}}` setup gains the same jiti path configs use), and obeys the ASTRYX_NO_PROJECT_CODE safe-mode gate: under it no theme module — file or package — is loaded, and the CLI renders theme-less with a one-line notice. Default behavior for every documented setup is unchanged.

@bhamodi
