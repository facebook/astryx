---
'@astryxdesign/cli': minor
---

Add `hiddenComponents` to `astryx.config` — hide a component from unscoped CLI surfaces (`component --list`, bare `component <Name>` resolution, `search`) so an integration-provided replacement becomes the single authoritative provider instead of an ambiguity error. Entries are `'Name'` (core) or `'@scope/pkg/Name'`. Explicit `--package` lookups still resolve hidden components, so their docs and swizzle stay reachable.
