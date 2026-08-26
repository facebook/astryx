---
'@astryxdesign/core': patch
---

[fix] Seven components now forward the pass-through props promised by `BaseProps`

`MetadataListItem`, `NavHeadingMenu`, `Timestamp`, `Token`, `TopNavMegaMenu`, `TopNavMenu`, and `TypeaheadItem` now forward neutral `aria-*`, `id`, `tabIndex`, event-handler, and `data-*` props to their rendered DOM element. Styling still merges through `mergeProps`, contract-owned attributes retain precedence, and owned handlers compose through `composeEventHandlers` with the caller first.

`MetadataListItem` targets its wrapper `<div>` when stacked and its `<dt>` when inline. A `TypeaheadItem` backed by caller-supplied `item.element` remains unchanged and does not receive forwarded props because that value may not be a cloneable element.

This completes [#5254](https://github.com/facebook/astryx/issues/5254) after [#5288](https://github.com/facebook/astryx/pull/5288) by @lexs landed `List` and `Markdown` first, followed by [#5493](https://github.com/facebook/astryx/pull/5493) by @gonzoblasco for `TreeList`.

@cixzhang
