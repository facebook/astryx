---
'@astryxdesign/cli': patch
---

[fix] init: tell an app that already had Tailwind not to adopt the bridge

`detectStylingSystem` could not tell a project built around Astryx from one that
had Tailwind and its own design tokens long before Astryx arrived — both are
`tailwindcss` in `package.json`. Both were handed the same rule: reach for
`bg-surface` and `text-primary` "via tailwind-theme.css".

In the second kind of app that rule is wrong twice over. Those class names do
not exist there, and the file it names declares ~25 of Tailwind's own theme
variables plus the shadcn vocabulary, so adding it re-points utilities the app
is already using, everywhere. Whether the project imports the bridge is the
signal that separates the two, so `init` now reads the stylesheet as well as the
dependency list, and an app that owns its utility layer is told to use its own
token classes and to leave the bridge alone.

The `never override --color-* in :root` rule also gains the one exception it
needs there: a theme's tokens are set on the element carrying
`data-astryx-theme`, so an app keeping a name it already owned has to re-assert
it on that boundary — with the colour's partner, since `--color-accent` without
`--color-on-accent` produces a button nobody can read.

@nynexman4464
