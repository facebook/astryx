---
'@astryxdesign/core': patch
---

[fix] Layer: floating layers now set their own body type size and line height, beside the font family they already set. A layer's DOM position is incidental — inline beside its trigger, or portaled to the nearest safe ancestor — so it used to inherit type size from wherever it happened to sit: the same HoverCard rendered 13px from a caption and 16px from prose. Tooltip, DropdownMenu, ContextMenu and any consumer that sets its own size through `xstyle` are unaffected; content that wants a different size still sets one. Follows [#5039](https://github.com/facebook/astryx/pull/5039), which fixed where a layer is hosted but not what it inherits there.
@cixzhang
