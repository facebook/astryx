---
'@astryxdesign/core': patch
---

[feat] Stepper now accepts `minStepWidth` to configure the per-step width at
which a horizontal Stepper collapses. Numbers are interpreted as pixels and
strings accept CSS lengths such as `7rem`, `calc(6rem + 8px)`, and custom
properties. The browser resolves string units through an invisible measurement
element, and changes to the resolved value update the compact layout. Omitting
the prop preserves the existing 112px threshold.

@imdreamrunner
