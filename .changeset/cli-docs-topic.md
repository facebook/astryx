---
'@astryxdesign/cli': patch
---

[feat] Read every command and API function with `astryx docs cli`.

`astryx docs cli` has one section for each command (`commands-<name>`) and for each API function, plus the JSON output envelope, error codes, and response types (`api-<name>`). Every command, API function, schema, and enum doc the CLI ships now declares the `namespace` that reads it, and `astryx doctor` fails when one has none or names one no topic reads.

@josephfarina
