---
'@astryxdesign/cli': patch
---

[fix] The published authoring types now type-check in projects that use `"moduleResolution": "nodenext"` or have no Node types installed. Relative imports inside them name their files, and `PostCodemodCommand`'s `env` no longer needs Node's types. (#6492)

@josephfarina
