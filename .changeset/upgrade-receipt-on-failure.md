---
'@astryxdesign/cli': patch
---

[fix] `astryx upgrade --json` now returns its full `upgrade.run` receipt when a codemod or post-codemod hook fails, instead of a bare error that listed no files. Files the upgrade already changed stay changed, so the receipt names them in `modifiedFiles`, with each failure in `errors`, `complete: false`, and `errorCode: "ERR_CODEMOD_FAILED"`; the exit code is still 1. A failure now outranks a protected file in `errorCode`, and an error that stops the run after codemods have written files (such as an astryx.config that fails validation) also returns the receipt, with that error's code. A script that read `code` from the error result reads `data.errorCode` instead. The programmatic `upgrade()` API returns the same receipt rather than throwing `ERR_CODEMOD_FAILED`.

@ejhammond
