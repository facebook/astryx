---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[feat] `astryx theme template` writes an annotated theme template into your project.

New sibling of `theme add`: where `add` starts you from a theme we ship, `template` starts you from a blank annotated one. `astryx init --features theme` calls the same leaf, so project setup writes it too — it previously printed a one-line hint and wrote nothing, which is the weakest form of the help a theme author needs, since the first problem is not knowing the command but not knowing what the theme surface contains. The file is `theme.template.ts`: every `defineTheme` field with a note on when to reach for it, the token families, the component override syntax, and the consumption steps (providing the theme, loading the fonts you name, building for SSR), each section naming the CLI command that prints its authoritative reference. An existing file is never clobbered.

This came out of a vibe test (#5047): agents given an annotated template reached twice as far into the theme surface as agents given only the docs (17 component targets vs 8, and the only arm to use interaction states, custom variants and `onDark`), and shipped a third of the contrast defects.

A template that lies is worse than no template, so its claims are machine-checked against live sources rather than trusted: `scripts/check-theme-template.test.mjs` fails when a `defineTheme` field is added and left undocumented, when a token family is missing from the inventory, when a CSS variable or component key it names does not exist, when it cites a docs topic that does not, or when a theme source drops its SYNC reference. `theme build` compiles it warning-free in CI, and the CLI typecheck now covers it.

@cixzhang
