---
'@astryxdesign/cli': patch
---

[fix] When `discover --available` runs without a discover source, the CLI now
explains what discover sources are and where to find Astryx packages on
npm, instead of the misleading message that told users to add package names
they had no way to find. The base `discover` with no integrations also gains
a pointer to npm and the integrations docs.

@AstryxBot
