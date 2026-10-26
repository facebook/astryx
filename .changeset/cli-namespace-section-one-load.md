---
'@astryxdesign/cli': patch
---

[fix] `astryx docs <namespace> <section>` loads the project once instead of once for every guide below the namespace, so a section read on a namespace with many guides, such as `astryx docs authoring <section>`, answers in tens of milliseconds instead of most of a second. The answer is unchanged.

@vjeux
