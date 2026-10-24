---
'@astryxdesign/core': patch
---

[experimental] The delegated press consumer's release fade and quick-tap flash follow the pressed element's theme: `PRESS_PROFILES` (in `@astryxdesign/core/gestures/experimental`) name the `timing.press` motion roles behind their clocks (`releaseRole`, `flashRole`), resolved with `resolveMotion` when the touch lands and when the release starts, so the `fading` timer matches the CSS fade a theme sets.

@vjeux
