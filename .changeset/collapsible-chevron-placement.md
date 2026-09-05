---
'@astryxdesign/core': patch
---

[feat] `Collapsible` and `CollapsibleGroup` accept `chevronPlacement`, moving the disclosure chevron to the start of the trigger or dropping it. The default stays `'end'`, the trailing indicator, and nothing about it changes. `'start'` puts the arrow ahead of the label, which is the tree and file-browser convention and what you want when the labels form a scannable column the arrows sit in front of — previously the only components with a leading arrow were `TreeList` and the Table row-expansion column, so a card or accordion header had no way to match them. (#5993)
@ernestt

The side changes the glyph, not just the order. A trailing chevron points down and flips up; a leading one points into the row and turns down, so `'start'` swaps `chevronDown` for `chevronRight` and rotates a quarter turn instead of a half. That matches `TreeList`, including its RTL mirroring, so a closed arrow points towards the content in both directions.

Set it on the group when there is one: arrows that change sides row to row read as a bug, so `CollapsibleGroup` carries it through the same presentation context as `hasDividers` and `density`. An individual `Collapsible` still wins over the group, and a collapsible nested inside an item's body keeps its own default rather than inheriting the group's.

`'none'` draws no chevron and gives the trigger the whole button. It is for a trigger that carries its own affordance and would otherwise show two: a category icon that becomes an arrow under the pointer, a caret drawn into a graphic, a control that reads as openable on its own. Until now the chevron was unconditional, and because StyleX has no child selectors there was no way to reach it from outside — the only way out was to stop using `Collapsible` and hand-roll the `aria-expanded`/`aria-controls` pair, which is exactly the wiring worth not hand-rolling. The semantics are untouched: the trigger is still a button with `aria-expanded`, so the state stays legible to assistive tech whether or not anything is drawn. What you do give up is the one thing on screen that said "this opens", so the trigger has to say it instead.

It is one prop rather than a side plus a `hasChevron` boolean because a side and "no chevron" cannot both be true, and two props would let a caller write it.

A chevron that leads — or is absent — also makes the label fill the rest of the row. The trigger is `space-between`, which separates the label and a trailing arrow on its own; with nothing trailing the label there is no second child to absorb the free space, so an unfilled label would be thrown to the opposite edge with a gap behind it. Filling it also gives a trigger that spreads its own contents — `hAlign="between"` and the like — the whole row to spread across.
