---
'@astryxdesign/cli': patch
---

[fix] The XDS-prefix drop codemod now runs as a mandatory v0.1.0 upgrade step, so upgrading from 0.0.x rewrites prefixed imports (useXDSTheme, XDSButton, XDSIconRegistry, ...) to their bare names alongside the @xds/_ → @astryxdesign/_ scope rename.

@ejhammond
