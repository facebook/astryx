---
'@xds/core': minor
'@xds/cli': patch
---

`XDSDropdownMenuItem`, `XDSContextMenuItem`, and `XDSSelectorOption` now use `endContent` for trailing badges, status icons, shortcuts, and other end-aligned content. The previous trailing-content `children` prop has been removed while the package is still prerelease.

`xds upgrade` includes `migrate-item-children-to-endcontent`, which moves `<XDSDropdownMenuItem>...</XDSDropdownMenuItem>`, `<XDSContextMenuItem>...</XDSContextMenuItem>`, `<XDSSelectorOption>...</XDSSelectorOption>`, and `children={...}` usage to `endContent={...}`.
