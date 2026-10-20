---
'@astryxdesign/cli': patch
---

[feat] The doc-type and prop checks in `integration check` and `doctor integration validate|components` read types with `@typescript/typescript6`, the TypeScript 6 API package TypeScript publishes for tools, when the project installs it and its own `typescript` is missing or has no JavaScript compiler API, as TypeScript 7 does. When no usable TypeScript is found, the skip reason now ends with the remedy: add `@typescript/typescript6` on TypeScript 7, or install TypeScript 5.0 through 6 (`npm install -D typescript@6`).
@josephfarina
