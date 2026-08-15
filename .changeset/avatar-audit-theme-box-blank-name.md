---
'@astryxdesign/core': patch
---

[fix] Avatar: put the avatar box on the element that carries the `astryx-avatar` theme target, so a theme rule on the documented `size` axis resizes the whole avatar instead of growing the wrapper around a fixed-size circle; treat a whitespace-only `name` or `alt` as absent, so it falls through to the default icon rather than rendering an empty plate behind a blank accessible name; warn through the shared `useDevWarning` hook rather than a bare `console.warn` in the render body; and replace the phantom `<OnlineIndicator />` in the JSDoc example with the real `AvatarStatusDot` (#5030)
@cixzhang
