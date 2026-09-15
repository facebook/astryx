---
'@astryxdesign/cli': patch
---

[fix] Integration codemod discovery (`astryx upgrade`) threw and silently dropped an entire integration's codemods when its `codemods/<version>/` directory contained conventional test files (`__tests__/*.test.*`, `*.spec.*`) or shared helper modules with no default export. These are now excluded from discovery; a module that has a default export but fails schema validation still throws exactly as before.

@abu-abdullah22
