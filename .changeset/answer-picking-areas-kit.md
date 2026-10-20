---
'@astryxdesign/cli': patch
---

[feat] Add the shared kit that commands which pick among candidates build on: dispatcher and searcher nodes with one descriptor, a runner with a confidence floor and a fallback, a `tuning` option for weights overrides and step traces, and test helpers. `astryx docs cli/areas` lists each node with what it handles and what it does not. The structure check covers areas that use the kit. No command uses the kit yet, so no command's output changes.

@josephfarina
