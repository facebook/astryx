---
'@astryxdesign/cli': patch
---

[fix] A write that fails reports ERR_WRITE_FAILED instead of a raw Node errno.

`astryx template` into an unwritable directory returned
`{"error": "EACCES: permission denied, open '/home/you/project/readonly/x.tsx'",
"code": "ERR_UNKNOWN"}`, and `swizzle` returned the `mkdir` equivalent. Two
things were wrong: ERR_WRITE_FAILED is already in the frozen error registry for
exactly this case, and the message carried an absolute host path where every
other Astryx message names its target relative to the project.

Both now throw ERR_WRITE_FAILED with the errno kept (it is the part that says
what to fix) and the target named relative to the project. Nothing is partially
written, and nothing else about the commands changes.

@josephfarina
