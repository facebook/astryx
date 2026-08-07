---
'@astryxdesign/core': patch
---

[feat] Avatar: the fallback surface (initials and default icon) is now a direct theme target via the stable `astryx-avatar-fallback` class. Theme its background, text color, font weight, and per-size font size through the `avatar-fallback` component key (e.g. `components: { 'avatar-fallback': { base: { backgroundColor: '...' }, 'size:sm': { fontSize: '...' } } }`), replacing the internal `--_avatar-fallback-*` derived vars.

@cixzhang
