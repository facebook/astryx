---
'@astryxdesign/core': patch
---

[fix] `useListFocus` no longer swallows Escape when no `onEscape` was supplied. The hook called `preventDefault()` on every Escape — a habit inherited from the arrow keys, which share the handler and need it to suppress page scroll — so a list with nothing to dismiss still marked the key handled, and a surrounding layer that defers to `defaultPrevented` (a focus trap, a native popover) never got its turn. Escape is now consumed only when an `onEscape` is passed. Arrow, Home and End handling is unchanged.

Behaviour change: `AvatarGroup`, `ButtonGroup`, `Outline`, `Pagination`, `SegmentedControl`, `TabList` and `Toolbar` pass no `onEscape`, so an Escape pressed inside one of them now reaches the surrounding layer and can dismiss it — the point of the fix, but a host that counted on the key stopping there will notice. `NavHeadingMenu` does the same when it renders without a menu close handler. Menus and flyouts that do pass `onEscape` are unaffected. `patch`, not `[breaking]`: the swallowing was never a contract — the hook documented Escape only as "custom callback", and no component advertised consuming the key.

@cixzhang
