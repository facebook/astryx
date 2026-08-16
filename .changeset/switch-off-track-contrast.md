---
'@astryxdesign/core': patch
'@astryxdesign/theme-neutral': patch
'@astryxdesign/theme-stone': patch
'@astryxdesign/cli': patch
---

[fix] The Switch off track is now derived from the thumb, so the two cannot converge. The thumb paints `--color-background-surface`; the off track painted `--color-background-gray`, a separate token nothing keeps apart from it. Measured in Chrome from rendered pixels, theme-neutral's own switch put its thumb at **1.48:1** against its off track in light and **1.94:1** in dark — under the 3:1 WCAG 1.4.11 asks of a control boundary, with no custom palette involved. The stock tokens are worse (1.55:1 light, **1.17:1** dark): an app that adopts Astryx and themes nothing ships a switch whose off state reads as an empty pill.

The off track is now `color-mix(in srgb, var(--color-background-surface), var(--color-text-primary) 55%)` — the surface the thumb already uses, pushed most of the way to the theme's own text colour. Because both ends come from the same theme, a switch stays in its palette's colours and the pair is separated by construction rather than by two token values happening to stay apart. Measured after the change: 4.17:1 / 4.76:1 stock, 4.00:1 / 5.44:1 neutral, 3.58:1 / 5.53:1 stone, 3.56:1 / 5.40:1 y2k (light / dark). The on state is untouched.

Neutral and Stone each carried a local `switch` override redefining `--color-background-gray` to reach for a "defined channel" of their own; both are removed, since the default now does it and neither override cleared 3:1. This does change the off-state colour of every existing theme — a theme that wants the old wash back, or a different channel entirely, can set `backgroundColor` on the `switch` theming target.

@cixzhang
