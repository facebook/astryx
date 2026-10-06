---
'@astryxdesign/cli': patch
---

[feat] Every result now names the package it comes from. A `--json` result about one artifact (a component and each of its projections, a doc topic, index, section, or docs-tree node, a template, a hook, and `swizzle`) carries `package` in its envelope, directly after `type`. A result that lists artifacts gives each item its own `package`: every `search` hit, `build`'s start, alternatives, blocks, and components, a doc's sections, a docs-tree node's children, `--blocks` entries, and the `component --list` and `upgrade --list` entries. Text names the same package; `--source`, `--showcase`, and a template's source still print only the source on stdout and name the package on stderr. Existing fields are unchanged.

@josephfarina
