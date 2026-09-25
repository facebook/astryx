---
'@astryxdesign/cli': minor
---

[breaking] Remove the `layout` command. `astryx layout expand`, `astryx layout check` and `astryx layout grammar` are gone, together with the `layoutExpand`, `layoutCheck` and `layoutGrammar` functions exported from `@astryxdesign/cli/api`, their `layout.expand`, `layout.check` and `layout.grammar` response types, and the command's docs. It was experimental and is not used.

There is no replacement and no codemod: a layout expression has no equivalent command to move to. Build the page from `astryx template <name>` and `astryx component <Name>` instead. The expression engine itself is unchanged and still public as `@astryxdesign/cli/xle` (`checkExpression`, `expandExpression`), so a caller that wants the expansion can keep it by calling that barrel with its own registry.

Two pieces of the surface deliberately stay. The `ERR_LAYOUT_PARSE` and `ERR_LAYOUT_INVALID` error codes remain registered, because a shipped code is never removed, and both still describe what the retained `@astryxdesign/cli/xle` engine reports.

The `experimental.xle.components` config key is also still accepted, but **it now has no effect**: its only reader was the deleted layout command, so setting it does nothing. Whether the key is kept as explicitly inert or removed with its own migration is not settled here. Until it is, do not expect a value in that key to be read.

@josephfarina
