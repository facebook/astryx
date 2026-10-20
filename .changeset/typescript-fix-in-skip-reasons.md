---
'@astryxdesign/cli': patch
---

[feat] On TypeScript 7, which ships no JavaScript compiler API, the doc-type and prop checks in `integration check` and `doctor integration validate|components` use the TypeScript 6 API package TypeScript publishes for tools (`@typescript/typescript6`) when the project installs it beside TypeScript 7. When no usable TypeScript is found, the skip reason now ends with the remedy: add `@typescript/typescript6` on TypeScript 7, or install TypeScript 5.0 through 6 (`npm install -D typescript@6`).
@josephfarina
