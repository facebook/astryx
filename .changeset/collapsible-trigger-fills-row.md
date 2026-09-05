---
'@astryxdesign/core': patch
---

[fix] `Collapsible`'s trigger label now fills the row instead of hugging its own content, so a composed trigger can put something at the far edge next to the chevron. The trigger is a `space-between` flex row, but its label span had no `flex-grow` — so the free space collected between the label and the chevron, and a trigger built as `<HStack>` with a right-hand element (a date, a count, a status) had that element parked against the label with a gap after it, unable to reach the edge that `space-between` implies. `flexGrow: 1` on the label is the whole change. For a plain text trigger nothing moves: the label was already flush to the start edge and the chevron to the end, and the box that grew is one the text does not fill. The flex floor is deliberately left at `auto`, so no label can now be squeezed narrower than its own content and start overlapping the chevron. (#5933)
@ernestt
