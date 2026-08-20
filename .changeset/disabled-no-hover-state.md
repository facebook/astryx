---
'@astryxdesign/core': patch
---

[fix] Disabled elements no longer light up under the pointer

`:hover` keeps matching a disabled control — browsers suppress its events, not
its styling — so a hover treatment written for the enabled element was still
painted under the pointer. StyleX does not take it away by accident either: a
`disabled` style setting `backgroundImage: 'none'` overrides the DEFAULT
condition only, leaving the variant's `:hover` class to win the moment the
pointer arrives. Button shipped exactly that, in every variant, and it reached
eleven components that render a Button.

Every self-`:hover` selector in core and lab now carries a zero-specificity
guard (`:hover:where(:not(:disabled,[aria-disabled="true"]))`), and so does
every `:hover` a theme authors through `components`, so a theme override cannot
reintroduce it library-wide. `:where()` adds no specificity, so existing hover
overrides still weigh exactly what they weighed.

Two new gates keep it that way: `@astryx/no-hover-on-disabled` (autofixable)
rejects an unguarded hover at author time, and a Chromium sweep forces `:hover`
on every disabled element in every story and fails on any painted difference —
the invariant is invisible to jsdom, which has neither a pointer nor a cascade.

@cixzhang
