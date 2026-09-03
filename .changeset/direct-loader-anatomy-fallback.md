---
'@astryxdesign/cli': patch
---

[fix] Preserve anatomy when loading localized component docs directly (#5761)

The validated component-doc loader now applies the same full-overlay fallback as the CLI loader, so omitted localized anatomy inherits the canonical structure while explicit localized anatomy still wins.

@cixzhang
