---
'@astryxdesign/core': patch
---

[experimental] PowerSearch gains a touch surface behind `experimental={{presentation: 'bottom-sheet' | 'adaptive'}}`. `bottom-sheet` makes the whole field one trigger showing display-only filter tokens, and moves filter editing into a flow of tall modal sheets: a Filters sheet listing the active filters as rows with Add filter, Done, and Clear all; an Add filter sheet with the fields grouped (searchable from eight fields), or the content search with the field typeahead's suggestions listed inline; and a value step that stages field → operator → value and confirms from its footer, with Remove while editing. Closed vocabularies are full-width rows, numbers stage as typed, and `string_list` / `entity_list` values edit through the Tokenizer's own sheet presentation titled with the field label. `adaptive` uses the sheet on compact coarse-pointer screens and the popover otherwise, resolved the same way Selector resolves it. The sheet flow loads on demand, so a PowerSearch that does not opt in does not carry it. New `@astryx.powersearch.sheet.*` catalog keys for the sheets' strings; no new theming target. Anything inside PowerSearch's `experimental` prop may change or be removed in a patch release; omitting it keeps the stable behavior.

@imdreamrunner
