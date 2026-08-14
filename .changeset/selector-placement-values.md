---
'@astryxdesign/core': patch
---

[feat] `Selector`'s `placement` prop now accepts `'overlay'` and `'offset'` alongside the four directions, and the `SelectorPlacement` type is exported. `'overlay'` names the default selected-item overlay — the open menu pulled up so the selected option sits over the trigger — which until now was only reachable by omitting the prop; it still falls back to offset positioning when `hasSearch` is set. `'offset'` places the menu clear of the trigger by the standard menu gap and leaves the direction to the layer, so it can flip near a viewport edge instead of committing to a side the way `'below'` does. No behavior changes for existing code: omitting `placement` still means the overlay, and the four directions work as before.

@AKnassa
