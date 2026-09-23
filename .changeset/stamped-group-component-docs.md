---
'@astryxdesign/cli': patch
---

[fix] A stamped component doc (`type: 'component'`) that documents several components with `components` now loads, as the published `ComponentDoc` type allows. It used to fail with "props: expected array".

@josephfarina
