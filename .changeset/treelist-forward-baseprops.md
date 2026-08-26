---
'@astryxdesign/core': patch
---

[fix] TreeList: forward `aria-label`/`aria-labelledby` to the `role="tree"` element so a tree can be named

`TreeList` destructured a fixed set of props with no rest spread, so every `BaseProps` attribute (`aria-*`, `role`, `tabIndex`, `id`, event handlers) was dropped and never reached the DOM. A tree without a visible header could not be named at all - a screen reader announced an unnamed tree with no way to know what it was.

The component now spreads the remaining props onto the root element and routes `aria-label`/`aria-labelledby` onto the `<ul role="tree">` itself, so `<TreeList aria-label="File tree">` names the tree. When a visible `header` is rendered, it keeps naming the tree (AT hears the same name the user sees); a consumer-supplied `aria-labelledby` only applies on the headerless path. The contract `role="tree"` is written after the rest spread so a consumer cannot displace it.

@gonzoblasco
