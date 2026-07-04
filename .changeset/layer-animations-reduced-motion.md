---
'@astryxdesign/core': patch
---

[fix] Layer/popover entry animations now honor `prefers-reduced-motion`. The shared layer slide/scale keyframes (used by DropdownMenu, Popover, HoverCard, Tooltip, Selector, and other popover surfaces) and the `useEntryAnimation` presets disable their keyframe animation under `prefers-reduced-motion: reduce`, so layers appear instantly instead of translating/scaling in (#3343).
@cixzhang
