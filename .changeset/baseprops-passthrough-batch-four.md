---
'@astryxdesign/core': patch
---

[fix] Forward pass-through props on six more BaseProps components (Layout, MetadataList, NavHeadingMenuItem, RadioList, TimeInput, TopNavMegaMenuItem)

Six components declared `extends BaseProps` but destructured a closed set of props and never spread a rest object, so everything they did not name — `aria-*`, `id`, `data-*`, and event handlers — type-checked, was accepted, and silently never reached the DOM. This is the same defect class #5254 reported and #5288, #5493, and #5563 fixed in three batches; these six were not in that issue's list (it was compiled against the 0.4.5 tarball) and survived the sweep.

Each component now forwards the rest object to the element that owns its contract: the `Layout` and `MetadataList` root, the `NavHeadingMenuItem` and `TopNavMegaMenuItem` item element (both drawer and default modes, including consumer `className`/`style`/`xstyle` composition and drawer-mode `tabIndex`), the `RadioList` radiogroup, and the `TimeInput` input on both its typed and native-picker paths. Where the component already owns a handler for the same event, the handlers are composed with `composeEventHandlers` component-first, so owned behavior (focus normalization, arrow-key stepping, blur reconciliation) always runs and cannot be cancelled by a consumer `preventDefault()`; a consumer handler runs after it, and does not observe events the owned handler consumed (the stepping arrows on the typed path; the native-picker path owns no keydown, so a consumer `onKeyDown` always fires there). A caller `id` is honored via `id ?? generatedId` (the `Selector` precedent), and a caller `aria-describedby` is composed additively with the component-owned description ids. Other contract-owned attributes (`role`, computed `aria-labelledby`, the roving `tabIndex`) stay after the spread so a pass-through cannot clobber them.

`PowerSearch` and `MultiSelector` have the same shape and are deliberately left out: `PowerSearch` is a composite of a Tokenizer, a listbox, and an edit popover where the pass-through target is an API decision, and `MultiSelector` should follow the `Selector` trigger-forwarding precedent in a change of its own. Both are noted in the PR rather than guessed at here.

@harjothkhara
