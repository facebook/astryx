---
'@astryxdesign/core': patch
---

[feat] Reflect layer open state via data-state="open|closed" (#3240)

Every layer rendered through useLayer — Tooltip, HoverCard, Popover, ContextMenu, Tokenizer overflow, keyboard hints — now carries a `data-state` attribute that flips between `open` and `closed`. This gives test tooling and styling a stable, non-hashed anchor for open-state assertions that works even without a Popover-capable engine (e.g. jsdom), completing the second follow-up deferred from #3240.
@arham766
