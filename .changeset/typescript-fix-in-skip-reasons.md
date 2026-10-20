---
'@astryxdesign/cli': patch
---

[fix] When the project's TypeScript is missing, too old, or has no JavaScript compiler API (TypeScript 7), `integration check` and `doctor integration validate|components` now name the version and the fix in the skip reason: install TypeScript 5.0 through 6 (`npm install -D typescript@6`). `--strict` fails with that message instead of a bare skip.
@josephfarina
