---
'@astryxdesign/core': patch
---

[fix] Round the trailing corner of the last ButtonGroup member, even when it renders a layer (#2508)

ButtonGroup keyed its trailing border-radius off `:last-child`. But several members render an invisible layer element _after_ their button — a `Button` with a `tooltip` returns `button + tooltip layer`, and `DropdownMenu` returns `trigger + popover`, both rendered inline by `useLayer` rather than portaled. The layer took the `:last-child` slot, so the real trailing button silently kept square outer corners and the group ended in a flat-edged stub.

Layers always carry the native `popover` attribute, and a popover is never an in-flow member of the group. So the trailing radius now keys off `:not(:has(~ *:not([popover])))` — "no following element sibling that isn't a popover". Any sibling the group doesn't recognise still counts as a member, exactly as `:last-child` did. The leading edge still uses `:first-child`, which was never affected.

This also fixes the plain case of a tooltip'd icon button at the end of a toolbar group, and makes `<ButtonGroup><Button /><DropdownMenu /></ButtonGroup>` compose as a single connected control.

Browser note: the trailing radius now depends on `:has()`. This is not a new floor for the package — shipped CSS already relies on `:has()` (`InputGroup`, `Layout`'s edge compensation) — but it does change how ButtonGroup degrades: on browsers without `:has()` support (Firefox < 121), the trailing corner falls back to square for every member, where the no-layer case previously rounded. The degradation is cosmetic and graceful; nothing overflows or overlaps.

@AKnassa
