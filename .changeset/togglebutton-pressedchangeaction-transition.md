---
'@astryxdesign/core': patch
---

[fix] ToggleButton runs pressedChangeAction in an interruptible transition with optimistic state
@cixzhang

`pressedChangeAction` was fired as a non-awaited promise, so the documented
loading spinner never appeared and the toggle ignored the action's lifecycle.
It now runs inside a transition with an optimistic pressed state, matching
`Switch`:

- The optimistic pressed state flips immediately on click; the spinner is
  debounced so a fast action shows the new state without a spinner flash.
- The action is interruptible — clicking again while it is pending starts a
  new transition with the next optimistic state (e.g. true -> false -> true),
  instead of being dropped or guarded out.
- Synchronous handlers are supported too: a `pressedChangeAction` (or
  `onPressedChange`) that synchronously triggers a suspending update, such as
  a router navigation that suspends on data, also drives the pending state.
  `pressedChangeAction` now accepts `void | Promise<void>`.
