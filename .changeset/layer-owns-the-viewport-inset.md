---
'@astryxdesign/core': patch
---

[feat] The layer runtime owns the viewport inset: one gutter, one cap, one fallback order, and one place an app declares a floating bar.

Every anchored layer — Popover, DropdownMenu and its submenus, Typeahead, Tooltip, HoverCard, the selectors — now keeps the same gutter from each viewport edge (the spacing-4 step or the device safe-area inset, whichever is larger) and is capped to the viewport. Four components used to carry their own copies of that gutter, and they had drifted.

- An explicit `width` on `Popover` and `menuWidth` on `DropdownMenu` or `Typeahead` render at their size up to the viewport. They used to be capped to the room beside the trigger, so a 352px menu opened from a control near a panel edge rendered 274px wide.
- A layer that does not fit beside its trigger flips; one that fits on neither side keeps its size and slides into view while its trigger is on screen. Once the trigger has left the viewport the layer holds its position and size instead of chasing the edge.
- An app that floats a persistent bar over a viewport edge — a phone navigation bar — declares it once, as `inset` on the `LayerProvider` it already mounts: `<LayerProvider inset={{blockEnd: 56}}>`. Every anchored layer then ends above the bar, and the toast viewport rises by the same amount, so one bar is declared once for both. Every edge defaults to zero, so nothing moves by default; an existing `toast.inset` keeps its meaning as the toast-only override.

One additive prop (`LayerProvider.inset`, type `LayerInset`); no other prop, type, or default changes. `spec:AST-059` holds the decisions; the `Core/Layer` stories show each behavior.

@cixzhang
