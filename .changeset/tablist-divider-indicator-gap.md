---
'@astryxdesign/core': patch
---

[fix] TabList `hasDivider` reserves a gap so the hover pill and adjacent buttons no longer touch the underline

A divided TabList now reserves 4px between the tabs and the divider rail. The hover highlight sits clear of the underline, and a same-size Button placed alongside the tabs aligns to the tab baseline instead of butting the rail — so a `md` tab strip pairs with a `md` button. The selected indicator still rests on the rail. Non-divided tab lists are unchanged. TabList inside a `Toolbar` with `dividers={['bottom']}` gets the same alignment via the toolbar's own spacing.

@ernestt
