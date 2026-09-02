---
'@astryxdesign/core': patch
---

[fix] `HoverCard` and `Tooltip`: a controlled `isOpen={true}` (or `isDefaultOpen`) no longer strands the layer in the viewport corner when its trigger mounts with no layout box yet, e.g. inside a `Dialog` that hasn't called `showModal()` yet.

`Dialog` mounts its children before it opens (`isOpen` gates `showModal()`, not rendering), so a `HoverCard`/`Tooltip` inside one with a controlled `isOpen={true}` set from the start runs its show effect while the trigger is inside a still-non-modal `<dialog>` and has no box. A trigger with no box isn't a valid CSS anchor: the popover's `position-anchor` resolves to its fallback position, the viewport corner, and — unlike a live layout change — that resolution doesn't get revisited once the trigger later gets a box when the dialog actually opens. The popover stays stuck there for the rest of that open.

Both hooks' show-on-mount and controlled-open effects now wait for the trigger to actually have a layout box (immediately, if it already does) before calling `layer.show()`, via a small shared `showWhenAnchored` helper in `Layer/`.

@HelloOjasMutreja
