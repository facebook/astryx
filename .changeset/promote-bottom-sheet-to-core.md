---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[component] Promote `BottomSheet` and `BottomSheetSwitcher` from the canary-only Lab package to Core. The stable package now includes their native-dialog, drag-detent, transition, and mobile-keyboard behavior, Core documentation and examples, and an `astryx upgrade` codemod that moves Lab imports to `@astryxdesign/core/BottomSheet`.

@imdreamrunner
