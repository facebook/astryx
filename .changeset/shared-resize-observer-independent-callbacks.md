---
'@astryxdesign/core': patch
---

[fix] sharedResizeObserver: independent subscriptions per element

The module held **one callback per element** — `callbacks.set(element, callback)` overwrote. A second hook observing the same node silently replaced the first, and either one calling `unobserveResize(element)` blinded the other.

Two hooks on one element is ordinary rather than exotic: a `TabList` root, a `useOverflow` container and a `useTruncation` target are all nodes another hook may reasonably watch.

`observeResize` now returns an unsubscribe that removes only its own registration, and every caller in the package uses it. `unobserveResize(element, callback)` does the same by hand; the callback-less `unobserveResize(element)` still drops every callback on the element and stays for a caller that owns its element outright.

Dispatch iterates a copy of the set, so a callback may unsubscribe while the batch is running without skipping its neighbour.

Prerequisite for AST-010 §Implementation-requirements 9, kept separate so it is reviewable on its own. No component behaviour changes: 8534 core tests pass, and the four new observer tests each fail against the old module.

@freddymeta
