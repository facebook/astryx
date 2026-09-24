---
'@astryxdesign/cli': patch
---

[fix] The `--json` option's description in `astryx --help` and in the manifest now lists every envelope field: `{ apiVersion, type, data, meta? }` on success and `{ apiVersion, error, code, suggestions? }` on failure. It used to omit `apiVersion`, `meta`, and the stable `code` field that consumers branch on.

@josephfarina
