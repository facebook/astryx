---
'@astryxdesign/core': patch
---

[fix] Avatar: an avatar with no `name` or `alt` is now decorative (`role="presentation"` + `aria-hidden`) instead of being announced with the meaningless generic name "Avatar". When named, the inner `<img>` uses an empty `alt` so the accessible name isn't announced twice (once by the `role="img"` wrapper, once by the image) (#3343).
@cixzhang
