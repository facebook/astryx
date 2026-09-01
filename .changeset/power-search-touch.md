---
'@astryxdesign/core': patch
---

[feat] Make PowerSearch adapt automatically for touch devices.

On coarse pointers, filters remain visible as capsules followed by a capsule-sized “Add filters…” button, while trailing actions such as Clear stay anchored to the field’s end. Configurations with `contentSearchFieldKey` retain a direct inline search input; pressing the keyboard Search/Enter action adds the configured content filter. Adding and editing structured filters use a bottom sheet whose field picker shows names only, simple titles combine field and operator, complex operator radios are prefixed by the field name, and every built-in value selection requires Save. The footer has no dividing rule. Each capsule’s remove button continues to delete it directly.

@imdreamrunner
