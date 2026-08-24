---
'@astryxdesign/cli': patch
---

[chore] Public component theming vars are enumerable, and guarded against being documented but unsettable
@cixzhang

`collectThemingVars` joins `collectThemingTargets` as part of the one
enumeration the theming surface is read from. Two guards ride on it: a
documented public var no component reads compiles to a declaration that never
applies, and a var the component writes inline outranks every cascade layer, so
no theme can reach it. Both had shipped; neither is visible in the generated
theme CSS the jsdom suites assert on (#5409).
