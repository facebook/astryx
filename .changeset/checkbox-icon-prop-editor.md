---
'@xds/core': patch
---

`renderIconSlot` now renders semantic icon-name strings through `XDSIcon`, so icon slots that accept semantic names display the registry icon instead of plain text. The core Icon package also exposes `XDS_ICON_NAMES`, a canonical semantic icon-name list derived from the default icon registry for tooling and docs controls.
