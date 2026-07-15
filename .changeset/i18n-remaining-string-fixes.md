---
'@astryxdesign/core': patch
---

[feat] The last set of user-facing strings across the core components — Breadcrumbs, Chat, ContextMenu, date/time inputs, Link, mobile/side/top nav helpers, Outline, PowerSearch, Resizable, Selector, MultiSelector, Typeahead, and Table pagination — are now translatable.

[visible change] Placeholder strings that used `...` (three ASCII dots) are normalized to `…` (Unicode ellipsis, U+2026) in the shipped English catalog — matching the ellipsis already used elsewhere. Consumers who snapshot-test on the exact three-dot form will see a diff; consumers passing an explicit `placeholder` prop are unaffected.

@nynexman4464
