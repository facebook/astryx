---
'@astryxdesign/core': patch
---

[fix] Document the full themeProps() selector surface and guard it against drift (#3741)

`theming.targets` is the documented CSS surface of a component — the stable `astryx-*` classes it renders and the visual props it reflects as data attributes. It was hand-authored while the truth lived in `themeProps()` calls in the source, and nothing kept the two in agreement, so it drifted twice (#3652, #3680) and was drifted again.

Eight components were under-documenting their surface: `Table` documented 4 of the 9 classes it renders (`astryx-table`, `-scroll-wrapper`, `-header`, `-body`, `-footer` were all missing), and `AvatarGroup`, `CommandPalette`, `InputGroup`, `Outline` and `ProgressBar` each hid one. `AspectRatio`, `Card` and `EmptyState` documented their visual props in `docs` but not in `docsZh`. An undocumented class is an unthemeable element: theme authors and codegen read `targets[]` to learn which selectors exist.

`themingTargets.test.ts` now parses every `themeProps()` call site with the TypeScript AST and fails when a rendered class or a passed prop key is missing from `targets[]` — in both the `docs` and `docsZh` blocks. It sits next to `derivedVarRegistry.test.ts`, which already validates the sibling `vars`/`derived` fields of the same `theming` block; `targets` was the one field with no machine check. The policy is subset, not equality: docs may list more than the source passes, since components forward props they don't themselves reflect.

@AKnassa
