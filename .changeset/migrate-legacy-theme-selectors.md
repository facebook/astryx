---
'@astryxdesign/cli': patch
---

[fix] Add a conservative `astryx upgrade --apply` migration for the Core bare selector-class removal. The transform parses `.css` selector syntax, rewrites exact v0.5.4 target/value pairs to behavior-preserving old-class/data-attribute unions, covers unbounded values that v0.5.4 emitted, and leaves unknown consumer classes unchanged.

@cixzhang
