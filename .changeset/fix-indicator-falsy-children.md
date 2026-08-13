---
'@astryxdesign/core': patch
---

[fix] Indicator: a falsy `children` no longer deletes the state mark. The busy idiom a host actually writes — `children={isBusy && <Spinner/>}` — passes `false` when it is not busy, and `false` is neither `null` nor caught by `??`, so all three indicators took the children path, rendered nothing in it, and dropped the checkmark, the checkbox tick and the radio dot on every selected row. They now use `isRenderable`, so only children that actually render replace the mark. `0` still counts as content, since it renders the character "0".

CheckIndicator's children slot also reserves the glyph's box and carries its color, so swapping a Spinner in no longer shifts the row or loses the disabled shade.

Fixes #4893.

@cixzhang
