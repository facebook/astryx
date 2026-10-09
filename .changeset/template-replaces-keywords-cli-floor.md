---
'@astryxdesign/cli': patch
---

[fix] A template that sets `replaces` needs `@astryxdesign/cli` 0.6.4, and one that sets `keywords` needs 0.6.6, not 0.7.0.

Published 0.6.4 applies a template's `replaces`, and published 0.6.6 reads its `keywords`. `integration verify` asked for `">=0.7.0"` for both, a range no released CLI satisfies, and npm leaves the CLI uninstalled in an app that installs a package with that optional peer. `integration verify` now accepts `">=0.6.4"` for `replaces` and `">=0.6.6"` for `keywords`, and still refuses a range that admits an older CLI. Its messages now say what older CLIs do. Before 0.6.6 a template that sets `keywords` is dropped, and before 0.6.4 the package's doc topics are hidden too.

@josephfarina
