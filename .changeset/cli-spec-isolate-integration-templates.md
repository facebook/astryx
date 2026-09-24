---
'@astryxdesign/cli': patch
---

[fix] One integration whose templates root cannot be read, for example a manifest that points `templates` at a file, no longer makes `astryx template` fail with a raw filesystem error. That package's templates are skipped with the usual one-line warning, and core templates and every other integration's templates still list and resolve.

@josephfarina
