---
'@astryxdesign/core': patch
---

[chore] Clear the mechanically fixable ESLint suppressions from the Bottom Sheet promotion: `BottomSheet` and `BottomSheetSwitcher` now use the React 19 context APIs (`<Context>` as provider, `use()`), the panel's body-ref callback declares an honest dependency, and `useSheetGestures` reads `prefers-reduced-motion` through the shared `useMediaQuery` subscription so an open sheet follows a preference change.

@imdreamrunner
