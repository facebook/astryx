---
'@astryxdesign/cli': patch
---

[feat] `astryx upgrade` now tells manual migrations and stale generated files apart from codemod failures, in two new receipt fields. Code a codemod can identify but not migrate safely is listed in `manualActions` (file, line, codemod, and what to change) and printed after the run; it does not fail the upgrade, so the run completes and exits 0. A generated file that must be rebuilt, such as stale theme CSS that `validate-data-token-ownership` reports and `astryx theme build` regenerates, is listed in `regenerate` with its rebuild command, and the run is incomplete exactly as for a protected file (`complete: false`, `errorCode: "ERR_CODEMOD_PROTECTED"`, exit 1) until it is rebuilt; a `hooks.postCodemod` command that rebuilds it clears it. Protected generated files also appear in `regenerate` with their header's `Command:`. A real codemod failure keeps its `ERR_CODEMOD_FAILED` error, and the `receipt` it carries lists both fields too.

@ejhammond
