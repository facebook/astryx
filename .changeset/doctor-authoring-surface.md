---
'@astryxdesign/cli': patch
---

[feat] `astryx doctor` now fails when a type that `@astryxdesign/cli/authoring` exports has no doc in `astryx docs authoring`, or when a listed self-doc documents nothing the package exports. The message names each type, the module that declares it, and the self-doc that is missing or not listed. (#6498)

@josephfarina
