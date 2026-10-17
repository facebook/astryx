---
'@astryxdesign/cli': patch
---

[feat] `astryx doctor integration components` also compares each documented prop's type with the code, a documented field such as `status.type` included, for props the package declares, and warns when they differ (`type_mismatch`). Types are compared structurally by the project's own `typescript`: union order, quotes, whitespace, parameter names, `readonly`, and alias spelling do not count, a callback may leave out trailing parameters, and `Name = …` must match in both parts. A prop whose type does not resolve is listed as not compared, never reported. The findings are warnings, so the exit code does not change.

@josephfarina
