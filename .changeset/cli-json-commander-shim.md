---
'@xds/cli': patch
---

**CLI:** honor `--json` on Commander parse errors and `--help`.

The `--json` contract from the previous release covered the normal command-execution path, but Commander's own short-circuits (parse errors, unknown options, `--help`, unknown subcommands) ran before the `preAction` gate could engage JSON mode. A `--json` consumer would get empty stdout + raw stderr instead of the contract envelope.

A new shim wires `exitOverride()` and a JSON-aware `configureOutput` onto every command (root + subcommands) and patches `outputHelp` to emit a structured `{apiVersion, type:'help', data}` envelope under `--json`. Parse errors now produce `{apiVersion, error}` on stdout with exit 1; unknown subcommands now error (instead of silently emitting help with exit 0); `--detail` is now choice-validated. Non-`--json` invocations are unchanged — Commander's "error: ..." line still goes to stderr.
