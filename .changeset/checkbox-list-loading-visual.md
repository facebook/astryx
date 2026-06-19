---
'@xds/core': patch
---

`XDSCheckboxList` now gives visual feedback while loading. When `isLoading` is set (or a `changeAction` promise is pending), items are dimmed (reduced opacity) in addition to the existing `aria-busy` and blocked interaction. Previously the loading state was only conveyed to assistive tech, with no visible change. JSDoc and component docs were corrected to match the implemented behavior.
