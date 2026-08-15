---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[fix] Heading's `type` is a documented theming target, and the docs stop teaching a CSS variable that does not exist.

`Heading` reflects `type` as a theme selector — `typography.scale` generates `heading: {'type:display-1' …}` rules for it — but `theming.targets` listed only `level` and `color`, so `astryx theme build` warned `Unknown prop "type" on component "heading"` on every theme that sets a type scale, including the shipped `neutralTheme`. The drift guard missed it twice over: it read a conditional spread (`{level, color, ...(type && {type})}`) as an unknown bag, and it only checked a component against a doc file in its own directory, so `Heading/` — documented from `Text/Text.doc.mjs` — was never checked at all. Both are fixed, which brings three more previously unchecked directories under the guard.

Separately, the theme docs' component-override example set `--button-press-scale`, which no component defines: copying it produces CSS that silently never applies. It now sets a real public var, and the example no longer declares the same `button` key twice.

@cixzhang
