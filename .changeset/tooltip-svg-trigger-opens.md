---
'@astryxdesign/core': patch
---

[fix] Tooltip: an icon-only trigger now opens instead of throwing. The layer passed its trigger to `showPopover` as the invoker `source`, which the Popover API declares as an `HTMLElement`; a caller-rendered icon is an `SVGElement`, whose dictionary conversion throws before the popover opens, so the hint never appeared. An icon trigger now reaches `showPopover` without a source — positioning is unchanged, since the layer is anchored by its anchor-name pair, and only the invoker's focus order is given up.

@rapsealk
