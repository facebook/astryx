---
'@astryxdesign/cli': patch
---

[feat] `astryx upgrade` now reports manual migrations and stale generated files in two new receipt fields, and tells manual migrations and protected stale files apart from codemod failures. Code a codemod can identify but not migrate safely is listed in `manualActions` (file, line, codemod, and what to change) and printed after the run; it does not fail the upgrade, so the run completes and exits 0. A generated file that must be rebuilt, such as stale theme CSS that `validate-data-token-ownership` reports and `astryx theme build` regenerates, is listed in `regenerate` with its rebuild command until it is rebuilt; a `hooks.postCodemod` command that rebuilds it clears it. When the project protects the file (for example an `@generated` header), the run is incomplete exactly as for a protected file (`complete: false`, `errorCode: "ERR_CODEMOD_PROTECTED"`, exit 1); when nothing protects it, it stays a codemod error (`ERR_CODEMOD_FAILED`, as before), now with the rebuild command in `regenerate`. Protected generated files also appear in `regenerate` with their header's `Command:`, and a reported file the project marks generated also appears in `protectedFiles` with the rule that protects it. A real codemod failure keeps its `ERR_CODEMOD_FAILED` error, and the `receipt` it carries lists both fields too.

@ejhammond
