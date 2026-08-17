---
'@astryxdesign/core': patch
---

[fix] Overlays share one dismissal stack, so a single Escape dismisses exactly one layer. Every overlay used to own its own Escape listener, which meant one press could close a popover _and_ the Dialog hosting it, or a modal _and_ the modal it was opened from. `useLayerDismissal` replaces that with a single stack: the stack owns one listener, routes each press to the top-most layer, and suppresses the browser's own close-watcher so nothing dismisses twice. A layer declares what it does with a press via `escapeBehavior` — `close` (default) or `block`, for a `required` Dialog that must swallow the press without closing so nothing behind it dismisses either. Fixes a Tooltip inside a Dialog closing the Dialog rather than the tip, and a HoverCard trigger swallowing Escape whenever it merely had focus. Dismissals the browser starts on its own — the Android back gesture, the platform close watcher — still close a Dialog, and follow the same top-most rule. Top-most is resolved from React-tree nesting (which survives portals) rather than DOM containment alone.

@freddymeta
@cixzhang
