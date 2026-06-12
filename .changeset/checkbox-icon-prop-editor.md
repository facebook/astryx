---
'@xds/core': patch
---

`renderIconSlot` now renders semantic icon-name strings through `XDSIcon`, so icon slots that accept semantic names display the registry icon instead of plain text. The core Icon package also exposes `getIconRegistry()`, letting tooling and docs controls derive semantic icon-name options from the same registry `XDSIcon` resolves against.
