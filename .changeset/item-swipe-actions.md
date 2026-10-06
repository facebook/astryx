---
'@astryxdesign/core': patch
---

[feat] `Item` gains swipe actions for touch, per `spec:AST-057`. `swipeActions` declares, per side, the verbs a sideways drag uncovers as `ItemSwipeAction[]` (`{id?, label, icon?, onActivate, isDisabled?, variant?: 'neutral' | 'accent' | 'destructive', hasRemoval?}`, outermost last); `swipeBehavior` is `reveal` (the row rests open with every entry a real button; a long drag or a fling fires the outermost) or `commit` (the row slides out and the outermost fires; nothing rests). After an entry fires the row springs back, or holds out when the entry has `hasRemoval`. A mouse never starts the drag, a mostly vertical drag stays the scroller's, a resting row closes on a pointer outside it. Available on a row whose role permits interactive descendants (a `listitem`, a role-less row); `ListItem` passes both props through. No element is added to a row: its root translates and its panels counter-translate. `List` clips its rows in the inline axis (`overflow-inline: clip`). Types `ItemSwipeAction`, `ItemSwipeActions`, `ItemSwipeActionVariant` and `ItemSwipeBehavior` are exported.

@vjeux
