---
'@astryxdesign/cli': patch
---

[fix] The programmatic `component(name, {cwd, blocks: true})` now discovers blocks from the `cwd` it is given, as every other slice already does. It used to read blocks from the process working directory, so a caller pointing at another project got that directory's blocks, or none. (#6580)

@josephfarina
