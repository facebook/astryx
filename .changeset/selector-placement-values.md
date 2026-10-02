---
'@astryxdesign/core': patch
---

[feat] `Selector`'s `placement` prop now accepts `'overlay'` and `'offset'` alongside the four directions, and the `SelectorPlacement` type is exported. `'overlay'` names the default selected-item overlay (the open menu pulled up so the selected option sits over the trigger), which until now was only reachable by omitting the prop; it still falls back to `'offset'` when `hasSearch` is set. `'offset'` names the menu that clears the trigger by the standard menu gap instead of overlaying it; it currently opens in the same position as `'below'`, with the same flips near viewport edges. No behavior changes for existing code: omitting `placement` still means the overlay, and the four directions work as before.

@AKnassa
