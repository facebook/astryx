---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor` no longer fails "Theme owners and built imports", and `astryx component` no longer stops with "Could not load the recorded theme", when an added theme's built module imports a stylesheet, as in `import './ocean.css'`. Node cannot load a stylesheet, so the CLI checks that each `.css` file a built module imports exists, then treats it as empty. Doctor still fails when an imported stylesheet is missing, and when the module has any other problem, such as a missing dependency, a syntax error, or an error thrown while it loads.

@josephfarina
