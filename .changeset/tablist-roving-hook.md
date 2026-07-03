---
'@astryxdesign/core': patch
---

[refactor] TabList now uses `useListFocus`'s built-in roving-tabindex support (`hasRovingTabIndex`) instead of a hand-rolled tab-stop repair effect. The hook owns the single tab stop — stamping tabindex 0/-1, repairing it on mount and as stops mount/unmount or toggle disabled, and keeping it in sync after clicks/programmatic focus via `handleFocus` on the nav. Individual Tabs still render `tabIndex={isSelected ? 0 : -1}` as the initial source of truth, which the hook's repair preserves. No behavior change.
@cixzhang
