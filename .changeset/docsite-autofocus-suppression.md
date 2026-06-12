---
'@xds/core': patch
---

Suppress documentation-preview autofocus for inline dialogs. `XDSDialogHeader` now skips its title autofocus when rendered inside `XDSDialog isInline`, preventing component examples from stealing page scroll. `XDSCommandPaletteInput` now reads the same dialog inline context instead of carrying a duplicate inline flag in CommandPalette context.
