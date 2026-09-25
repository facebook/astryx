---
'@astryxdesign/cli': patch
---

[fix] The `@astryxdesign/cli/json` types now declare `apiVersion` on `CLIError`, `CLIUnsupportedError`, and the success envelope that `parseResponse` and `assertResponse` return, matching what every `--json` envelope carries. Code that constructs a `CLIError` value by hand, for example in a test double, now has to include `apiVersion`.

@josephfarina
