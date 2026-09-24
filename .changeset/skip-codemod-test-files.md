---
'@astryxdesign/cli': patch
---

[fix] Test and fixture files under a codemod version folder are no longer loaded as codemods. Every `.ts`/`.mjs`/`.js` file under a version folder was loaded and validated, so a test colocated with its transform failed validation and — a definition error being a hard error — took every codemod in that version with it, while `upgrade` applied nothing and reported success. Reserved names: `*.test.*`, `*.spec.*`, `*.fixture.*`, and anything under `__tests__/` or `__fixtures__/`.
@josephfarina
