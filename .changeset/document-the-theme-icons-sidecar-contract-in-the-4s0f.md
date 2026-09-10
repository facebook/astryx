---
'@astryxdesign/cli': patch
---

[docs] Clarify how to build themes with imported icon registries, including the current omission of inline registries and the separate registry compilation step.
@jiunshinn

The theme guide distinguishes a missing compiled registry from an extensionless source import: the former breaks both loading and bundling, while the latter can resolve in a bundler when the source remains beside the generated module. English, dense, and Chinese guidance now explains how output paths and `--icons-specifier` affect resolution.
