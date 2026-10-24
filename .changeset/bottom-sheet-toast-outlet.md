---
'@astryxdesign/core': patch
---

[fix] Toasts stay visible and clickable above an open BottomSheet. The `ToastViewport` from `LayerProvider` (or the one `useToast` mounts on its own) now moves into a standalone BottomSheet while it is open, as it already does into an open Dialog, and back as soon as the sheet starts closing. Before, the sheet covered the viewport and made it inert, so a click on a toast's action landed on the sheet instead and could dismiss it. A sheet with `hasScrim={false}` is not modal and leaves the viewport in place. Sheets inside a `BottomSheetSwitcher` are unchanged.

@vjeux
