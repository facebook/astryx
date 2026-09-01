---
'@astryxdesign/core': patch
---

[feat] Make PowerSearch adapt automatically for touch devices.

On coarse pointers, filters remain visible as capsules followed by a capsule-sized “Add filters…” button, while trailing actions such as Clear stay anchored to the field’s end. Adding and editing use a bottom sheet whose field picker shows names only, simple titles combine field and operator, complex operator radios are prefixed by the field name, and every built-in value selection requires Apply. Each capsule’s remove button continues to delete it directly.

@imdreamrunner
