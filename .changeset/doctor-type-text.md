---
'@astryxdesign/cli': patch
---

[chore] Internal groundwork for `astryx doctor integration components`: reading two written TypeScript types as one type when they differ only in how they are written (whitespace, comments, quotes, member order, `Array<T>` for `T[]`, parameter names, `React.` qualifiers), and judging a documented prop type against the type the code declares where both read exactly. Nothing reaches either yet, so the CLI's behavior and output do not change.

@josephfarina
