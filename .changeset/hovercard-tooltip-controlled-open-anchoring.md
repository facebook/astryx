---
'@astryxdesign/core': patch
---

[fix] `HoverCard` and `Tooltip`: a controlled `isOpen={true}` (or `isDefaultOpen`) no longer strands the layer in the viewport corner when its trigger mounts with no layout box yet, e.g. inside a `Dialog` that hasn't called `showModal()` yet.

`Dialog` mounts its children before it opens (`isOpen` gates `showModal()`, not rendering), so a `HoverCard`/`Tooltip` inside one with a controlled `isOpen={true}` set from the start runs its show effect while the trigger is inside a still-non-modal `<dialog>` and has no box. A trigger with no box isn't a valid CSS anchor: the popover's `position-anchor` resolves to its fallback position, the viewport corner, and — unlike a live layout change — that resolution doesn't get revisited once the trigger later gets a box when the dialog actually opens. The popover stays stuck there for the rest of that open.

`Layer`'s own `show()` now waits for the trigger to actually have a layout box (immediately, if it already does) and for any running, finite ancestor animation to settle, before resolving the popover's anchor. The wait races two signals — a `ResizeObserver` on the trigger, and a bounded `requestAnimationFrame` poll of its own `getBoundingClientRect()` — because a `ResizeObserver` reliably delivers no entry at all for a purely `display: inline`, non-replaced box, which is exactly the shape a text-only Tooltip/HoverCard trigger's wrapper `<span>` is; relying on it alone left that case waiting forever rather than just resolving late. Every context-mode caller (`HoverCard`, `Tooltip`, and anything else built on `useLayer`) gets this for free, since it lives in the one place every context-mode `show()` funnels through rather than in each caller's own effect.

@HelloOjasMutreja
