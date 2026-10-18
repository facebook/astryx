---
'@astryxdesign/cli': patch
---

[feat] `astryx doctor integration components` compares each component doc's props with the component's TypeScript props, read with the project's own `typescript`. It warns about a documented prop the code does not have, a prop the package declares that the doc leaves out, and a wrong `required`. Without TypeScript it prints one line saying the comparison was skipped; with a TypeScript it cannot read types with (one with no JavaScript compiler API, such as TypeScript 7), that line names the installed version. The findings are warnings, so the exit code does not change; the JSON response gains `data.propDrift`, and nothing else in it changes.

@josephfarina
