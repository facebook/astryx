---
'@astryxdesign/core': patch
---

[feat] Tokenizer is now an InputGroup-compatible control (#3520). Inside an `InputGroup` it consumes `InputGroupContext` instead of rendering its own `Field`, so the group owns the single label, description, and status chrome — no more duplicated label or nested field wrapper. The typeahead input is named by the group label plus the Tokenizer's own label (composed with `getInputARIA`, so `aria-describedby` merges the group's description/status with the input-local disabled reason rather than replacing it), and the control adopts the shared `groupStyles.inGroup` border/radius treatment so it joins the group's seam. Because the group is a fixed-height single-line surface, a grouped Tokenizer keeps its tokens on one scrolling row instead of wrapping past the shared border — cap selections with `maxEntries` or summarize them with `tokenOverflowBehavior`.

@AKnassa
