---
'@astryxdesign/cli': patch
---

[fix] A `--json` error envelope's `code` is now always one of the documented error codes. A failure that carried a Node.js system code, such as `ENOTDIR` or `EACCES` from a failed write, used to put that code in the envelope; it now reports `ERR_UNKNOWN`, and the original message is unchanged. (#6548)

@josephfarina
