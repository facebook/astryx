---
'@astryxdesign/core': patch
---

[component] Add `BottomSheetStack`, imported from `@astryxdesign/core/BottomSheet` or the package root. It stacks the sheets of a drill-in flow in one shared native dialog: every `BottomSheet` (`isOpen` / `onOpenChange`) and `BottomSheetSwitcher` (`activeSheet` / `onActiveSheetChange`) rendered anywhere under the stack is one level, through wrapper components, DOM wrappers, Suspense, Activity, providers, and mapped lists alike. Levels stack in tree order; only the top level is interactive, while covered levels stay mounted, inert, and visibly receded. Escape, a scrim tap, and a swipe close only the top level, through that level's own callback and as its `purpose` allows. Focus moves into each new top level and returns to the opener when the stack closes. A sheet opened inside a `Dialog`, `AlertDialog`, or popover layer above the stack stays a standalone sheet, and a nested `BottomSheetStack` merges into the outer one.

The change is additive: `BottomSheet` and `BottomSheetSwitcher` keep their props, types, and behavior outside a stack, and their only new behavior is as a level inside one.

@imdreamrunner
