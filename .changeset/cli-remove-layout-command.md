---
'@astryxdesign/cli': minor
---

[breaking] Remove the `layout` command. `astryx layout expand`, `astryx layout check` and `astryx layout grammar` are gone, together with the `layoutExpand`, `layoutCheck` and `layoutGrammar` functions exported from `@astryxdesign/cli/api`, their `layout.expand`, `layout.check` and `layout.grammar` response types, and the command's docs. It was experimental and is not used.

There is no replacement and no codemod: a layout expression has no equivalent command to move to. Build the page from `astryx template <name>` and `astryx component <Name>` instead. The expression engine itself is unchanged and still public as `@astryxdesign/cli/xle` (`checkExpression`, `expandExpression`), so a caller that wants the expansion can keep it by calling that barrel with its own registry.

Two pieces of the surface deliberately stay: the `ERR_LAYOUT_PARSE` and `ERR_LAYOUT_INVALID` error codes remain registered, because a shipped code is never removed, and `experimental.xle.components` is still an accepted config key.

@josephfarina
