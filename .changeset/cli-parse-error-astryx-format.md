---
'@astryxdesign/cli': patch
---

[fix] A parse error prints the Astryx error format in text mode.

`astryx theme list --lang zh-Hans` printed Commander's own line —
`error: option '--lang <locale>' argument 'zh-Hans' is invalid…` — while every
other CLI error prints `Error: …`. `--json` was already correct
(`ERR_INVALID_LANG`), so the two modes agreed only on the exit code.

Commander writes that line before any Astryx code runs, so the JSON shim — the
one place that already sees every parse failure — now suppresses it and writes
the Astryx line itself, from the same message, for both modes. Every parse
failure is covered: unknown option, unknown command, missing argument, and an
invalid value for a global option. `--help` and `--version` are untouched and
still exit 0.

@josephfarina
