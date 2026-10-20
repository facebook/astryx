---
'@astryxdesign/core': patch
---

[feat] `BottomSheet` locks page scroll by CSS instead of pinning `<body>` from script. Every sheet dialog — a standalone `BottomSheet` or a `BottomSheetSwitcher` flow — now carries `data-sheet-dialog`, and one stylesheet installed once per document freezes the page's scroller exactly while a sheet dialog is modal: it engages the instant `showModal()` runs, holds through a flow's handoffs and beneath a `Dialog` opened from a sheet, and releases with the last modal sheet dialog, with no counter, no saved scroll position, and no inline `position`, `top`, or `overflow` styles on `<body>`. The rule freezes the root, or `<body>` on a page whose `<body>` owns the viewport scroll (`html, body { height: 100% }` with a non-visible `body` overflow, for example), so the page keeps its offset either way. A classic scrollbar's gutter is held open (`scrollbar-gutter: stable`) only when the scrollbar took layout space when the sheet was presented, so a page that does not scroll gets no undimmed strip beside the backdrop; where the engine has no `scrollbar-gutter` (Safari before 18.2), `<body>` is padded by the width it grew, as the shared scroll-lock hook already does.

Public props, defaults, and exports are unchanged. Two observable details change: `window.scrollY` keeps reading the page's offset while a sheet is open (it used to read `0` while the body was pinned, and was restored by script on close), and a page that scrolls a nested element rather than the viewport is no longer pinned by the sheet; the sheet's own content still contains its scroll.

@imdreamrunner
