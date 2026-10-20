---
'@astryxdesign/cli': patch
---

[feat] `astryx doctor integration components` also judges each documented prop's type against the code, for props the package declares, a documented field such as `status.type` and a name the package's own index signature takes included, and warns when they differ (`type_mismatch`). A type is judged only where both sides read exactly, with the project's own `typescript`: the same text once whitespace, quotes and union order are set aside, or primitives, literals, arrays and unions of those, and names for them. Every other type (a callback, an object, a generic with arguments, an intersection, `keyof`, a type that does not resolve, a name two index signatures take) is listed as not compared, never reported. The comparison needs TypeScript 4.8 or later: with an older one, no type is judged and the text says so in one `[skip]` line. JSON adds `typesCompared`, `typesNotCompared` and, when the types were not judged, `typesSkipped` to `propDrift`. The findings are warnings, so the exit code does not change.

@josephfarina
